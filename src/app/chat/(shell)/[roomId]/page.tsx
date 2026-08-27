"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MoreHorizontal,
  MoreVertical,
  Phone,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import {
  useMessageListQuery,
  useSendMessageMutation,
} from "@/features/message/message.query";
import type { MessageResponse } from "@/features/message/message.type";
import {
  useLeaveRoomMutation,
  useRoomDetailQuery,
} from "@/features/room/room.query";
import type { RoomListItemResponse } from "@/features/room/room.type";
import { useFileUploadMutation } from "@/features/common/file/file.mutation";
import { publishTyping, subscribeRoom } from "@/util/StompUtil";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatRoomPage() {
  const [file, setFile] = useState<File | null>(null);

  // 내 메시지 말풍선 옆 "..." 버튼을 눌렀을 때 열리는 수정/삭제 메뉴의 대상 메시지 id
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // 현재 열려있는 메뉴 컨테이너(버튼 + 드롭다운)를 가리킴 - 바깥 클릭 감지용
  const menuRef = useRef<HTMLDivElement>(null);

  // 헤더 "더보기" 버튼 -> 채팅방 나가기 확인 모달 표시 여부
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const params = useParams();
  const roomId = params.roomId as string;
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: leaveRoom, isPending: isLeaving } = useLeaveRoomMutation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessageListQuery(Number(roomId));
  const messages = data?.pages.flatMap((page) => page).reverse();
  const { data: room } = useRoomDetailQuery(Number(roomId));

  const { mutate: sendMessage, isPending: isSending } = useSendMessageMutation(
    Number(roomId),
  );

  const { mutate: fileUpload, isPending: isUploading } =
    useFileUploadMutation();

  const isBusy: boolean = isSending || isUploading;

  const [text, setText] = useState<string>("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const topSentinelRef = useRef<HTMLDivElement>(null);

  // 스크롤 최하단으로 가기위한 ref
  const bottomRef = useRef<HTMLDivElement>(null);

  // input="file" 을 제어하기 위한 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [typingUser, setTypingUser] = useState<string | null>(null);

  // 현재 타이핑 하고 있는지 체크하기 위한 ref
  const isTypingRef = useRef(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  // openMenuId가 열려있는 동안 메뉴 바깥을 클릭하면 닫기
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    // 다음페이지가 없으면 return
    if (!hasNextPage) return;

    // IntersectionObserver : 특정요소가 특정 영역(root)안에 들어오는지를 감시하는 브라우저 내장 API
    const observer = new IntersectionObserver(
      ([entry]) => {
        // sentinel이 root 안에 보이거나 이미 다음 페이지를 불러오는 중이 아니라면 다음 페이지 호출
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: scrollContainerRef.current, threshold: 0 },
    );

    const sentinel = topSentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const unsubscribe = subscribeRoom(roomId, {
      onMessage: (body) => {
        const newMessage: MessageResponse = JSON.parse(body);

        queryClient.setQueriesData<InfiniteData<MessageResponse[]>>(
          { queryKey: ["rooms", Number(roomId), "messages"] },
          (old) => {
            if (!old) return old;
            const [firstPage, ...restPages] = old.pages;
            return {
              ...old,
              pages: [[newMessage, ...firstPage], ...restPages],
            };
          },
        );

        queryClient.setQueryData<RoomListItemResponse[]>(
          ["rooms", "list"],
          (old) =>
            old?.map((r) =>
              r.roomId === Number(roomId)
                ? {
                    ...r,
                    lastMessageContent: newMessage.content,
                    lastMessageAt: newMessage.sentAt,
                  }
                : r,
            ),
        );
      },
      onRead: () => {},
      onTyping: (body) => {
        const payload = JSON.parse(body);
        if (payload.senderId === useAuthStore.getState().user?.userId) return;

        setTypingUser(payload.typing ? payload.userId : null);
      },
    });

    return unsubscribe;
  }, [roomId, queryClient]);

  const handleTextChange = (value: string) => {
    setText(value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      try {
        publishTyping(Number(roomId), true);
      } catch {}
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      try {
        publishTyping(Number(roomId), false);
      } catch {}
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) {
        isTypingRef.current = false;
        try {
          publishTyping(Number(roomId), false);
        } catch {}
      }
    };
  }, [roomId]);

  if (!room) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-[#EFF3FB] text-[13px] text-[#8A94A6]">
        존재하지 않는 채팅방이에요.
      </div>
    );
  }

  const handleSend = () => {
    if (isBusy) return;

    // 파일이 있으면 파일 업로드 후 메시지 전송 호출
    if (file) {
      fileUpload(file, {
        onSuccess: (res) => {
          sendMessage(
            {
              messageType: "IMAGE",
              content: text,
              fileId: res.data.fileId,
            },
            {
              onSuccess: () => {
                setText("");
                setFile(null);
              },
            },
          );
        },
        onError: (error) => {
          // TODO
          alert(error.message);
        },
      });
      // 그외에는 메시지만 전송 호출
    } else {
      const trimed = text.trim();

      if (!trimed) return;

      sendMessage(
        {
          messageType: "TEXT",
          content: trimed,
        },
        { onSuccess: () => setText("") },
      );
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom(Number(roomId), {
      onSuccess: () => {
        router.replace("/chat");
      },
      onError: (error) => {
        alert(error.message);
      },
    });
  };

  const isGroup = room.roomType === "GROUP";

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center gap-[12px] border-b border-[#E7EAF0] bg-white px-[20px] py-[12px]">
        <div
          className={`flex size-[38px] shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white ${
            isGroup ? "bg-[#8A94A6]" : "bg-[#5B7FE3]"
          }`}
        >
          {room.roomName?.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[#0B1220]">
            {room.roomName}
          </p>
          <p className="truncate text-[12px] text-[#9AA3B2]">
            {typingUser
              ? `${typingUser}님이 입력 중...`
              : isGroup
                ? `${room.members.length}명 참여 중`
                : "최근 접속"}
          </p>
        </div>
        <div className="flex items-center gap-[4px] text-[#8A94A6]">
          <button
            type="button"
            aria-label="검색"
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-full hover:bg-[#F1F3F6]"
          >
            <Search className="size-[17px]" />
          </button>
          <button
            type="button"
            aria-label="전화"
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-full hover:bg-[#F1F3F6]"
          >
            <Phone className="size-[17px]" />
          </button>
          <button
            type="button"
            aria-label="더보기"
            onClick={() => setShowLeaveConfirm(true)}
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-full hover:bg-[#F1F3F6]"
          >
            <MoreVertical className="size-[17px]" />
          </button>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-[24px] py-[20px]"
        style={{
          backgroundColor: "#DCE7FB",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="mx-auto mb-[16px] w-fit rounded-full bg-white/70 px-[12px] py-[4px] text-[11px] text-[#5B6472]">
          오늘
        </div>

        <div className="flex flex-col gap-[10px]">
          <div ref={topSentinelRef} className="h-px" />
          {messages?.map((msg) => {
            if (msg.messageType === "SYSTEM") {
              return (
                <div
                  key={msg.messageId}
                  className="mx-auto w-fit max-w-[80%] rounded-full bg-white/60 px-[10px] py-[3px] text-center text-[11px] text-[#8A94A6]"
                >
                  {msg.content}
                </div>
              );
            }

            const isMe = msg.senderId === useAuthStore.getState().user?.userId;
            return (
              <div
                key={msg.messageId}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                {isMe && (
                  <div
                    ref={openMenuId === msg.messageId ? menuRef : undefined}
                    className="relative mr-[6px] self-center"
                  >
                    <button
                      type="button"
                      aria-label="메시지 옵션"
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === msg.messageId ? null : msg.messageId,
                        )
                      }
                      className="flex size-[26px] cursor-pointer items-center justify-center rounded-full text-[#9AA3B2] hover:bg-[#E7EAF0]"
                    >
                      <MoreHorizontal className="size-[16px]" />
                    </button>
                    {openMenuId === msg.messageId && (
                      <div className="absolute right-0 top-[30px] z-10 w-[88px] overflow-hidden rounded-[10px] border border-[#E7EAF0] bg-white shadow-md">
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: 메시지 수정 기능 구현 (msg.messageId, msg.content 사용)
                          }}
                          className="block w-full px-[12px] py-[8px] text-left text-[13px] text-[#0B1220] hover:bg-[#F1F3F6]"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: 메시지 삭제 기능 구현 (msg.messageId 사용)
                          }}
                          className="block w-full px-[12px] py-[8px] text-left text-[13px] text-[#E35D5D] hover:bg-[#F1F3F6]"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[65%] rounded-[16px] px-[14px] py-[9px] text-[14px] shadow-sm ${
                    isMe
                      ? "rounded-br-[4px] bg-[#7BC96F] text-white"
                      : "rounded-bl-[4px] bg-white text-[#0B1220]"
                  }`}
                >
                  {msg.realFilePath ? (
                    <>
                      <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[12px]">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${msg.realFilePath}`}
                          alt="이미지"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      {msg.content && <p>{msg.content}</p>}
                    </>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p
                    className={`mt-[2px] text-right text-[10px] ${
                      isMe ? "text-white/80" : "text-[#9AA3B2]"
                    }`}
                  >
                    {formatTime(msg.sentAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex items-center gap-[10px] border-t border-[#E7EAF0] bg-white px-[16px] py-[12px]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          aria-label="파일 첨부"
          className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[#9AA3B2] hover:bg-[#F1F3F6]"
        >
          <Smile className="size-[19px]" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setFile(file);
          }}
        />
        <input
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="메시지"
          className="h-[40px] flex-1 rounded-full bg-[#F1F3F6] px-[16px] text-[14px] text-[#0B1220] placeholder:text-[#9AA3B2] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          aria-label="전송"
          className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#5B7FE3] text-white transition-opacity hover:opacity-90"
        >
          <Send className="size-[17px]" />
        </button>
      </div>

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[280px] rounded-[14px] bg-white p-[20px] shadow-lg">
            <p className="text-[14px] font-semibold text-[#0B1220]">
              채팅방을 나가시겠어요?
            </p>
            <p className="mt-[6px] text-[12px] text-[#8A94A6]">
              나가면 이 채팅방의 대화 내용을 더 이상 볼 수 없어요.
            </p>
            <div className="mt-[16px] flex gap-[8px]">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={isLeaving}
                className="h-[36px] flex-1 cursor-pointer rounded-[8px] bg-[#F1F3F6] text-[13px] font-medium text-[#0B1220]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLeaveRoom}
                disabled={isLeaving}
                className="h-[36px] flex-1 cursor-pointer rounded-[8px] bg-[#E35D5D] text-[13px] font-medium text-white disabled:opacity-60"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
