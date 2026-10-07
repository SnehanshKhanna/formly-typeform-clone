import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { useState } from "react"
import { formsApi } from "@/lib/api/forms"
import { Copy, ExternalLink, Globe, AlertCircle, Users } from "lucide-react"

export function PublishModal({ children }: { children: React.ReactNode }) {
  const form = useBuilderStore((state) => state.form)
  const setPublished = useBuilderStore((state) => state.setPublished)
  const select = useBuilderStore((state) => state.select)
  
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [offenders, setOffenders] = useState<{ id: string; error: string }[]>([])
  const [justPublished, setJustPublished] = useState(false)
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false)

  if (!form) return <>{children}</>

  const isPublished = form.status === "published"
  const formUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${form.id}` : ""

  const handlePublish = async () => {
    setIsPublishing(true)
    setOffenders([])
    setJustPublished(false)
    try {
      const res = await formsApi.publish(form.id!)
      setPublished(res.published_at)
      setJustPublished(true)
    } catch (err: any) {
      if (err.status === 422 && err.body?.detail?.errors) {
        setOffenders(err.body.detail.errors)
        if (err.body.detail.errors.length > 0) {
          select(err.body.detail.errors[0].id)
        }
      } else {
        alert("An error occurred while publishing.")
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!showUnpublishConfirm) {
      setShowUnpublishConfirm(true)
      return
    }
    try {
      await formsApi.unpublish(form.id!)
      setPublished(null)
      setShowUnpublishConfirm(false)
    } catch (err) {
      alert("Failed to unpublish.")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl)
    // Would normally trigger a toast here
    alert("Copied to clipboard")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share your form</DialogTitle>
        </DialogHeader>
        
        {offenders.length > 0 ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Cannot publish form
            </div>
            <ul className="list-disc pl-5">
              {offenders.map((err, i) => (
                <li key={i}>{err.error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {justPublished && (
              <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm font-medium">
                Changes are live!
              </div>
            )}

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Public link</div>
                  <div className="text-xs text-muted-foreground">Anyone with the link can respond</div>
                </div>
              </div>

              {isPublished ? (
                <div className="flex items-center gap-2">
                  <input 
                    readOnly 
                    value={formUrl} 
                    className="flex-1 bg-muted p-2 rounded text-sm text-muted-foreground outline-none"
                  />
                  <Button size="icon" variant="outline" aria-label="Copy link" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Open in new tab" asChild>
                    <a href={`/f/${form.id}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? "Publishing..." : "Publish to get link"}
                </Button>
              )}
            </div>

            <div className="space-y-4 border rounded-lg p-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Team collaboration</div>
                  <div className="text-xs text-muted-foreground">Invite others to edit</div>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Coming Soon</span>
              </div>
            </div>

            {isPublished && (
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Form is live and accepting responses</span>
                {showUnpublishConfirm ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowUnpublishConfirm(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" onClick={handleUnpublish}>Confirm</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={handleUnpublish}>
                    Unpublish
                  </Button>
                )}
              </div>
            )}
            
            {isPublished && !justPublished && (
              <Button className="w-full" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish changes"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
