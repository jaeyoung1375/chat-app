import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { fetchMessageList } from "./message.api";
import type { MessageSendRequest } from "./message.type";
import { publishMessage } from "@/util/StompUtil";

/** 채팅방 메시지 목록 조회. roomId가 없으면(0/NaN) 자동으로 요청하지 않는다. */
export const useMessageListQuery = (
  roomId: number,
  params?: { beforeMessageId?: number; size?: number },
) =>
  useInfiniteQuery({
    queryKey: ["rooms", roomId, "messages", params],
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      fetchMessageList(roomId, {
        beforeMessageId: pageParam,
        size: params?.size,
      }),
    getNextPageParam: (lastpage) => {
      const size = params?.size ?? 30;
      if (lastpage.length < size) return undefined;
      return lastpage.at(-1)?.messageId;
    },
    enabled: !!roomId,
  });

/** 메시지 전송. 성공하면 해당 방의 메시지 목록과 방 목록(마지막 메시지 미리보기)을 다시 조회한다. */
export const useSendMessageMutation = (roomId: number) => {
  return useMutation({
    mutationFn: async (body: MessageSendRequest) => {
      publishMessage(roomId, body);
    },
  });
};
