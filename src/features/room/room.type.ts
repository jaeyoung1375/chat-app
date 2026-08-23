/** 채팅방유형 (DIRECT: 1:1, GROUP: 그룹) */
export type RoomType = "DIRECT" | "GROUP";

/** GET /api/v1/rooms 응답 항목 (RoomController.getMyRooms / RoomListItemDto 대응) */
export type RoomListItemResponse = {
  roomId: number; // 채팅방아이디
  roomType: RoomType;
  displayName: string; // 표시 이름 (GROUP은 방이름, DIRECT는 상대방 닉네임/이름)
  lastMessageAt: string | null; // 마지막 메시지 발송시각 (ISO 문자열, 메시지 없으면 null)
  lastMessageContent: string | null; // 마지막 메시지 내용 미리보기 (메시지 없으면 null)
  unreadCount: number; // 안읽은 메시지 수
};

/** 채팅방 참여자 (RoomMemberDto 대응) */
export type RoomMemberResponse = {
  userId: number; // 회원아이디
  displayName: string; // 표시 이름 (닉네임 우선, 없으면 이름)
  joinedAt: string; // 입장일시 (ISO 문자열)
};

/** GET /api/v1/rooms/{roomId} 응답 (RoomController.getRoomDetail / RoomDetailDto 대응) */
export type RoomDetailResponse = {
  roomId: number;
  roomType: RoomType;
  roomName: string | null; // 방이름 (GROUP만 존재, DIRECT는 null)
  members: RoomMemberResponse[]; // 참여자 목록 (나간 사람 제외)
};
