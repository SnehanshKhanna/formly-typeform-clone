import { createStore, useStore } from "zustand"
import React from "react"
import type { PublicFormResponse, QuestionResponse } from "@/types/api"
import type { AnswerValue } from "@/lib/question-types/types"

interface PlayerState {
  form: PublicFormResponse | null
  answers: Record<string, AnswerValue>
  currentIndex: number
  isSubmitted: boolean
  isSubmitting: boolean
  error: string | null

  load: (form: PublicFormResponse) => void
  setAnswer: (questionId: string, value: AnswerValue) => void
  next: () => void
  prev: () => void
  submit: (submitFn: (answers: Record<string, AnswerValue>) => Promise<void>) => Promise<void>
  reset: () => void
}

const createPlayerStore = () => createStore<PlayerState>()((set, get) => ({
  form: null,
  answers: {},
  currentIndex: -1, // -1 means welcome screen, questions start at 0
  isSubmitted: false,
  isSubmitting: false,
  error: null,

  load: (form) => set({ form, currentIndex: -1, answers: {}, isSubmitted: false, error: null }),
  
  setAnswer: (questionId, value) => set((state) => ({
    answers: { ...state.answers, [questionId]: value }
  })),

  next: () => set((state) => {
    if (!state.form) return state
    if (state.currentIndex < state.form.questions.length) {
      return { currentIndex: state.currentIndex + 1 }
    }
    return state
  }),

  prev: () => set((state) => {
    if (state.currentIndex > -1) {
      return { currentIndex: state.currentIndex - 1 }
    }
    return state
  }),

  submit: async (submitFn) => {
    const state = get()
    if (!state.form || state.isSubmitting) return
    
    set({ isSubmitting: true, error: null })
    try {
      await submitFn(state.answers)
      set({ isSubmitted: true, isSubmitting: false, currentIndex: state.form.questions.length })
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message || "Failed to submit" })
    }
  },

  reset: () => set({ answers: {}, currentIndex: -1, isSubmitted: false, error: null })
}))

const PlayerStoreContext = React.createContext<ReturnType<typeof createPlayerStore> | null>(null)

export function PlayerStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = React.useRef<ReturnType<typeof createPlayerStore> | null>(null)
  if (!storeRef.current) {
    storeRef.current = createPlayerStore()
  }
  return (
    <PlayerStoreContext.Provider value={storeRef.current}>
      {children}
    </PlayerStoreContext.Provider>
  )
}

export function usePlayerStore<T>(selector: (state: PlayerState) => T): T {
  const store = React.useContext(PlayerStoreContext)
  if (!store) throw new Error("Missing PlayerStoreProvider")
  return useStore(store, selector)
}
