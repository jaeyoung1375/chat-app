/** /topic/presence/count, /app/presence/count 메시지 바디 (PresenceDto 대응) */
export type PresenceResponse = {
  count: number;
  userIds: number[];
};
