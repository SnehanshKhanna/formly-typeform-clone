import * as React from "react"
import { Hash } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Input } from "@/components/ui/input"

export const numberDefinition: QuestionTypeDefinition = {
  type: "number",
  name: "Number",
  description: "A numerical value",
  icon: Hash,

  isEmpty: (value) => value === null || value === undefined || value === "",
  validate: (question, value) => {
    if (question.required && (value === null || value === undefined || value === "")) return { valid: false, error: "required" }
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "boolean") return { valid: false, error: "invalid_type" }
      const num = Number(value)
      if (isNaN(num)) return { valid: false, error: "invalid_type" }
      const min = (question.config && question.config.min !== undefined && question.config.min !== null && question.config.min !== "") ? Number(question.config.min) : undefined
      const max = (question.config && question.config.max !== undefined && question.config.max !== null && question.config.max !== "") ? Number(question.config.max) : undefined
      if (min !== undefined && num < min) return { valid: false, error: "too_small" }
      if (max !== undefined && num > max) return { valid: false, error: "too_large" }
    }
    return { valid: true }
  },
  serialize: (value) => (value !== null && value !== undefined && value !== "" ? Number(value) : null),
  formatAnswer: (question, answer) => (answer.value_number !== null && answer.value_number !== undefined ? String(answer.value_number) : ""),

  RespondentInput: ({ question, value, onChange, error }) => (
    <div className="w-full max-w-xl">
      <Input
        inputMode="decimal"
        type="text"
        value={value !== null && value !== undefined ? String(value) : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a number..."
        className={`text-xl py-6 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus-visible:ring-0 px-0 ${error ? "border-destructive" : "border-foreground/30 focus-visible:border-primary"}`}
      />
    </div>
  ),
  CanvasPreview: () => (
    <div className="w-full text-muted-foreground border-b border-muted pb-2 mt-4">
      Number answer
    </div>
  ),
  ConfigPanel: ({ question, onChange }) => {
    const minProp = question.config?.min as number | undefined
    const maxProp = question.config?.max as number | undefined
    
    const [localMin, setLocalMin] = React.useState<string>(minProp !== undefined ? String(minProp) : "")
    const [localMax, setLocalMax] = React.useState<string>(maxProp !== undefined ? String(maxProp) : "")

    // Sync from prop changes (like when switching questions)
    React.useEffect(() => {
      setLocalMin(minProp !== undefined ? String(minProp) : "")
      setLocalMax(maxProp !== undefined ? String(maxProp) : "")
    }, [minProp, maxProp, question.id])

    const minNum = localMin ? parseFloat(localMin) : undefined
    const maxNum = localMax ? parseFloat(localMax) : undefined
    const isError = minNum !== undefined && maxNum !== undefined && minNum > maxNum

    const handleBlur = () => {
      if (!isError) {
        onChange({ config: { ...question.config, min: minNum, max: maxNum } })
      }
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Minimum</label>
          <Input 
            type="number" 
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Maximum</label>
          <Input 
            type="number" 
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={handleBlur}
          />
        </div>
        {isError && (
          <p className="text-xs text-destructive">Minimum cannot be greater than maximum.</p>
        )}
      </div>
    )
  },
  AnswerView: ({ answer }) => <div>{answer.value_number !== null && answer.value_number !== undefined ? answer.value_number : <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: ({ stats }) => (
    <div className="text-sm">
      <p>Average: {stats.average ?? "N/A"}</p>
      <p>Min: {stats.min ?? "N/A"}</p>
      <p>Max: {stats.max ?? "N/A"}</p>
    </div>
  ),
}
