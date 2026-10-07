import { apiFetch } from "./client"
import type { FormCreate, FormResponse, FormUpdate, FormStatsResponse, FormListResponse, FormFullResponse } from "@/types/api"

export const formsApi = {
  list: (q?: string, status?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status && status !== "all") params.set("status", status)
    const qs = params.toString()
    return apiFetch<FormListResponse>(`/forms${qs ? `?${qs}` : ""}`)
  },
  create: (data: FormCreate) => apiFetch<FormResponse>("/forms", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  get: (id: string) => apiFetch<FormFullResponse>(`/forms/${id}`),
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
