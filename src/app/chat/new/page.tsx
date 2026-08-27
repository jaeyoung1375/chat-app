"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { subscribePresenceCount } from "@/util/StompUtil";
import { PresenceResponse } from "@/features/presence/presence.type";
import { useUsersQuery } from "@/features/user/user.query";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateDirectRoomMutation } from "@/features/room/room.query";
import { useRouter } from "next/navigation";

type RoomType = "direct" | "group";

export default function NewChatRoomPage() {
  const router = useRouter();

  // 본인 userId 조회
  const isMe = useAuthStore.getState().user?.userId;

  const { mutate: createRoom } = useCreateDirectRoomMutation();

  const [roomType, setRoomType] = useState<RoomType>("direct");
  const [groupName, setGroupName] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    if (roomType === "direct") {
      setSelectedIds((prev) => (prev[0] === id ? [] : [id]));
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const { data: users } = useUsersQuery();
  const [userIds, setUserIds] = useState<number[]>([]);

  const createDirectRoom = (userId: number) => {
    createRoom(userId, {
      onSuccess: (e) => {
        router.push(`/chat/${e.data.roomId}`);
      },
    });
  };

  useEffect(() => {
    const unsubscribe = subscribePresenceCount((body) => {
      console.log(body);
      const { userIds } = JSON.parse(body) as PresenceResponse;
      setUserIds(userIds);
    });

    return unsubscribe;
  }, []);

  const memoUser = useMemo(() => {
    return users?.filter((item) => userIds.includes(item.userId));
  }, [users, userIds]);

  return (
    <div className="min-h-screen w-full bg-[#F4F8FF]">
      <div className="mx-auto w-full max-w-[480px] px-6 py-8">
        <div className="flex items-center gap-[12px]">
          <Link
            href="/chat"
            aria-label="뒤로 가기"
            className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-white text-[#0B1220]"
          >
            <ChevronLeft className="size-[20px]" />
          </Link>
          <h1 className="text-[18px] font-semibold text-[#0B1220]">
            채팅방 만들기
          </h1>
        </div>

        {/* 1:1 / 그룹 탭 */}
        {/* TODO: 탭 공통 컴포넌트로 분리 */}
        <div className="mt-[20px] flex rounded-[10px] border border-[#E2E8F0] bg-white p-[4px]">
          <button
            type="button"
            onClick={() => {
              setRoomType("direct");
              setSelectedIds([]);
            }}
            className={`flex-1 cursor-pointer rounded-[8px] py-[8px] text-[13px] font-medium transition-colors ${
              roomType === "direct"
                ? "bg-[#2F80FF] text-white"
                : "text-[#64748B]"
            }`}
          >
            1:1 채팅
          </button>
          <button
            type="button"
            onClick={() => {
              setRoomType("group");
              setSelectedIds([]);
            }}
            className={`flex-1 cursor-pointer rounded-[8px] py-[8px] text-[13px] font-medium transition-colors ${
              roomType === "group"
                ? "bg-[#2F80FF] text-white"
                : "text-[#64748B]"
            }`}
          >
            그룹 채팅
          </button>
        </div>

        {/* 그룹명 입력 (그룹일 때만) */}
        {roomType === "group" && (
          <div className="mt-[16px]">
            <label
              htmlFor="groupName"
              className="mb-[6px] block text-[13px] font-medium text-[#0B1220]"
            >
              그룹 이름
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 프론트엔드 스터디"
              className="h-[44px] w-full rounded-[8px] border border-[#E2E8F0] bg-white px-[14px] text-[14px] text-[#0B1220] placeholder:text-[#94A3B8] focus:border-[#2F80FF] focus:outline-none"
            />
          </div>
        )}

        {/* 참가자 검색 */}
        <div className="mt-[16px]">
          <p className="mb-[6px] text-[13px] font-medium text-[#0B1220]">
            참가자{" "}
            {roomType === "group" && selectedIds.length > 0 && (
              <span className="text-[#2F80FF]">
                {selectedIds.length}명 선택됨
              </span>
            )}
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-[14px] size-[16px] -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="이름으로 검색"
              className="h-[44px] w-full rounded-[8px] border border-[#E2E8F0] bg-white pr-[14px] pl-[38px] text-[14px] text-[#0B1220] placeholder:text-[#94A3B8] focus:border-[#2F80FF] focus:outline-none"
            />
          </div>
        </div>

        {/* 참가자 목록 */}
        <div className="mt-[12px] flex flex-col gap-[8px]">
          {memoUser
            ?.filter((item) => item.userId !== isMe)
            .map((user) => {
              const isSelected = selectedIds.includes(user.userId);
              return (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() => toggleSelect(user.userId)}
                  className={`flex cursor-pointer items-center gap-[12px] rounded-[12px] border p-[12px] text-left transition-colors ${
                    isSelected
                      ? "border-[#2F80FF] bg-[#EAF2FE]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[#2F80FF] text-[13px] font-semibold text-white">
                    {user.name.slice(0, 1)}
                  </div>
                  <p className="flex-1 text-[14px] font-medium text-[#0B1220]">
                    {user.name}
                  </p>
                  <span
                    className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border text-[11px] text-white ${
                      isSelected
                        ? "border-[#2F80FF] bg-[#2F80FF]"
                        : "border-[#E2E8F0] bg-white"
                    }`}
                  >
                    {isSelected && "✓"}
                  </span>
                </button>
              );
            })}
        </div>

        {/* 만들기 버튼 — 퍼블 단계, 실제 생성 로직 미연결 */}
        <button
          type="button"
          onClick={() => createDirectRoom(selectedIds[0])}
          disabled={selectedIds.length === 0}
          className="mt-[24px] h-[47px] w-full cursor-pointer rounded-[8px] bg-[#2F80FF] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
        >
          채팅방 만들기
        </button>
      </div>
    </div>
  );
}
