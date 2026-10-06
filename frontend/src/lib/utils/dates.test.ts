import { describe, it, expect } from "vitest"
import { formatDate } from "./dates"

describe("dates utils", () => {
  it("formats date correctly", () => {
    expect(formatDate("2025-01-01T12:00:00Z")).toBe("Jan 1, 2025")
  })
})
