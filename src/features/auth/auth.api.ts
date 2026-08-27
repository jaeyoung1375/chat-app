import { get } from "@/util/AxiosUtil";
import { UserProfileResponse } from "../user/user.type";

/** 현재 로그인한 사용자 정보 조회. */
export const fetchMe = () => get<UserProfileResponse>("/api/v1/auth/me");
