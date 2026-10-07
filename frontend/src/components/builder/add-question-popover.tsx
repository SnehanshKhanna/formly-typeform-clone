import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getAllQuestionTypes, PLACEHOLDER_TYPES } from "@/lib/question-types/registry"
import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ClientQuestion } from "@/lib/store/builderStore"

export function AddQuestionPopover() {
  const addQuestion = useBuilderStore((state) => state.addQuestion)
  const questions = useBuilderStore((state) => state.questions)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const types = getAllQuestionTypes()
  
  const filteredTypes = types.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
  const filteredPlaceholders = PLACEHOLDER_TYPES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (typeId: string) => {
    const t = types.find(t => t.type === typeId)
    if (!t) return

    const newQuestion: ClientQuestion = {
      id: crypto.randomUUID(),
      form_id: "tmp", // overriden by api
      type: t.type,
      title: "",
      description: null,
      required: false,
      position: questions.length,
      config: {},
    }
    
    // add options for choice types
    if (t.type === "multiple_choice" || t.type === "dropdown") {
      newQuestion.options = [
        { clientKey: crypto.randomUUID(), question_id: newQuestion.id, label: "Choice 1", position: 0 },
        { clientKey: crypto.randomUUID(), question_id: newQuestion.id, label: "Choice 2", position: 1 },
      ]
    }

    addQuestion(newQuestion)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label="Add question" className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add question
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="p-2 border-b">
          <Input 
            placeholder="Search questions..." 
            className="h-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="p-2 grid grid-cols-2 gap-1 max-h-80 overflow-auto">
          {filteredTypes.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.type}
                className="flex flex-col items-center justify-center p-3 gap-2 rounded-md hover:bg-muted text-center"
                onClick={() => handleSelect(t.type)}
              >
                <Icon className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs font-medium">{t.name}</span>
              </button>
            )
          })}
          {filteredPlaceholders.map((p) => {
            return (
              <button
                key={p.type}
                disabled
                className="flex flex-col items-center justify-center p-3 gap-2 rounded-md bg-muted/50 opacity-50 cursor-not-allowed text-center"
              >
                <span className="text-xs font-medium">{p.name}</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Coming Soon</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
