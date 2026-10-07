import type { QuestionTypeDefinition } from "./types"
import type { QuestionType } from "@/types/api"

const registry = new Map<QuestionType, QuestionTypeDefinition>()

export function registerQuestionType(def: QuestionTypeDefinition) {
  registry.set(def.type, def)
}

export function getQuestionType(type: QuestionType): QuestionTypeDefinition {
  const def = registry.get(type)
  if (!def) {
    throw new Error(`Question type '${type}' is not registered.`)
  }
  return def
}

export function getAllQuestionTypes(): QuestionTypeDefinition[] {
  return Array.from(registry.values())
}

export const PLACEHOLDER_TYPES = [
  { type: "file_upload", name: "File Upload", description: "Collect files from respondents" },
  { type: "payment", name: "Payment", description: "Collect payments securely" },
]
