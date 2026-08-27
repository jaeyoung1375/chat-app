import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDirectRoom,
  fetchRoomDetail,
  fetchRoomList,
  leaveRoom,
} from "./room.api";
import type {
  DirectRoomCreateRequest,
  RoomDetailResponse,
  RoomListItemResponse,
} from "./room.type";

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

/** 1:1(DIRECT) 채팅방 생성. 성공하면 방 목록을 다시 조회한다. */
export const useCreateDirectRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => createDirectRoom(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "list"] });
    },
  });
};

/** 채팅방 나가기. 성공하면 방 목록을 다시 조회하고, 더 이상 접근할 수 없는 방의 상세 캐시는 제거한다. */
export const useLeaveRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => leaveRoom(roomId),
    onSuccess: (_data, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "list"] });
      queryClient.removeQueries({ queryKey: ["rooms", "detail", roomId] });
    },
  });
};
