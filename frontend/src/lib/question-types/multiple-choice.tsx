import * as React from "react"
import { ListChecks, X, Plus } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Switch } from "@/components/ui/switch"

export const multipleChoiceDefinition: QuestionTypeDefinition = {
  type: "multiple_choice",
  name: "Multiple Choice",
  description: "Select one or more options",
  icon: ListChecks,

  isEmpty: (value) => !value || (Array.isArray(value) && value.length === 0),
  validate: (question, value) => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) return { valid: false, error: "required" }
    if (value !== null && value !== undefined && (!Array.isArray(value) || value.length > 0)) {
      if (!Array.isArray(value)) return { valid: false, error: "invalid_type" }
      const hasNonString = value.some(v => typeof v !== "string")
      if (hasNonString) return { valid: false, error: "invalid_type" }
      const unique = new Set(value)
      if (unique.size !== value.length) return { valid: false, error: "invalid_type" }
      
      const allowedIds = new Set(question.options?.map(o => o.id) || [])
      const hasForeign = value.some(v => !allowedIds.has(v))
      if (hasForeign) return { valid: false, error: "invalid_type" }
    }
    return { valid: true }
  },
  serialize: (value) => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  },
  formatAnswer: (question, answer) => {
    if (!answer.options || answer.options.length === 0) return ""
    // We would map IDs to labels here if we have the full question object
    return answer.options.join(", ")
  },

  RespondentInput: ({ question, value, onChange, error }) => {
    const allowMultiple = !!question.config?.allow_multiple
    const selected = Array.isArray(value) ? (value as string[]) : (value ? [value as string] : [])
    
    const toggleOption = (optId: string) => {
      if (allowMultiple) {
        if (selected.includes(optId)) {
          onChange(selected.filter(id => id !== optId))
        } else {
          onChange([...selected, optId])
        }
      } else {
        onChange([optId])
      }
    }

    return (
      <div className="flex flex-col gap-2 w-full max-w-xl" role={allowMultiple ? "group" : "radiogroup"}>
        {question.options?.map((opt, i) => {
          const isSelected = selected.includes(opt.id)
          const char = String.fromCharCode(65 + i) // A, B, C...
          return (
            <button
              key={opt.id}
              type="button"
              role={allowMultiple ? "checkbox" : "radio"}
              aria-checked={isSelected}
              onClick={() => toggleOption(opt.id)}
              className={`flex items-center p-3 text-left border rounded-md transition-colors ${isSelected ? "bg-primary/10 border-primary shadow-sm" : "bg-transparent border-input hover:bg-muted"}`}
            >
              <div className={`flex items-center justify-center w-6 h-6 mr-3 text-xs border rounded-sm ${isSelected ? "bg-primary text-primary-foreground border-primary" : "border-foreground/30"}`}>
                {char}
              </div>
              <span className="flex-1">{opt.label}</span>
              {isSelected && <ListChecks className="w-4 h-4 text-primary ml-2" />}
            </button>
          )
        })}
      </div>
    )
  },
  CanvasPreview: ({ question, onChange }) => {
    const options = question.options || []

    const updateOption = (idx: number, label: string) => {
      if (!onChange) return
      const newOpts = [...options]
      newOpts[idx] = { ...newOpts[idx], label } as any
      onChange({ options: newOpts })
    }

    const removeOption = (idx: number) => {
      if (!onChange) return
      const newOpts = options.filter((_, i) => i !== idx)
      onChange({ options: newOpts })
    }

    const addOption = () => {
      if (!onChange) return
      const newOpts = [...options, { clientKey: crypto.randomUUID(), label: `Choice ${options.length + 1}`, position: options.length } as any]
      onChange({ options: newOpts })
    }

    return (
      <div className="flex flex-col gap-2 mt-4 w-full">
        {options.map((opt, i) => (
          <div key={opt.id || (opt as any).clientKey} className="flex items-center p-2 border border-muted rounded-md text-muted-foreground bg-muted/20 group">
            <div className="w-5 h-5 mr-3 text-[10px] border border-muted-foreground/30 rounded-sm flex items-center justify-center shrink-0">
              {String.fromCharCode(65 + i)}
            </div>
            {onChange ? (
              <input
                value={opt.label}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
                placeholder={`Choice ${i + 1}`}
              />
            ) : (
              <span className="flex-1 text-sm">{opt.label}</span>
            )}
            {onChange && (
              <button 
                onClick={() => removeOption(i)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {onChange && (
          <button 
            onClick={addOption}
            className="flex items-center p-2 text-sm text-muted-foreground hover:bg-muted/50 rounded-md transition-colors w-fit mt-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add choice
          </button>
        )}
        {!onChange && options.length === 0 && (
          <div className="text-sm text-muted-foreground italic">No options defined</div>
        )}
      </div>
    )
  },
  ConfigPanel: ({ question, onChange }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Allow multiple selections</label>
        <Switch 
          checked={!!question.config?.allow_multiple}
          onCheckedChange={(checked) => onChange({ config: { ...question.config, allow_multiple: checked } })}
        />
      </div>
      <p className="text-xs text-muted-foreground">Edit options directly on the canvas.</p>
    </div>
  ),
  AnswerView: ({ answer }) => <div>{answer.options?.length ? answer.options.join(", ") : <span className="text-muted-foreground italic">No answer</span>}</div>,
  StatView: ({ stats }) => (
    <div className="space-y-2">
      {Object.entries(stats.option_counts || {}).map(([id, count]) => (
        <div key={id} className="flex items-center gap-2 text-sm">
          <div className="flex-1 truncate">{id}</div>
          <div className="w-32 h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${count}%` }}></div></div>
          <div className="w-8 text-right">{count as number}</div>
        </div>
      ))}
    </div>
  ),
}
