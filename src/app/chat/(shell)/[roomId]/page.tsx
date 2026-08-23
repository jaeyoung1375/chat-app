"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MoreVertical, Phone, Search, Send, Smile } from "lucide-react";
import {
  useMessageListQuery,
  useSendMessageMutation,
} from "@/features/message/message.query";
import { useRoomDetailQuery } from "@/features/room/room.query";

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessageListQuery(Number(roomId));
  const messages = data?.pages.flatMap((page) => page).reverse();
  const { data: room } = useRoomDetailQuery(Number(roomId));

  const { mutate: sendMessage } = useSendMessageMutation(Number(roomId));

  const [text, setText] = useState<string>("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const topSentinelRef = useRef<HTMLDivElement>(null);

  // 스크롤 최하단으로 가기위한 ref
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
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

  if (!room) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-[#EFF3FB] text-[13px] text-[#8A94A6]">
        존재하지 않는 채팅방이에요.
      </div>
    );
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage(
      {
        messageType: "TEXT",
        content: trimmed,
      },
      { onSuccess: () => setText("") },
    );
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
            {isGroup ? `${room.members.length}명 참여 중` : "최근 접속"}
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

            const isMe = msg.senderId === Number(1);
            return (
              <div
                key={msg.messageId}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[65%] rounded-[16px] px-[14px] py-[9px] text-[14px] shadow-sm ${
                    isMe
                      ? "rounded-br-[4px] bg-[#7BC96F] text-white"
                      : "rounded-bl-[4px] bg-white text-[#0B1220]"
                  }`}
                >
                  <p>{msg.content}</p>
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
          aria-label="이모지"
          className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[#9AA3B2] hover:bg-[#F1F3F6]"
        >
          <Smile className="size-[19px]" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
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
    </div>
  );
}
