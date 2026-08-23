import { get } from "@/util/AxiosUtil";
import { RoomDetailResponse, RoomListItemResponse } from "./room.type";

/** 내 채팅방 목록 조회. 참여 중인 방을 마지막 메시지 시각 최신순으로 반환한다. */
export const fetchRoomList = () =>
  get<RoomListItemResponse[]>("/api/v1/rooms");

/** 채팅방 상세 조회 (참여자 목록 포함). */
export const fetchRoomDetail = (roomId: number) =>
  get<RoomDetailResponse>(`/api/v1/rooms/${roomId}`);
