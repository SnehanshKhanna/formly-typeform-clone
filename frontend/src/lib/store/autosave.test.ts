// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createAutosaveQueue } from "./autosave"
import { formsApi } from "@/lib/api/forms"
import { questionsApi } from "@/lib/api/questions"

vi.mock("@/lib/api/forms")
vi.mock("@/lib/api/questions")

describe("autosave queue", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces rapid edits into a single PATCH", async () => {
    let currentBuckets = { form: { title: "A" } as any, questions: {} as any }
    const q = createAutosaveQueue({
      formId: "1",
      getBuckets: () => currentBuckets,
      clearBuckets: vi.fn(() => { currentBuckets = { form: {}, questions: {} } }),
      mergeBuckets: vi.fn(),
      onStatusChange: vi.fn(),
    })

    q.schedule()
    currentBuckets.form.title = "AB"
    q.schedule()
    currentBuckets.form.title = "ABC"

    vi.advanceTimersByTime(600)
    await Promise.resolve() // let enqueue tick
    await q.flushAndWait() // flush again, but it should be empty now

    expect(formsApi.update).toHaveBeenCalledTimes(1)
    expect(formsApi.update).toHaveBeenCalledWith("1", { title: "ABC" })
  })

  it("produces a follow-up PATCH for edits during an in-flight save", async () => {
    let resolveApi: any
    vi.mocked(formsApi.update).mockImplementationOnce(() => new Promise((r) => { resolveApi = r }))

    let currentBuckets = { form: { title: "A" } as any, questions: {} as any }
    const clearBuckets = vi.fn(() => { currentBuckets = { form: {}, questions: {} } })

    const q = createAutosaveQueue({
      formId: "1",
      getBuckets: () => currentBuckets,
      clearBuckets,
      mergeBuckets: vi.fn(),
      onStatusChange: vi.fn(),
    })

    q.flush() // First flush
    await Promise.resolve() // let enqueue run
    expect(formsApi.update).toHaveBeenCalledWith("1", { title: "A" })

    // Edit while in flight
    currentBuckets.form.title = "B"
    q.schedule()
    vi.advanceTimersByTime(600) // triggers second flush

    // Resolve first
    resolveApi()
    await Promise.resolve() // let first finish
    
    await q.flushAndWait() // Wait for second to finish
    expect(formsApi.update).toHaveBeenCalledTimes(2)
    expect(formsApi.update).toHaveBeenLastCalledWith("1", { title: "B" })
  })

  it("merges buckets and sets failed on error", async () => {
    vi.mocked(formsApi.update).mockRejectedValueOnce(new Error("Network Error"))

    let currentBuckets = { form: { title: "A" } as any, questions: {} as any }
    const mergeBuckets = vi.fn()
    const onStatusChange = vi.fn()

    const q = createAutosaveQueue({
      formId: "1",
      getBuckets: () => currentBuckets,
      clearBuckets: vi.fn(() => { currentBuckets = { form: {}, questions: {} } }),
      mergeBuckets,
      onStatusChange,
    })

    q.flush()
    try {
      await q.flushAndWait()
    } catch (e) {}

    expect(mergeBuckets).toHaveBeenCalledWith({ form: { title: "A" }, questions: {} })
    expect(onStatusChange).toHaveBeenLastCalledWith("failed")
  })

  it("structural deleteQuestion drops dirty bucket", async () => {
    const buckets = { form: {}, questions: { "q-1": { title: "Dirty" } } }
    const mergeBuckets = vi.fn()

    const q = createAutosaveQueue({
      formId: "1",
      getBuckets: () => buckets as any,
      clearBuckets: vi.fn(),
      mergeBuckets,
      onStatusChange: vi.fn(),
    })

    vi.mocked(questionsApi.delete).mockResolvedValueOnce(undefined)

    const p = q.deleteQuestion("q-1")
    expect(buckets.questions["q-1"]).toBeUndefined()
    expect(mergeBuckets).toHaveBeenCalled()
    await p
    expect(questionsApi.delete).toHaveBeenCalledWith("1", "q-1")
  })
})
