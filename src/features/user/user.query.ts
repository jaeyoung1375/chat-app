import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "./user.api";
import type { UserProfileResponse } from "./user.type";

/** 전체 회원 목록 조회. */
export const useUsersQuery = () =>
  useQuery<UserProfileResponse[]>({
    queryKey: ["users", "list"],
    queryFn: fetchUsers,
  });
