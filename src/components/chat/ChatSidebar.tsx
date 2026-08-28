"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Plus, Search, Users } from "lucide-react";
import { useRoomListQuery } from "@/features/room/room.query";
import { subscribeOnlyRoom, subscribePresenceCount } from "@/util/StompUtil";
import { MessageResponse } from "@/features/message/message.type";
import { useQueryClient } from "@tanstack/react-query";
import { RoomListItemResponse } from "@/features/room/room.type";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatSidebar() {
  const queryClient = useQueryClient();

  const { data: rooms } = useRoomListQuery();
  const roomList = rooms?.map((r) => r.roomId).join(",");

  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [query, setQuery] = useState("");

  const [onlineUser, setOnlineUser] = useState<number>();

  useEffect(() => {
    if (!rooms) return;

    // 각 rooms를 순회하면서 각 구독 + 안읽은메시지 수를 업데이트한다.
    const unsubscribers = rooms.map((r) =>
      subscribeOnlyRoom(String(r.roomId), (body) => {
        const newMessage: MessageResponse = JSON.parse(body);
        if (pathRef.current !== `/chat/${r.roomId}`) {
          queryClient.setQueryData<RoomListItemResponse[]>(
            ["rooms", "list"],
            (old) =>
              old?.map((r) =>
                r.roomId === Number(newMessage.roomId)
                  ? {
                      ...r,
                      unreadCount: r.unreadCount + 1,
                    }
                  : r,
              ),
          );
        } else {
          queryClient.setQueryData<RoomListItemResponse[]>(
            ["rooms", "list"],
            (old) =>
              old?.map((r) =>
                r.roomId === Number(newMessage.roomId)
                  ? {
                      ...r,
                      unreadCount: 0,
                    }
                  : r,
              ),
          );
        }
      }),
    );

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [roomList]);

  // TODO: /topic/presence/count 구독해서 실제 값으로 교체 (현재는 퍼블용 더미)

  useEffect(() => {
    const unsubscribe = subscribePresenceCount((body) => {
      const { count } = JSON.parse(body);
      setOnlineUser(count);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  return (
    <aside className="flex h-full w-full max-w-[360px] shrink-0 flex-col border-r border-[#E7EAF0] bg-white">
      <div className="flex items-center gap-[8px] px-[16px] py-[16px]">
        <button
          type="button"
          aria-label="메뉴"
          className="flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[#5B6472] hover:bg-[#F1F3F6]"
        >
          <Menu className="size-[20px]" />
        </button>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-[12px] size-[15px] -translate-y-1/2 text-[#9AA3B2]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색"
            className="h-[38px] w-full rounded-full bg-[#F1F3F6] pr-[12px] pl-[34px] text-[13px] text-[#0B1220] placeholder:text-[#9AA3B2] focus:outline-none"
          />
        </div>
        <Link
          href="/chat/online"
          aria-label="현재 접속인원"
          className="flex size-[36px] shrink-0 items-center justify-center rounded-full text-[#5B6472] hover:bg-[#F1F3F6]"
        >
          <Users className="size-[18px]" />
        </Link>
        <Link
          href="/chat/new"
          aria-label="채팅방 만들기"
          className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[#5B7FE3] text-white hover:opacity-90"
        >
          <Plus className="size-[18px]" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms?.map((room) => {
          const lastMessage = room.lastMessageContent;
          const isGroup = room.roomType === "GROUP";
          const isActive = pathname === `/chat/${room.roomId}`;
          return (
            <Link
              key={room.roomId}
              href={`/chat/${room.roomId}`}
              className={`flex items-center gap-[12px] px-[16px] py-[12px] transition-colors ${
                isActive ? "bg-[#EEF2FB]" : "hover:bg-[#F7F9FC]"
              }`}
            >
              <div
                className={`flex size-[46px] shrink-0 items-center justify-center rounded-full text-[16px] font-semibold text-white ${
                  isGroup ? "bg-[#8A94A6]" : "bg-[#5B7FE3]"
                }`}
              >
                {isGroup ? (
                  <Users className="size-[20px]" />
                ) : (
                  room.displayName.slice(0, 1)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-[8px]">
                  <p className="truncate text-[14px] font-semibold text-[#0B1220]">
                    {room.displayName}
                    {isGroup && (
                      <span className="ml-[4px] text-[12px] font-normal text-[#9AA3B2]">
                        {3}명
                      </span>
                    )}
                  </p>
                  {/*
                  {lastMessage && (
                    <span className="shrink-0 text-[11px] text-[#9AA3B2]">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                  */}
                  {room.unreadCount > 0 && (
                    <span
                      className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[#5B7FE3] px-[5px] text-[11px] font-sem
ibold text-white"
                    >
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-[2px] truncate text-[13px] text-[#8A94A6]">
                  {lastMessage ?? "대화를 시작해보세요"}
                </p>
              </div>
            </Link>
          );
        })}

        {rooms?.length === 0 && (
          <p className="px-[16px] py-[24px] text-center text-[13px] text-[#9AA3B2]">
            검색 결과가 없어요
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-[8px] border-t border-[#E7EAF0] px-[16px] py-[12px]">
        <span className="relative flex size-[8px] shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-75" />
          <span className="relative inline-flex size-[8px] rounded-full bg-[#22C55E]" />
        </span>
        <p className="text-[13px] text-[#5B6472]">
          현재{" "}
          <span className="font-semibold text-[#0B1220]">{onlineUser}</span>명
          접속 중
        </p>
      </div>
    </aside>
  );
}
