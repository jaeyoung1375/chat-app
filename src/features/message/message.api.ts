import { get, post, postForm } from "@/util/AxiosUtil";
import { MessageResponse, MessageSendRequest } from "./message.type";

/**
 * 채팅방 메시지 목록 조회 (커서 페이지네이션).
 * beforeMessageId보다 작은 메시지를 최신순으로 size개 가져온다 — 생략하면 가장 최근 메시지부터.
 */
export const fetchMessageList = (
  roomId: number,
  params?: { beforeMessageId?: number; size?: number },
) => get<MessageResponse[]>(`/api/v1/rooms/${roomId}/messages`, { params });

/**
 * 메시지 전송. WebSocket 실시간 브로드캐스트는 아직 없다 — REST로 저장만 수행한다(백엔드 주석 그대로).
 */
export const sendMessage = (roomId: number, body: MessageSendRequest) =>
  post<MessageResponse>(`/api/v1/rooms/${roomId}/messages`, body);
