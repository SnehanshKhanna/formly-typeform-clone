import * as React from "react"
import { Type } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Input } from "@/components/ui/input"

export const shortTextDefinition: QuestionTypeDefinition = {
  type: "short_text",
  name: "Short Text",
  description: "A single line of text",
  icon: Type,

  isEmpty: (value) => !value || String(value).trim() === "",
  validate: (question, value) => {
    const str = String(value || "")
    if (question.required && (!value || str.trim() === "")) return { valid: false, error: "required" }
    const maxLength = question.config?.max_length as number | undefined
    if (maxLength && str.length > maxLength) return { valid: false, error: "too_long" }
    return { valid: true }
  },
  serialize: (value) => String(value || ""),
  formatAnswer: (question, answer) => answer.value_text || "",

  RespondentInput: ({ question, value, onChange, error }) => (
    <div className="w-full max-w-xl">
      <Input
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className={`text-xl py-6 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus-visible:ring-0 px-0 ${error ? "border-destructive" : "border-foreground/30 focus-visible:border-primary"}`}
      />
    </div>
  ),
  CanvasPreview: () => (
    <div className="w-full text-muted-foreground border-b border-muted pb-2 mt-4">
      Short text answer
    </div>
  ),
  ConfigPanel: ({ question, onChange }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Max characters</label>
        <Input 
          type="number" 
          value={question.config?.max_length as number || ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined
            onChange({ config: { ...question.config, max_length: val } })
          }}
          placeholder="No limit"
        />
      </div>
    </div>
  ),
  AnswerView: ({ answer }) => <div>{answer.value_text || <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: () => <div className="text-sm text-muted-foreground">Text responses cannot be charted.</div>,
}
