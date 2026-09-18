import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/lib/types";

export const SESSION_KEY = ["session"];

export function useSession() {
  const { data, isLoading, isError } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: () => apiGet<User | null>("/auth/session"),
    retry: false,
    staleTime: 30_000,
  });
  return { user: data ?? null, loading: isLoading, offline: isError };
}

export async function beginSession() {
  await queryClient.invalidateQueries();
  await queryClient.refetchQueries({ queryKey: SESSION_KEY });
}

export async function endSession() {
  await apiPost("/auth/logout").catch(() => null);
  queryClient.clear();
  await queryClient.refetchQueries({ queryKey: SESSION_KEY });
}
