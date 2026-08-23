import { useQuery } from "@tanstack/react-query";
import { fetchRoomDetail, fetchRoomList } from "./room.api";
import type { RoomDetailResponse, RoomListItemResponse } from "./room.type";

/** 내 채팅방 목록 조회. */
export const useRoomListQuery = () =>
  useQuery<RoomListItemResponse[]>({
    queryKey: ["rooms", "list"],
    queryFn: fetchRoomList,
  });

/** 채팅방 상세 조회. roomId가 없으면(0/NaN) 자동으로 요청하지 않는다. */
export const useRoomDetailQuery = (roomId: number) =>
  useQuery<RoomDetailResponse>({
    queryKey: ["rooms", "detail", roomId],
    queryFn: () => fetchRoomDetail(roomId),
    enabled: !!roomId,
  });
