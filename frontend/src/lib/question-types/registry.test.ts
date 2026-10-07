import { describe, it, expect } from "vitest"
import { getAllQuestionTypes, PLACEHOLDER_TYPES } from "./registry"
import "./index" // Ensure they are registered

describe("registry completeness", () => {
  it("all 8 types implement every member", () => {
    const types = getAllQuestionTypes()
    expect(types.length).toBe(8)

    const expectedTypes = [
      "short_text", "long_text", "email", "number",
      "yes_no", "rating", "multiple_choice", "dropdown"
    ]

    const actualTypes = types.map(t => t.type)
    expect(actualTypes.sort()).toEqual(expectedTypes.sort())

    for (const type of types) {
      expect(type.name).toBeTruthy()
      expect(type.description).toBeTruthy()
      expect(type.icon).toBeTruthy()
      expect(typeof type.isEmpty).toBe("function")
      expect(typeof type.validate).toBe("function")
      expect(typeof type.serialize).toBe("function")
      expect(typeof type.formatAnswer).toBe("function")
      expect(type.RespondentInput).toBeTruthy()
      expect(type.CanvasPreview).toBeTruthy()
      expect(type.ConfigPanel).toBeTruthy()
      expect(type.AnswerView).toBeTruthy()
      expect(type.StatView).toBeTruthy()
    }
  })

  it("exports PLACEHOLDER_TYPES (2 disabled Coming Soon)", () => {
    expect(PLACEHOLDER_TYPES.length).toBe(2)
    const types = PLACEHOLDER_TYPES.map(t => t.type)
    expect(types).toContain("file_upload")
    expect(types).toContain("payment")
  })
})
