"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FormFiltersProps {
  search: string
  onSearchChange: (val: string) => void
  status: "all" | "published" | "draft"
  onStatusChange: (val: "all" | "published" | "draft") => void
}

export function FormFilters({ search, onSearchChange, status, onStatusChange }: FormFiltersProps) {
  const [localSearch, setLocalSearch] = React.useState(search)
  
  // Custom simple debounce inline to avoid extra file if not present
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="w-full sm:w-64">
        <Input 
          placeholder="Search forms..." 
          value={localSearch} 
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>
      <Tabs value={status} onValueChange={(v: any) => onStatusChange(v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
