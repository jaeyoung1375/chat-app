/** 메시지 유형 (TEXT: 일반 텍스트, IMAGE: 이미지 첨부, SYSTEM: 시스템 안내 메시지) */
export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";

/** GET /api/v1/rooms/{roomId}/messages 응답 항목 (MessageController.getMessages / MessageResponseDto 대응) */
export type MessageResponse = {
  messageId: number; // 메시지아이디
  roomId: number; // 채팅방아이디
  senderId: number; // 보낸사람 회원아이디
  senderName: string; // 보낸사람 표시이름
  messageType: MessageType;
  content: string; // 메시지 내용
  fileId: number | null; // 첨부파일아이디 (IMAGE 메시지일 때만 존재)
  sentAt: string; // 발송일시 (ISO 문자열)
  realFilePath?: string; // 실제 파일경로
};

/** 클라이언트가 보낼 수 있는 메시지 유형 — SYSTEM은 서버 전용이라 제외 */
export type SendableMessageType = "TEXT" | "IMAGE";

/** POST /api/v1/rooms/{roomId}/messages 요청 바디 (MessageSendRequestDto 대응) */
export type MessageSendRequest = {
  messageType: SendableMessageType;
  content?: string; // 내용 (TEXT는 본문, IMAGE는 캡션으로 선택 사용, 최대 4000자)
  fileId?: number; // 첨부파일아이디 (IMAGE 메시지, 업로드는 기존 /file/editor-image 재사용)
};
