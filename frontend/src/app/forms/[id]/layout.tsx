"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { formsApi } from "@/lib/api"
import { BuilderStoreProvider, useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { Loader2 } from "lucide-react"
import { TopBar } from "@/components/builder/top-bar"

function BuilderDataLoader({ id, children }: { id: string; children: React.ReactNode }) {
  const router = useRouter()
  const load = useBuilderStore((state) => state.load)
  const loadState = useBuilderStore((state) => state.loadState)

  const { data, error, isLoading } = useQuery({
    queryKey: ["form", id],
    queryFn: () => formsApi.get(id),
    retry: 1,
  })

  React.useEffect(() => {
    if (data && loadState === "loading") {
      load(data)
    }
  }, [data, load, loadState])

  if (isLoading || loadState === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Form not found</h2>
        <p className="text-muted-foreground">This form doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:flex min-h-screen flex-col bg-background h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 flex overflow-hidden">{children}</main>
      </div>
      <div className="flex md:hidden min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
        <h2 className="text-xl font-bold mb-2">Desktop Required</h2>
        <p className="text-muted-foreground text-sm">
          The form builder is optimized for desktop screens. Please open this page on a larger device to edit your form.
        </p>
      </div>
    </>
  )
}

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const id = params.id as string

  return (
    <BuilderStoreProvider>
      <BuilderDataLoader id={id}>{children}</BuilderDataLoader>
    </BuilderStoreProvider>
  )
}
