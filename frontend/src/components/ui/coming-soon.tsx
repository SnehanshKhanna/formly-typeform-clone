import * as React from "react"
import { Construction } from "lucide-react"
import { cn } from "@/lib/utils"

export function ComingSoon({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 p-8 text-center text-muted-foreground",
        className
      )}
    >
      <Construction className="h-12 w-12" />
      <div className="space-y-1">
        <h3 className="font-medium text-foreground">Coming Soon</h3>
        <p className="text-sm">This feature is under construction.</p>
      </div>
    </div>
  )
}
