import { apiFetch } from "./client"
import type { SubmissionListResponse, SubmissionResponse } from "@/types/api"

export const submissionsApi = {
  list: (formId: string, page = 1, size = 50) => 
    apiFetch<SubmissionListResponse>(`/forms/${formId}/submissions?page=${page}&size=${size}`),
  get: (formId: string, submissionId: string) => 
    apiFetch<SubmissionResponse>(`/forms/${formId}/submissions/${submissionId}`),
}
