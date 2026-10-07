import * as React from "react"
import { ChevronDownSquare, Check, ChevronDown, X, Plus } from "lucide-react"
import type { QuestionTypeDefinition, ValidationResult, AnswerValue } from "./types"
import { Input } from "@/components/ui/input"

export const dropdownDefinition: QuestionTypeDefinition = {
  type: "dropdown",
  name: "Dropdown",
  description: "Select an option from a list",
  icon: ChevronDownSquare,

  isEmpty: (value) => !value || (Array.isArray(value) ? value.length === 0 : value === ""),
  validate: (question, value) => {
    if (question.required && (!value || (Array.isArray(value) ? value.length === 0 : value === ""))) return { valid: false, error: "required" }
    if (value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)) {
      if (!Array.isArray(value)) return { valid: false, error: "invalid_type" }
      if (value.length > 1) return { valid: false, error: "invalid_type" }
      const hasNonString = value.some(v => typeof v !== "string")
      if (hasNonString) return { valid: false, error: "invalid_type" }
      const allowedIds = new Set(question.options?.map(o => o.id) || [])
      if (!allowedIds.has(value[0] as string)) return { valid: false, error: "invalid_type" }
    }
    return { valid: true }
  },
  serialize: (value) => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  },
  formatAnswer: (question, answer) => {
    if (!answer.options || answer.options.length === 0) return ""
    return answer.options.join(", ")
  },

  RespondentInput: ({ question, value, onChange, error }) => {
    const selected = Array.isArray(value) ? value[0] : value
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [focusedIndex, setFocusedIndex] = React.useState(-1)
    
    const options = question.options || []
    const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (!open) setOpen(true)
        setFocusedIndex(i => (i < filtered.length - 1 ? i + 1 : i))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFocusedIndex(i => (i > 0 ? i - 1 : 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (open && focusedIndex >= 0 && focusedIndex < filtered.length && filtered[focusedIndex]) {
          onChange([filtered[focusedIndex].id])
          setOpen(false)
        } else if (!open) {
          setOpen(true)
        }
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }

    const selectedOption = options.find(o => o.id === selected)

    return (
      <div className="w-full max-w-xl relative" ref={containerRef}>
        <div 
          className={`w-full flex items-center justify-between p-4 text-lg border rounded-md bg-background cursor-pointer focus-within:ring-2 focus-within:ring-primary ${error ? "border-destructive" : "border-input"}`}
          onClick={() => {
            setOpen(!open)
            if (!open) {
              setSearch("")
              setFocusedIndex(-1)
              setTimeout(() => inputRef.current?.focus(), 10)
            }
          }}
          tabIndex={open ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedOption ? "" : "text-muted-foreground"}>
            {selectedOption ? selectedOption.label : "Select an option..."}
          </span>
          <ChevronDown className="w-5 h-5 opacity-50" />
        </div>
        
        {open && (
          <div className="absolute top-full left-0 w-full mt-2 bg-popover border rounded-md shadow-md z-50 p-2">
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setFocusedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type to filter..."
              className="mb-2"
              role="combobox"
              aria-expanded={open}
              aria-controls="dropdown-list"
              aria-activedescendant={focusedIndex >= 0 && filtered[focusedIndex] ? `opt-${filtered[focusedIndex].id}` : undefined}
            />
            <ul id="dropdown-list" className="max-h-60 overflow-y-auto" role="listbox">
              {filtered.length === 0 ? (
                <li className="p-2 text-sm text-muted-foreground text-center">No results found.</li>
              ) : (
                filtered.map((opt, i) => (
                  <li
                    key={opt.id}
                    id={`opt-${opt.id}`}
                    role="option"
                    aria-selected={selected === opt.id}
                    className={`flex items-center p-2 rounded-sm cursor-pointer ${focusedIndex === i ? "bg-muted" : ""} ${selected === opt.id ? "text-primary font-medium" : ""}`}
                    onClick={() => {
                      onChange([opt.id])
                      setOpen(false)
                    }}
                    onMouseEnter={() => setFocusedIndex(i)}
                  >
                    <div className="w-6 mr-1 flex items-center justify-center">
                      {selected === opt.id && <Check className="w-4 h-4" />}
                    </div>
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
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
        <div className="flex items-center p-3 border rounded-md text-muted-foreground bg-muted/20 w-64 max-w-full relative">
          <div className="flex-1 text-sm truncate">
            {(question.config as any)?.placeholder || "Select an option..."}
          </div>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </div>
        
        {onChange && (
          <div className="flex flex-col gap-1 mt-2 w-64 max-w-full">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Dropdown options:</div>
            {options.map((opt, i) => (
              <div key={opt.id || (opt as any).clientKey} className="flex items-center gap-1 group">
                <input
                  value={opt.label}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent hover:border-muted focus:border-primary outline-none text-sm p-1"
                  placeholder={`Choice ${i + 1}`}
                />
                <button 
                  onClick={() => removeOption(i)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button 
              onClick={addOption}
              className="flex items-center p-1 text-xs text-muted-foreground hover:bg-muted/50 rounded transition-colors w-fit mt-1"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add choice
            </button>
          </div>
        )}
      </div>
    )
  },
  ConfigPanel: () => (
    <div className="space-y-4">
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
