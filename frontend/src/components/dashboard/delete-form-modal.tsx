"use client"
import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { formsApi } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { FormSummaryResponse } from "@/types/api"

export function DeleteFormModal({ form, open, onOpenChange }: { form: FormSummaryResponse, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => formsApi.delete(form.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toast.success("Form deleted")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to delete form")
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete form</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{form.title}</strong>? This action cannot be undone.
            {(form.response_count ?? 0) > 0 && (
              <div className="mt-2 text-destructive font-medium">
                Warning: This will permanently delete {form.response_count} response{(form.response_count ?? 0) !== 1 ? 's' : ''}.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}>Cancel</Button>
          <Button variant="destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
