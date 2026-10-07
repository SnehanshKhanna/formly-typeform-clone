import * as React from "react"
import { Star } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Input } from "@/components/ui/input"

export const ratingDefinition: QuestionTypeDefinition = {
  type: "rating",
  name: "Rating",
  description: "A star rating scale",
  icon: Star,

  isEmpty: (value) => value === null || value === undefined || value === 0,
  validate: (question, value) => {
    if (question.required && (value === null || value === undefined || value === 0)) return { valid: false, error: "required" }
    if (value !== null && value !== undefined && value !== 0) {
      if (typeof value !== "number" || !Number.isInteger(value)) return { valid: false, error: "invalid_type" }
      const steps = (question.config?.steps as number) || 5
      if (value < 1 || value > steps) return { valid: false, error: "too_large" } // or invalid range
    }
    return { valid: true }
  },
  serialize: (value) => (value !== null && value !== undefined ? Number(value) : null),
  formatAnswer: (question, answer) => (answer.value_number ? `${answer.value_number} Stars` : ""),

  RespondentInput: ({ question, value, onChange, error }) => {
    const steps = (question.config?.steps as number) || 5
    return (
      <div className="flex items-center gap-2" role="radiogroup">
        {Array.from({ length: steps }).map((_, i) => {
          const rating = i + 1
          const selected = value && Number(value) >= rating
          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={!!selected}
              aria-label={`Rate ${rating} stars`}
              onClick={() => onChange(rating)}
              className="p-1 text-primary hover:scale-110 transition-transform"
            >
              <Star className={`w-10 h-10 ${selected ? "fill-primary" : "stroke-input opacity-50"}`} />
            </button>
          )
        })}
      </div>
    )
  },
  CanvasPreview: ({ question }) => {
    const steps = (question.config?.steps as number) || 5
    return (
      <div className="flex gap-2 mt-4">
        {Array.from({ length: steps }).map((_, i) => (
          <Star key={i} className="w-8 h-8 stroke-muted-foreground opacity-50" />
        ))}
      </div>
    )
  },
  ConfigPanel: ({ question, onChange }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Steps</label>
        <Input 
          type="number" 
          min={2}
          max={10}
          value={question.config?.steps as number ?? 5}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined
            onChange({ config: { ...question.config, steps: val } })
          }}
        />
      </div>
    </div>
  ),
  AnswerView: ({ answer }) => <div>{answer.value_number ? `${answer.value_number} Stars` : <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: ({ stats }) => (
    <div className="text-sm">
      <p>Average Rating: {stats.average ?? "N/A"}</p>
    </div>
  ),
}
