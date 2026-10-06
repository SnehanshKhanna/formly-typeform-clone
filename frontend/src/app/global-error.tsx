"use client"

import { ErrorState } from "@/components/ui/error-state"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <ErrorState 
            title="A critical error occurred" 
            description={error.message || "An unexpected error occurred."}
            onRetry={reset} 
          />
        </div>
      </body>
    </html>
  )
}
