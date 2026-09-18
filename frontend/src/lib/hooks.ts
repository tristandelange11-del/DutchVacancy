import { useMutation, useQuery } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { JobList, JobWithMeta, OkResponse } from "@/lib/types";

export function useJobs(params: Record<string, string>) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v !== "all"),
  ).toString();
  return useQuery({
    queryKey: ["jobs", qs],
    queryFn: () => apiGet<JobList>(`/jobs${qs ? `?${qs}` : ""}`),
  });
}

export function useToggleSave() {
  return useMutation({
    mutationFn: (job: JobWithMeta) =>
      job.saved
        ? apiDelete<OkResponse>(`/student/saved-jobs/${job.id}`)
        : apiPost<OkResponse>(`/student/saved-jobs/${job.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
    },
  });
}
