import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "./auth.api";
import type { UserProfileResponse } from "../user/user.type";

/** 현재 로그인한 사용자 정보 조회. */
export const useMeQuery = () =>
  useQuery<UserProfileResponse>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
  });
