import { get, post } from "@/util/AxiosUtil";
import { RoomDetailResponse, RoomListItemResponse } from "./room.type";

/** 내 채팅방 목록 조회. 참여 중인 방을 마지막 메시지 시각 최신순으로 반환한다. */
export const fetchRoomList = () => get<RoomListItemResponse[]>("/api/v1/rooms");

/** 채팅방 상세 조회 (참여자 목록 포함). */
export const fetchRoomDetail = (roomId: number) =>
  get<RoomDetailResponse>(`/api/v1/rooms/${roomId}`);

/**
 * 1:1(DIRECT) 채팅방 생성.
 * 응답은 생성된 방 상세(RoomDetailResponse)를 그대로 반환한다고 가정 — 백엔드 실제 계약 미확인.
 */
export const createDirectRoom = (userId: number) =>
  post<RoomDetailResponse>("/api/v1/rooms/direct", { targetUserId: userId });

/** 채팅방 나가기. 응답 데이터 없음(성공 여부만 의미 있음). */
export const leaveRoom = (roomId: number) =>
  post<void>(`/api/v1/rooms/${roomId}/leave`);
