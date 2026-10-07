import * as React from "react"
import { usePlayerStore } from "@/lib/store/playerStore"
import { getQuestionType } from "@/lib/question-types"
import { ClientQuestion } from "@/lib/store/builderStore"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight } from "lucide-react"

interface QuestionViewProps {
  question: ClientQuestion
  index: number
  total: number
  onNext: () => void
  isLast: boolean
  isSubmitting: boolean
  direction: "up" | "down"
}

export function QuestionView({ question, index, total, onNext, isLast, isSubmitting, direction }: QuestionViewProps) {
  const value = usePlayerStore(state => state.answers[question.id])
  const setAnswer = usePlayerStore(state => state.setAnswer)
  
  const [error, setError] = React.useState<string | undefined>()

  const typeDef = getQuestionType(question.type)
  const InputComponent = typeDef.RespondentInput

  const handleNext = () => {
    // Validate before next
    const result = typeDef.validate(question as any, value)
    if (!result.valid) {
      setError(result.error)
      return
    }
    setError(undefined)
    onNext()
  }

  // Allow enter to go next for inputs that don't use enter
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Only if it's not a textarea
        if (document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault()
          handleNext()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [value, handleNext])

  const animationClass = direction === "down" 
    ? "animate-in fade-in slide-in-from-bottom-12 duration-500" 
    : "animate-in fade-in slide-in-from-top-12 duration-500"

  return (
    <div className={`w-full max-w-3xl px-6 md:px-12 flex flex-col ${animationClass}`}>
      <div className="flex items-center gap-2 mb-4 text-primary font-bold">
        <span>{index + 1}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        {question.title}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </h2>
      
      {question.description && (
        <p className="text-lg text-muted-foreground mb-8">{question.description}</p>
      )}
      
      <div className="my-8">
        <InputComponent 
          question={question as any} 
          value={value} 
          onChange={(val) => {
            setAnswer(question.id, val)
            setError(undefined)
          }}
          error={error as any}
          autoAdvance={handleNext}
        />
        {error && (
          <div aria-live="polite" className="mt-2 text-sm text-destructive font-medium bg-destructive/10 p-2 rounded w-fit">
            {error === "required" ? "Please answer this question" : "Invalid answer"}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Button onClick={handleNext} disabled={isSubmitting} size="lg" className="text-base">
          {isLast ? (
            isSubmitting ? "Submitting..." : "Submit"
          ) : (
            <div className="flex items-center gap-2">
              OK <Check className="w-4 h-4" />
            </div>
          )}
        </Button>
        <div className="text-xs text-muted-foreground">
          Press <strong>Enter ↵</strong>
        </div>
      </div>
    </div>
  )
}
