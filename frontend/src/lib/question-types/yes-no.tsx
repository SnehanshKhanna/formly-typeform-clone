import * as React from "react"
import { ToggleLeft } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"

export const yesNoDefinition: QuestionTypeDefinition = {
  type: "yes_no",
  name: "Yes/No",
  description: "A simple yes or no answer",
  icon: ToggleLeft,

  isEmpty: (value) => value === null || value === undefined,
  validate: (question, value) => {
    if (question.required && (value === null || value === undefined || value === "")) return { valid: false, error: "required" }
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value !== "boolean") return { valid: false, error: "invalid_type" }
    }
    return { valid: true }
  },
  serialize: (value) => (value !== null && value !== undefined ? Boolean(value) : null),
  formatAnswer: (question, answer) => {
    if (answer.value_bool === true) return "Yes"
    if (answer.value_bool === false) return "No"
    return ""
  },

  RespondentInput: ({ question, value, onChange, error }) => (
    <div className="w-full flex gap-4" role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        onClick={() => onChange(true)}
        className={`flex-1 py-4 text-xl border rounded-md transition-colors ${value === true ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-input hover:bg-muted"}`}
      >
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm border border-current px-2 py-0.5 rounded shadow-sm opacity-60">Y</span>
          Yes
        </div>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        onClick={() => onChange(false)}
        className={`flex-1 py-4 text-xl border rounded-md transition-colors ${value === false ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-input hover:bg-muted"}`}
      >
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm border border-current px-2 py-0.5 rounded shadow-sm opacity-60">N</span>
          No
        </div>
      </button>
    </div>
  ),
  CanvasPreview: () => (
    <div className="w-full flex gap-4 mt-4 text-muted-foreground">
      <div className="flex-1 py-3 border rounded-md text-center bg-muted/30">Yes</div>
      <div className="flex-1 py-3 border rounded-md text-center bg-muted/30">No</div>
    </div>
  ),
  ConfigPanel: () => (
    <div className="text-sm text-muted-foreground">No extra settings for Yes/No.</div>
  ),
  AnswerView: ({ answer }) => <div>{answer.value_bool === true ? "Yes" : answer.value_bool === false ? "No" : <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: ({ stats }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <div className="w-16">Yes</div>
        <div className="flex-1 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${stats.yes_count || 0}%` /* Note: ideally (stats.yes_count/total)*100 */ }}></div></div>
        <div className="w-8 text-right">{stats.yes_count || 0}</div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-16">No</div>
        <div className="flex-1 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${stats.no_count || 0}%` }}></div></div>
        <div className="w-8 text-right">{stats.no_count || 0}</div>
      </div>
    </div>
  ),
}
