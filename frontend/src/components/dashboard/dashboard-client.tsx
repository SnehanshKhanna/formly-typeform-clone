"use client"
import * as React from "react"
import { FormFilters } from "./form-filters"
import { FormList } from "./form-list"
import { CreateFormModal } from "./create-form-modal"
import { Button } from "@/components/ui/button"

export function DashboardClient() {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<"all" | "published" | "draft">("all")
  const [createModalOpen, setCreateModalOpen] = React.useState(false)

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My forms</h1>
        <Button onClick={() => setCreateModalOpen(true)}>Create form</Button>
      </div>
      
      <FormFilters search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />
      
      <FormList search={search} status={status} />
      
      <CreateFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  )
}
