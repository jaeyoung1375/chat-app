import { create } from "zustand";
import { UserProfileResponse } from "@/features/user/user.type";

interface AuthState {
  user: UserProfileResponse | null;
  setUser: (user: UserProfileResponse) => void;
  clearUser: () => void;
}

// 로그인한 유저 정보 — /auth/refresh 성공 콜백(src/app/page.tsx)에서 fetchMe() 결과로 채운다.
// STOMP 구독 콜백처럼 React 트리 밖에서도 getState()로 동기 접근이 필요해 zustand로 관리한다.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// if (process.env.NODE_ENV === "development") {
//   (window as any).useAuthStore = useAuthStore;
// }
