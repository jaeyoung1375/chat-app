import { get } from "@/util/AxiosUtil";
import { UserProfileResponse } from "./user.type";

/** 전체 회원 목록 조회. */
export const fetchUsers = () =>
  get<UserProfileResponse[]>("/api/v1/auth/users");
