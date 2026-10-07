"use client"

import { usePlayerStore } from "@/lib/store/playerStore"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react"
import { QuestionView } from "@/components/player/question-view"
import { useEffect, useState, useRef } from "react"
import { apiFetch } from "@/lib/api/client"
import { getQuestionType } from "@/lib/question-types"
import { useParams } from "next/navigation"

export default function PlayerPage() {
  const params = useParams()
  const slug = params.slug as string
  const form = usePlayerStore(state => state.form)
  const currentIndex = usePlayerStore(state => state.currentIndex)
  const next = usePlayerStore(state => state.next)
  const prev = usePlayerStore(state => state.prev)
  const submit = usePlayerStore(state => state.submit)
  const isSubmitting = usePlayerStore(state => state.isSubmitting)
  const isSubmitted = usePlayerStore(state => state.isSubmitted)
  const submitError = usePlayerStore(state => state.error)
  
  const [direction, setDirection] = useState<"up" | "down">("down")
  const prevIndexRef = useRef(currentIndex)

  useEffect(() => {
    if (currentIndex > prevIndexRef.current) {
      setDirection("down")
    } else if (currentIndex < prevIndexRef.current) {
      setDirection("up")
    }
    prevIndexRef.current = currentIndex
  }, [currentIndex])

  if (!form) return null

  const isWelcome = currentIndex === -1
  const isThankYou = currentIndex === form.questions.length

  const handleStart = () => next()

  const handleSubmit = async () => {
    await submit(async (answers) => {
      // transform answers into SubmissionCreate format
      const answerList = Object.entries(answers).map(([qid, val]) => {
        const q = form.questions.find(q => q.id === qid)
        if (!q || val === null || val === undefined || val === "") return null
        const typeDef = getQuestionType(q.type)
        const serialized = typeDef.serialize ? typeDef.serialize(val) : val
        return { question_id: qid, value: serialized }
      }).filter(Boolean)

      await apiFetch(`/public/forms/${slug}/submissions`, {
        method: "POST",
        body: JSON.stringify({ answers: answerList })
      })
    })
  }

  // Calculate progress
  const progress = isWelcome ? 0 : isThankYou ? 100 : Math.round((currentIndex / form.questions.length) * 100)

  // Determine what to render based on currentIndex
  let content = null
  if (isWelcome) {
    content = (
      <div className="flex flex-col items-start justify-center h-full max-w-2xl w-full px-6 md:px-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">{form.title}</h1>
        <Button onClick={handleStart} size="lg" className="text-lg px-8">
          Start
        </Button>
      </div>
    )
  } else if (isThankYou) {
    content = (
      <div className="flex flex-col items-center text-center justify-center h-full max-w-2xl w-full mx-auto px-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">{form.thank_you_title || "Thank you!"}</h1>
        <p className="text-xl text-muted-foreground mb-8">{form.thank_you_message || "Your response has been recorded."}</p>
        <Button onClick={() => window.location.href = '/'} variant="outline" size="lg">
          {form.theme?.thankYouButton || "Create a Typeform"}
        </Button>
      </div>
    )
  } else {
    const question = form.questions[currentIndex]
    if (!question) return null
    content = (
      <QuestionView 
        key={question.id} 
        question={question as any} 
        index={currentIndex} 
        total={form.questions.length}
        onNext={currentIndex === form.questions.length - 1 ? handleSubmit : next}
        isLast={currentIndex === form.questions.length - 1}
        isSubmitting={isSubmitting}
        direction={direction}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        {content}
      </div>

      {/* Bottom Bar */}
      <div className="h-14 md:h-16 border-t flex items-center justify-between px-4 md:px-6 shrink-0 bg-background z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prev} 
              disabled={isWelcome || isThankYou || currentIndex === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={currentIndex === form.questions.length - 1 ? handleSubmit : next} 
              disabled={isWelcome || isThankYou || isSubmitting}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>
          {submitError && (
            <div className="text-sm text-destructive font-medium ml-4">
              {submitError}
            </div>
          )}
          <div className="text-xs font-semibold text-muted-foreground ml-auto hidden md:block">
            Powered by Formly
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-32 md:w-48">
          {progress > 0 && progress < 100 && (
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {progress}% completed
            </div>
          )}
          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
