export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type FormStatus = "draft" | "published"

export interface FormResponse {
  id: string
  creator_id: string
  title: string
  status: FormStatus
  slug: string
  thank_you_title?: string | null
  thank_you_message?: string | null
  theme?: Record<string, any>
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface FormFullResponse extends FormResponse {
  questions: QuestionResponse[]
}

export interface FormSummaryResponse {
  id: string
  title: string
  status: FormStatus
  slug: string
  question_count: number
  response_count: number
  updated_at: string
  published_at: string | null
}

export interface FormListResponse {
  items: FormSummaryResponse[]
  total: number
}

export interface FormCreate {
  title: string
}

export interface FormUpdate {
  title?: string
  status?: FormStatus
  thank_you_title?: string | null
  thank_you_message?: string | null
  theme?: Record<string, any>
}

export interface PublicFormResponse {
  id: string
  title: string
  slug: string
  thank_you_title?: string | null
  thank_you_message?: string | null
  theme?: Record<string, any>
  questions: QuestionResponse[]
}

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating"

export interface QuestionOptionResponse {
  id: string
  question_id: string
  label: string
  position: number
}

export interface QuestionOptionCreate {
  label: string
}

export interface QuestionOptionUpdate {
  id?: string
  label: string
}

export interface QuestionResponse {
  id: string
  form_id: string
  type: QuestionType
  title: string
  description: string | null
  required: boolean
  position: number
  config: Record<string, unknown> | null
  options?: QuestionOptionResponse[]
}

export interface QuestionCreate {
  type: QuestionType
  title: string
  description?: string
  required?: boolean
  config?: Record<string, unknown>
  options?: QuestionOptionCreate[]
}

export interface QuestionUpdate {
  title?: string
  description?: string
  required?: boolean
  config?: Record<string, unknown>
  options?: QuestionOptionUpdate[]
}

export interface QuestionReorder {
  question_ids: string[]
}

export interface FormStatsResponse {
  form_id: string
  total_submissions: number
  question_stats: Record<string, QuestionStatsResponse>
}

export interface QuestionStatsResponse {
  skipped: number
  recent?: string[]
  yes_count?: number
  no_count?: number
  min?: number
  max?: number
  average?: number
  option_counts?: Record<string, number>
  distribution?: Record<string, number>
}

export interface AnswerResponse {
  id: string
  submission_id: string
  question_id: string
  value_text?: string
  value_number?: number
  value_bool?: boolean
  options?: string[]
}

export interface SubmissionResponse {
  id: string
  form_id: string
  started_at: string
  submitted_at: string | null
  answers: AnswerResponse[]
}

export interface SubmissionListResponse {
  items: SubmissionResponse[]
  total: number
  page: number
  size: number
}

export interface AnswerCreate {
  question_id: string
  value: string | number | boolean | string[]
}

export interface SubmissionCreate {
  answers: AnswerCreate[]
}
