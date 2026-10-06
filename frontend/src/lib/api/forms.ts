import { apiFetch } from "./client"
import type { FormCreate, FormResponse, FormUpdate, FormStatsResponse } from "@/types/api"

export const formsApi = {
  list: () => apiFetch<FormResponse[]>("/forms"),
  create: (data: FormCreate) => apiFetch<FormResponse>("/forms", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  get: (id: string) => apiFetch<FormResponse>(`/forms/${id}`),
  update: (id: string, data: FormUpdate) => apiFetch<FormResponse>(`/forms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch<void>(`/forms/${id}`, { method: "DELETE" }),
  duplicate: (id: string) => apiFetch<FormResponse>(`/forms/${id}/duplicate`, { method: "POST" }),
  publish: (id: string) => apiFetch<{ slug: string; published_at: string }>(`/forms/${id}/publish`, { method: "POST" }),
  unpublish: (id: string) => apiFetch<FormResponse>(`/forms/${id}/unpublish`, { method: "POST" }),
  getStats: (id: string) => apiFetch<FormStatsResponse>(`/forms/${id}/stats`),
}
