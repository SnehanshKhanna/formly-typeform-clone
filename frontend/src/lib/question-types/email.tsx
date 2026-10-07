import * as React from "react"
import { Mail } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Input } from "@/components/ui/input"

export const emailDefinition: QuestionTypeDefinition = {
  type: "email",
  name: "Email",
  description: "An email address",
  icon: Mail,

  isEmpty: (value) => !value || String(value).trim() === "",
  validate: (question, value) => {
    const str = String(value || "")
    if (question.required && (!value || str.trim() === "")) return { valid: false, error: "required" }
    if (str.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return { valid: false, error: "invalid_email" }
    return { valid: true }
  },
  serialize: (value) => String(value || ""),
  formatAnswer: (question, answer) => answer.value_text || "",

  RespondentInput: ({ question, value, onChange, error }) => (
    <div className="w-full max-w-xl">
      <Input
        type="email"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="name@example.com"
        className={`text-xl py-6 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus-visible:ring-0 px-0 ${error ? "border-destructive" : "border-foreground/30 focus-visible:border-primary"}`}
      />
    </div>
  ),
  CanvasPreview: () => (
    <div className="w-full text-muted-foreground border-b border-muted pb-2 mt-4">
      name@example.com
    </div>
  ),
  ConfigPanel: () => (
    <div className="text-sm text-muted-foreground">No extra settings for Email.</div>
  ),
  AnswerView: ({ answer }) => <div>{answer.value_text || <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: () => <div className="text-sm text-muted-foreground">Text responses cannot be charted.</div>,
}
