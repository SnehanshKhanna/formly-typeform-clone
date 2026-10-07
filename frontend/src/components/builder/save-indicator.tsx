import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { useEffect } from "react"

export function SaveIndicator() {
  const saveStatus = useBuilderStore((state) => state.saveStatus)
  const retry = useBuilderStore((state) => state.retry)
  const flush = useBuilderStore((state) => state.flush)
  const dirty = useBuilderStore((state) => state.dirty)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty || saveStatus === "saving") {
        flush()
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [dirty, saveStatus, flush])

  if (saveStatus === "saving") {
    return <span className="text-xs text-muted-foreground">Saving…</span>
  }
  
  if (saveStatus === "failed") {
    return (
      <span className="text-xs text-destructive">
        Failed to save &middot;{" "}
        <button aria-label="Retry saving" onClick={retry} className="underline hover:no-underline">
          Retry
        </button>
      </span>
    )
  }

  return <span className="text-xs text-muted-foreground">Saved ✓</span>
}
