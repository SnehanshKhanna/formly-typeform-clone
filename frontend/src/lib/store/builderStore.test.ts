// @ts-nocheck
import { describe, it, expect } from "vitest"
import { createBuilderStore } from "./builderStore"
import type { FormFullResponse } from "@/types/api"

const mockForm: FormFullResponse = {
  id: "form-1",
  creator_id: "creator-1",
  title: "Test Form",
  status: "draft",
  slug: "test-slug",
  thank_you_title: "Thanks",
  thank_you_message: "Bye",
  theme: {},
  published_at: null,
  created_at: "",
  updated_at: "",
  questions: [
    {
      id: "q-1",
      form_id: "form-1",
      type: "short_text",
      title: "Q1",
      description: null,
      required: false,
      position: 0,
      config: {},
      options: [],
      created_at: "",
      updated_at: "",
    },
    {
      id: "q-2",
      form_id: "form-1",
      type: "multiple_choice",
      title: "Q2",
      description: null,
      required: true,
      position: 1,
      config: { allow_multiple: false },
      options: [
        { id: "opt-1", question_id: "q-2", label: "A", position: 0 },
      ],
      created_at: "",
      updated_at: "",
    },
  ],
}

describe("Builder Store", () => {
  it("loads data correctly", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)

    const state = store.getState()
    expect(state.loadState).toBe("loaded")
    expect(state.form?.id).toBe("form-1")
    expect(state.questions.length).toBe(2)
    expect(state.selectedId).toBe("q-1")
    expect(state.dirty).toBe(false)
    expect(state.questions[1].options![0].clientKey).toBeDefined()
  })

  it("renames form", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)
    
    store.getState().renameForm("New Title")
    expect(store.getState().form?.title).toBe("New Title")
    expect(store.getState().dirty).toBe(true)
  })

  it("updates form settings", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)
    
    store.getState().updateFormSettings({ thank_you_title: "Custom Thanks" })
    expect(store.getState().form?.thank_you_title).toBe("Custom Thanks")
    expect(store.getState().dirty).toBe(true)
  })

  it("updates question", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)
    
    store.getState().updateQuestion("q-1", { title: "Updated Q1" })
    expect(store.getState().questions[0].title).toBe("Updated Q1")
    expect(store.getState().dirty).toBe(true)
  })

  it("selects question", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)
    
    store.getState().select("q-2")
    expect(store.getState().selectedId).toBe("q-2")
  })

  it("applies selection-after-delete rule", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)
    
    store.getState().select("q-1")
    store.getState().deleteQuestion("q-1")
    
    const state = store.getState()
    expect(state.questions.length).toBe(1)
    expect(state.selectedId).toBe("q-2") // Select next
    
    store.getState().deleteQuestion("q-2")
    expect(store.getState().questions.length).toBe(0)
    expect(store.getState().selectedId).toBeNull() // Select null
  })

  it("selects previous if no next exists", () => {
    const store = createBuilderStore()
    store.getState().load(mockForm)
    
    store.getState().select("q-2")
    store.getState().deleteQuestion("q-2")
    
    const state = store.getState()
    expect(state.questions.length).toBe(1)
    expect(state.selectedId).toBe("q-1") // Select previous
  })
})
