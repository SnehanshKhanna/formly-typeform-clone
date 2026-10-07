"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { formatRelativeTime } from "@/lib/utils/dates"
import { MoreHorizontal, FileText, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"
import { formsApi } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RenameFormModal } from "./rename-form-modal"
import { DeleteFormModal } from "./delete-form-modal"
import type { FormSummaryResponse } from "@/types/api"

const PALETTE = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"
]

export function FormRow({ form }: { form: FormSummaryResponse }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  // Color by ID hash for determinism
  const hash = form.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorClass = PALETTE[hash % PALETTE.length]

  const publishMutation = useMutation({
    mutationFn: () => formsApi.publish(form.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toast.success("Form published")
    },
    onError: () => {
      toast.error("Failed to publish form")
      router.push(`/forms/${form.id}/create`) // To see errors
    }
  })

  const unpublishMutation = useMutation({
    mutationFn: () => formsApi.unpublish(form.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toast.success("Form unpublished")
    },
    onError: () => toast.error("Failed to unpublish form")
  })

  const duplicateMutation = useMutation({
    mutationFn: () => formsApi.duplicate(form.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toast.success("Form duplicated")
    },
    onError: () => toast.error("Failed to duplicate form")
  })

  const handleCopyLink = () => {
    if (form.status !== "published") return
    const url = `${window.location.origin}/f/${form.id}`
    // Since copyToClipboard might be missing, I'll use standard navigator.clipboard
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied")
    })
  }

  return (
    <div className="group flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer" onClick={(e) => {
      // Don't navigate if clicking on dropdown
      const target = e.target as HTMLElement
      if (!target.closest('[data-prevent-nav="true"]')) {
        router.push(`/forms/${form.id}/create`)
      }
    }}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-md flex items-center justify-center text-white ${colorClass}`}>
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold">{form.title}</span>
          <span className="text-sm text-muted-foreground">
            Updated {formatRelativeTime(form.updated_at)} ago
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end mr-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{form.question_count ?? 0} questions</span>
            <span>·</span>
            <span>{form.response_count ?? 0} responses</span>
          </div>
          <div className="mt-1">
            {form.status === "published" ? (
              <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Published</Badge>
            ) : (
              <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200"><Circle className="w-3 h-3 mr-1" /> Draft</Badge>
            )}
          </div>
        </div>
        
        <div data-prevent-nav="true">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(`/forms/${form.id}/create`)}>Open in builder</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/forms/${form.id}/results`)}>View results</DropdownMenuItem>
              {form.status === "published" && <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>}
              <hr className="my-1 border-border" />
              {form.status === "published" ? (
                <DropdownMenuItem onClick={() => {
                  if (confirm("Are you sure you want to unpublish this form?")) unpublishMutation.mutate()
                }}>Unpublish</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => publishMutation.mutate()}>Publish</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateMutation.mutate()}>Duplicate</DropdownMenuItem>
              <hr className="my-1 border-border" />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <RenameFormModal form={form} open={renameOpen} onOpenChange={setRenameOpen} />
      <DeleteFormModal form={form} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
