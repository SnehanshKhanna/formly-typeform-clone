import type { QuestionType, QuestionResponse, AnswerResponse, QuestionOptionResponse, QuestionStatsResponse } from "@/types/api"
import * as React from "react"

export type ErrorCode = 
  | "required"
  | "invalid_email"
  | "too_short"
  | "too_long"
  | "too_small"
  | "too_large"
  | "invalid_type"

export type AnswerValue = string | number | boolean | string[] | null | undefined

export interface ValidationResult {
  valid: boolean
  error?: ErrorCode
}

export interface RespondentInputProps {
  question: QuestionResponse
  value: AnswerValue
  onChange: (value: AnswerValue) => void
  error?: ErrorCode
  autoAdvance?: () => void
}

export interface CanvasPreviewProps {
  question: QuestionResponse
  onChange?: (updates: Partial<QuestionResponse>) => void
}

export interface ConfigPanelProps {
  question: QuestionResponse
  onChange: (updates: Partial<QuestionResponse>) => void
}

export interface AnswerViewProps {
  question: QuestionResponse
  answer: AnswerResponse
}

export interface StatViewProps {
  question: QuestionResponse
  stats: QuestionStatsResponse
}

export interface QuestionTypeDefinition {
  type: QuestionType
  name: string
  description: string
  icon: React.ElementType

  // Validation & Data
  isEmpty: (value: AnswerValue) => boolean
  validate: (question: QuestionResponse, value: AnswerValue) => ValidationResult
  serialize: (value: AnswerValue) => unknown
  formatAnswer: (question: QuestionResponse, answer: AnswerResponse) => string

  // Components
  RespondentInput: React.ComponentType<RespondentInputProps>
  CanvasPreview: React.ComponentType<CanvasPreviewProps>
  ConfigPanel: React.ComponentType<ConfigPanelProps>
  AnswerView: React.ComponentType<AnswerViewProps>
  StatView: React.ComponentType<StatViewProps>
}
