"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { PlayerStoreProvider, usePlayerStore } from "@/lib/store/playerStore"
import { Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PublicFormResponse } from "@/types/api"

function DataLoader({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter()
  const load = usePlayerStore(state => state.load)
  const form = usePlayerStore(state => state.form)

  const { data, error, isLoading } = useQuery({
    queryKey: ["public_form", slug],
    queryFn: () => apiFetch<PublicFormResponse>(`/public/forms/${slug}`),
    retry: 1,
  })

  React.useEffect(() => {
    if (data && !form) {
      load(data)
    }
  }, [data, form, load])

  if (isLoading || (!form && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Form not found</h1>
        <p className="text-muted-foreground max-w-md">
          This form doesn&apos;t exist, is not published, or you don&apos;t have access to it.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const slug = params.slug as string

  return (
    <PlayerStoreProvider>
      <DataLoader slug={slug}>
        {children}
      </DataLoader>
    </PlayerStoreProvider>
  )
}
