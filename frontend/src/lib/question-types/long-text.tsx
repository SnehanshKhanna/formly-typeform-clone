import * as React from "react"
import { AlignLeft } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Textarea } from "@/components/ui/textarea"

export const longTextDefinition: QuestionTypeDefinition = {
  type: "long_text",
  name: "Long Text",
  description: "Multiple lines of text",
  icon: AlignLeft,

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
    <div className="w-full max-w-2xl">
      <Textarea
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className={`text-lg min-h-[120px] bg-transparent ${error ? "border-destructive" : "border-foreground/30 focus-visible:border-primary"}`}
      />
    </div>
  ),
  CanvasPreview: () => (
    <div className="w-full text-muted-foreground border border-muted rounded-md h-24 p-3 mt-4">
      Long text answer
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
  AnswerView: ({ answer }) => <div className="whitespace-pre-wrap">{answer.value_text || <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: () => <div className="text-sm text-muted-foreground">Text responses cannot be charted.</div>,
}

// Need to import Input for ConfigPanel since it's used there
import { Input } from "@/components/ui/input"
