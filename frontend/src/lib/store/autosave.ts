import { formsApi } from "@/lib/api/forms"
import { questionsApi } from "@/lib/api/questions"
import { ClientQuestion } from "./builderStore"
import { FormResponse, QuestionResponse } from "@/types/api"

export type DirtyBuckets = {
  form: Partial<FormResponse>
  questions: Record<string, Partial<ClientQuestion>>
}

export type AutosaveOptions = {
  formId: string
  getBuckets: () => DirtyBuckets
  clearBuckets: () => void
  mergeBuckets: (failedBuckets: DirtyBuckets) => void
  onStatusChange: (status: "saving" | "saved" | "failed") => void
  onQuestionsUpdated?: (updatedQuestions: Record<string, QuestionResponse>) => void
}

export function createAutosaveQueue(options: AutosaveOptions) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let queue = Promise.resolve()
  let isFlushing = false

  const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    const next = queue.then(task).catch((e) => {
      console.error("Autosave task failed", e)
      throw e
    })
    queue = next.catch(() => {}) as any // Prevent unhandled rejections in the queue
    return next
  }

  const flush = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    const buckets = options.getBuckets()
    const hasFormEdits = Object.keys(buckets.form).length > 0
    const hasQuestionEdits = Object.keys(buckets.questions).length > 0

    if (!hasFormEdits && !hasQuestionEdits) return

    options.clearBuckets()
    options.onStatusChange("saving")

      enqueue(async () => {
      try {
        if (hasFormEdits) {
          await formsApi.update(options.formId, buckets.form)
        }
        const updatedQuestions: Record<string, QuestionResponse> = {}
        for (const [qid, updates] of Object.entries(buckets.questions)) {
          // Send only changed fields. If options changed, we need to send the full list.
          updatedQuestions[qid] = await questionsApi.update(options.formId, qid, updates as any)
        }
        if (options.onQuestionsUpdated && Object.keys(updatedQuestions).length > 0) {
          options.onQuestionsUpdated(updatedQuestions)
        }
        options.onStatusChange("saved")
      } catch (err) {
        options.mergeBuckets(buckets)
        options.onStatusChange("failed")
        throw err
      }
    })
  }

  const flushAndWait = async () => {
    flush()
    await queue
  }

  const schedule = () => {
    if (timer) clearTimeout(timer)
    options.onStatusChange("saving") // Show saving immediately when typing
    timer = setTimeout(() => {
      flush()
    }, 600)
  }

  // Structural operations (bypasses debounce, goes straight to queue)
  const addQuestion = async (questionData: any) => {
    return enqueue(async () => {
      options.onStatusChange("saving")
      try {
        const result = await questionsApi.create(options.formId, questionData)
        options.onStatusChange("saved")
        return result
      } catch (e) {
        options.onStatusChange("failed")
        throw e
      }
    })
  }

  const duplicateQuestion = async (qid: string) => {
    return enqueue(async () => {
      options.onStatusChange("saving")
      try {
        const result = await questionsApi.duplicate(options.formId, qid)
        options.onStatusChange("saved")
        return result
      } catch (e) {
        options.onStatusChange("failed")
        throw e
      }
    })
  }

  const deleteQuestion = async (qid: string) => {
    // Optimistic, so we clear its dirty bucket if any
    const buckets = options.getBuckets()
    if (buckets.questions[qid]) {
      delete buckets.questions[qid]
      options.mergeBuckets(buckets) // Not really merging, but modifying the real bucket
    }
    return enqueue(async () => {
      options.onStatusChange("saving")
      try {
        await questionsApi.delete(options.formId, qid)
        options.onStatusChange("saved")
      } catch (e) {
        options.onStatusChange("failed")
        throw e
      }
    })
  }

  const reorderQuestions = async (orderedIds: string[]) => {
    return enqueue(async () => {
      options.onStatusChange("saving")
      try {
        await questionsApi.reorder(options.formId, { question_ids: orderedIds })
        options.onStatusChange("saved")
      } catch (e) {
        options.onStatusChange("failed")
        throw e
      }
    })
  }

  const retry = () => {
    flush()
  }

  return {
    schedule,
    flush,
    flushAndWait,
    retry,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    enqueue,
  }
}
