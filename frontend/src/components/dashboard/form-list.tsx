"use client"
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { formsApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { FormRow } from "./form-row"
import { Button } from "@/components/ui/button"
import { CreateFormModal } from "./create-form-modal"
import type { FormSummaryResponse } from "@/types/api"

interface FormListProps {
  search: string
  status: "all" | "published" | "draft"
}

export function FormList({ search, status }: FormListProps) {
  const [createModalOpen, setCreateModalOpen] = React.useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["forms", search, status],
    queryFn: () => formsApi.list(search, status)
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorState title="Failed to load forms" onRetry={() => refetch()} />
  }

  const filtered = data.items
  if (filtered.length === 0) {
    if (search || status !== "all") {
      return <EmptyState title="No forms found" description="Try adjusting your search or filters." />
    }
    return (
      <div className="mt-8">
        <EmptyState 
          title="You don't have any forms yet" 
          description="Create your first form to start collecting responses."
          action={<Button onClick={() => setCreateModalOpen(true)}>Create form</Button>}
        />
        <CreateFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      {filtered.map(form => (
        <FormRow key={form.id} form={form} />
      ))}
    </div>
  )
}
