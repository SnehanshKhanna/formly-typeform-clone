import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        icon={<FileQuestion className="h-10 w-10 text-muted-foreground" />}
        action={
          <Button asChild className="mt-4">
            <Link href="/">Return Home</Link>
          </Button>
        }
      />
    </div>
  )
}
