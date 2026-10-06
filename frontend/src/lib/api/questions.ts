import { apiFetch } from "./client"
import type { QuestionCreate, QuestionResponse, QuestionUpdate, QuestionReorder } from "@/types/api"

export const questionsApi = {
  create: (formId: string, data: QuestionCreate) => apiFetch<QuestionResponse>(`/forms/${formId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (formId: string, questionId: string, data: QuestionUpdate) => apiFetch<QuestionResponse>(`/forms/${formId}/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (formId: string, questionId: string) => apiFetch<void>(`/forms/${formId}/questions/${questionId}`, {
    method: "DELETE",
  }),
  reorder: (formId: string, data: QuestionReorder) => apiFetch<QuestionResponse[]>(`/forms/${formId}/questions/reorder`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
}
