"use client"

import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { ResponseDrawer } from "@/components/results/response-drawer"

export default function ResultsPage() {
  const form = useBuilderStore((state) => state.form)
  const questions = useBuilderStore((state) => state.questions)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const currentTab = searchParams.get("tab") || "summary"
  const selectedResponseId = searchParams.get("response")

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", form?.id],
    queryFn: () => apiFetch<any>(`/forms/${form?.id}/stats`),
    enabled: !!form?.id,
  })

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["submissions", form?.id],
    queryFn: () => apiFetch<any>(`/forms/${form?.id}/submissions?limit=25`),
    enabled: !!form?.id,
  })

  if (!form) return null

  if (statsLoading || submissionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleTabChange = (val: string) => {
    router.push(`${pathname}?tab=${val}`)
  }

  const handleRowClick = (subId: string) => {
    router.push(`${pathname}?tab=responses&response=${subId}`)
  }

  const handleDrawerClose = () => {
    router.push(`${pathname}?tab=responses`)
  }

  const submissionsList = Array.isArray(submissions) ? submissions : []
  const selectedIndex = submissionsList.findIndex((s: any) => s.id === selectedResponseId)
  const hasPrev = selectedIndex > 0
  const hasNext = submissionsList.length > 0 && selectedIndex < submissionsList.length - 1

  const handlePrev = () => {
    if (hasPrev) handleRowClick(submissionsList[selectedIndex - 1].id)
  }
  const handleNext = () => {
    if (hasNext) handleRowClick(submissionsList[selectedIndex + 1].id)
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/10 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Results</h2>
          <p className="text-muted-foreground mt-1">View and analyze your form responses.</p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background border rounded-lg p-6 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Total Responses</div>
                <div className="text-3xl font-bold mt-2">{(stats as any)?.total_submissions || 0}</div>
              </div>
              <div className="bg-background border rounded-lg p-6 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
                <div className="text-3xl font-bold mt-2">
                  {(stats as any)?.completion_rate ? `${Math.round((stats as any).completion_rate * 100)}%` : "0%"}
                </div>
              </div>
              <div className="bg-background border rounded-lg p-6 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Average Time</div>
                <div className="text-3xl font-bold mt-2">
                  {(stats as any)?.average_time_seconds ? `${Math.round((stats as any).average_time_seconds)}s` : "--"}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Question Summary</h3>
              {Object.entries((stats as any)?.question_stats || {}).map(([qId, qStat]: [string, any]) => {
                const question = questions?.find((q: any) => q.id === qId)
                if (!question) return null
                return (
                  <div key={qId} className="bg-background border rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">{question.title}</h4>
                    <div className="text-sm text-muted-foreground">
                      {qStat.total_responses ?? 0} answers
                    </div>
                  </div>
                )
              })}
              {(!(stats as any)?.question_stats || Object.keys((stats as any).question_stats).length === 0) && (
                <div className="bg-background border rounded-lg p-12 text-center text-muted-foreground shadow-sm">
                  No data available yet. Share your form to get responses!
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="responses" className="mt-6">
            <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
              {submissionsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Submitted At</th>
                        {questions?.map((q: any) => (
                          <th key={q.id} className="px-6 py-3 font-medium whitespace-nowrap max-w-[200px] truncate">
                            {q.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissionsList.map((sub: any) => (
                        <tr 
                          key={sub.id} 
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(sub.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(sub.submitted_at).toLocaleString()}
                          </td>
                          {questions?.map((q: any) => {
                            const answer = sub.answers.find((a: any) => a.question_id === q.id)
                            let display = "—"
                            if (answer && answer.value !== undefined && answer.value !== null) {
                              if (typeof answer.value === 'boolean') {
                                display = answer.value ? "Yes" : "No"
                              } else if (Array.isArray(answer.value)) {
                                display = answer.value.join(", ")
                              } else {
                                display = String(answer.value)
                              }
                            }
                            return (
                              <td key={q.id} className="px-6 py-4 max-w-[200px] truncate">
                                {display}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No responses yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <ResponseDrawer 
          formId={form.id!}
          submissionId={selectedResponseId ?? null}
          onClose={handleDrawerClose}
          questions={questions ?? []}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      </div>
    </div>
  )
}
