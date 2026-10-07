import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { getQuestionType } from "@/lib/question-types"
import { AddQuestionPopover } from "./add-question-popover"

export function Canvas() {
  const selectedId = useBuilderStore((state) => state.selectedId)
  const questions = useBuilderStore((state) => state.questions)
  const updateQuestion = useBuilderStore((state) => state.updateQuestion)
  
  const question = questions.find((q) => q.id === selectedId)

  if (!question && questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
        <div className="text-xl">Add your first question</div>
        <AddQuestionPopover />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
        <div className="text-xl">Select a question to edit</div>
      </div>
    )
  }

  const typeDef = getQuestionType(question.type)
  const Preview = typeDef.CanvasPreview

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-sm border p-8 flex flex-col gap-4">
        <div className="flex gap-2 text-xl font-medium">
          <span className="text-primary">{questions.findIndex(q => q.id === question.id) + 1}</span>
          <input 
            value={question.title || ""} 
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            placeholder={typeDef.name || "Your question here"}
            className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <input 
          value={question.description || ""}
          onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
          placeholder="Description (optional)"
          className="bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/50 ml-6"
        />
        <div className="mt-4 ml-6">
          {Preview && <Preview question={question as any} onChange={(updates: any) => updateQuestion(question.id, updates)} />}
        </div>
      </div>
    </div>
  )
}
