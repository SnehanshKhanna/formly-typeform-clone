import { apiFetch } from "./client"
import type { PublicFormResponse, SubmissionCreate, SubmissionResponse } from "@/types/api"

export const publicApi = {
  getForm: (slug: string) => apiFetch<PublicFormResponse>(`/public/forms/${slug}`),
  submitForm: (slug: string, data: SubmissionCreate) => apiFetch<SubmissionResponse>(`/public/forms/${slug}/submissions`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
}
