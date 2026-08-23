import { create } from "zustand";

export interface ChatMessage {
  id: string;
  senderId: "me" | string;
  text: string;
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  partnerName: string;
  type: "direct" | "group";
  memberCount?: number;
  messages: ChatMessage[];
}

interface ChatState {
  rooms: ChatRoom[];
  sendMessage: (roomId: string, text: string) => void;
}

// 고정된 기준 시각 — Date.now()를 쓰면 서버 렌더링과 클라이언트 렌더링 시점이 달라져 하이드레이션 에러가 난다.
const now = new Date("2026-08-21T13:46:00").getTime();

// TODO: chat-server에 채팅 API가 생기면 이 목업 데이터/스토어를 실제 서버 상태로 교체한다.
export const useChatStore = create<ChatState>((set) => ({
  rooms: [
    {
      id: "1",
      partnerName: "김민준",
      type: "direct",
      messages: [
        {
          id: "m1",
          senderId: "김민준",
          text: "안녕하세요! 오늘 시간 괜찮으세요?",
          createdAt: now - 1000 * 60 * 30,
        },
        {
          id: "m2",
          senderId: "me",
          text: "네 안녕하세요~ 오후에 괜찮아요",
          createdAt: now - 1000 * 60 * 28,
        },
      ],
    },
    {
      id: "2",
      partnerName: "이서연",
      type: "direct",
      messages: [
        {
          id: "m3",
          senderId: "이서연",
          text: "내일 회의 몇 시죠?",
          createdAt: now - 1000 * 60 * 60 * 3,
        },
      ],
    },
    {
      id: "3",
      partnerName: "프론트엔드 스터디",
      type: "group",
      memberCount: 5,
      messages: [
        {
          id: "m4",
          senderId: "박지훈",
          text: "다음 주 발표 자료 공유했어요~",
          createdAt: now - 1000 * 60 * 60 * 5,
        },
      ],
    },
  ],
  sendMessage: (roomId, text) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              messages: [
                ...room.messages,
                {
                  id: crypto.randomUUID(),
                  senderId: "me",
                  text,
                  createdAt: Date.now(),
                },
              ],
            }
          : room,
      ),
    })),
}));
