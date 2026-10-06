"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/ui/error-state"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <ErrorState 
        title="Something went wrong!" 
        description={error.message || "An unexpected error occurred."}
        onRetry={reset} 
      />
    </div>
  )
}
