"use client"
import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { formsApi } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CreateFormModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = React.useState("Untitled form")
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: () => formsApi.create({ title: title.trim() || "Untitled form" }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toast.success("Form created")
      onOpenChange(false)
      router.push(`/forms/${data.id}/create`)
    },
    onError: () => {
      toast.error("Failed to create form")
    }
  })

  React.useEffect(() => {
    if (open) setTitle("Untitled form")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new form</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Form title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") createMutation.mutate()
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
