"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// 퍼블용 샘플 데이터 — 실제 접속 상태 연동 전까지 정적으로 표시
const onlineUsers = [
  { id: "u1", name: "김민준" },
  { id: "u2", name: "이서연" },
  { id: "u3", name: "박지훈" },
  { id: "u4", name: "최수아" },
  { id: "u5", name: "정다은" },
];

export default function OnlineUsersPage() {
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
            현재 접속인원
            <span className="ml-[6px] text-[13px] font-normal text-[#94A3B8]">
              {onlineUsers.length}명
            </span>
          </h1>
        </div>

        <div className="mt-[20px] flex flex-col gap-[8px]">
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-[12px] rounded-[12px] border border-[#E2E8F0] bg-white p-[14px]"
            >
              <div className="relative shrink-0">
                <div className="flex size-[40px] items-center justify-center rounded-full bg-[#2F80FF] text-[14px] font-semibold text-white">
                  {user.name.slice(0, 1)}
                </div>
                <span className="absolute right-0 bottom-0 size-[10px] rounded-full border-2 border-white bg-[#22C55E]" />
              </div>
              <p className="flex-1 text-[14px] font-medium text-[#0B1220]">
                {user.name}
              </p>
              <button
                type="button"
                className="cursor-pointer rounded-[8px] border border-[#E2E8F0] bg-white px-[12px] py-[6px] text-[12px] font-medium text-[#2F80FF]"
              >
                1:1 채팅
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
