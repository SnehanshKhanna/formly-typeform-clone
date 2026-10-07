"use client"
import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { formsApi } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { FormSummaryResponse } from "@/types/api"

export function RenameFormModal({ form, open, onOpenChange }: { form: FormSummaryResponse, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = React.useState(form.title)
  const queryClient = useQueryClient()

  const renameMutation = useMutation({
    mutationFn: () => formsApi.update(form.id, { title: title.trim() || "Untitled form" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toast.success("Form renamed")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to rename form")
    }
  })

  React.useEffect(() => {
    if (open) setTitle(form.title)
  }, [open, form.title])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename form</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Form title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                renameMutation.mutate();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={(e) => { e.stopPropagation(); renameMutation.mutate(); }} disabled={renameMutation.isPending || title.trim() === form.title}>
            {renameMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
