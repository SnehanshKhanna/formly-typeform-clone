"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResponseDrawerProps {
  formId: string
  submissionId: string | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  questions: any[]
}

export function ResponseDrawer({ 
  formId, 
  submissionId, 
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  questions
}: ResponseDrawerProps) {
  
  const { data: submission, isLoading } = useQuery({
    queryKey: ["submission", formId, submissionId],
    queryFn: () => apiFetch<any>(`/forms/${formId}/submissions/${submissionId}`),
    enabled: !!submissionId,
  })

  return (
    <Dialog open={!!submissionId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Response Details</DialogTitle>
            {submission && (
              <div className="text-sm text-muted-foreground mt-1">
                Submitted {new Date((submission as any).submitted_at).toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onPrev && (
              <Button variant="outline" size="icon" aria-label="Previous response" onClick={onPrev} disabled={!hasPrev}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {onNext && (
              <Button variant="outline" size="icon" aria-label="Next response" onClick={onNext} disabled={!hasNext}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !submission ? (
            <div className="text-center text-muted-foreground">Response not found</div>
          ) : (
            <div className="space-y-8">
              {questions.map((q) => {
                const answer = (submission as any).answers.find((a: any) => a.question_id === q.id)
                
                let display = "No answer"
                if (answer) {
                  if (answer.value_text !== null) display = answer.value_text
                  else if (answer.value_number !== null) display = answer.value_number.toString()
                  else if (answer.value_boolean !== null) display = answer.value_boolean ? "Yes" : "No"
                  else if (answer.options) display = answer.options.join(", ")
                }

                return (
                  <div key={q.id} className="space-y-2">
                    <div className="font-medium text-sm text-muted-foreground">{q.title}</div>
                    <div className="text-base font-semibold">{display}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
