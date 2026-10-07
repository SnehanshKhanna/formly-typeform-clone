"use client"

import { createContext, useContext, useRef, ReactNode } from "react"
import { useStore } from "zustand"
import { createBuilderStore, BuilderState } from "./builderStore"

export type BuilderStoreApi = ReturnType<typeof createBuilderStore>

export const BuilderStoreContext = createContext<BuilderStoreApi | undefined>(undefined)

export function BuilderStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<BuilderStoreApi>(null)
  if (!storeRef.current) {
    storeRef.current = createBuilderStore()
  }

  return <BuilderStoreContext.Provider value={storeRef.current}>{children}</BuilderStoreContext.Provider>
}

export function useBuilderStore<T>(selector: (state: BuilderState) => T): T {
  const store = useContext(BuilderStoreContext)
  if (!store) {
    throw new Error("useBuilderStore must be used within a BuilderStoreProvider")
  }
  return useStore(store, selector)
}
