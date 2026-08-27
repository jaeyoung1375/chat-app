/** 계정 상태 */
export type UserStatus = "ACTIVE" | "DEACTIVATE";

/** 회원 권한 */
export type UserRole = "USER" | "ADMIN";

/** GET /api/v1/auth/users 응답 항목 (AuthController.getUsers / UserProfileDto 대응) */
export type UserProfileResponse = {
  userId: number; // 회원아이디
  email: string;
  status: UserStatus;
  role: UserRole;
  name: string;
  profileFileId: number | null; // 프로필 파일아이디
  gender: string;
  birthDt: string; // 생년월일 (ISO 문자열)
};
