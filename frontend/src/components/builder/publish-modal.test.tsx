import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PublishModal } from "./publish-modal"
import { BuilderStoreContext } from "@/lib/store/BuilderStoreProvider"
import { createBuilderStore } from "@/lib/store/builderStore"
import type { FormFullResponse } from "@/types/api"
import { formsApi } from "@/lib/api/forms"

vi.mock("@/lib/api/forms", () => ({
  formsApi: {
    publish: vi.fn(),
    unpublish: vi.fn(),
  },
}))

describe("PublishModal", () => {
  const publishedMockForm: FormFullResponse = {
    id: "uuid-1234-5678-90ab",
    creator_id: "creator-1",
    title: "Published Survey",
    status: "published",
    slug: "customer-feedback-2026",
    thank_you_title: "Thank you",
    thank_you_message: "We appreciate it",
    theme: {},
    published_at: "2026-10-07T10:00:00Z",
    created_at: "",
    updated_at: "",
    questions: [
      {
        id: "q-1",
        form_id: "uuid-1234-5678-90ab",
        type: "short_text",
        title: "Your Name",
        description: null,
        required: true,
        position: 0,
        config: {},
        options: [],
      },
    ],
  }

  it("uses form.slug and never form.id for public respondent URL and external link", async () => {
    const store = createBuilderStore()
    store.getState().load(publishedMockForm)

    render(
      <BuilderStoreContext.Provider value={store}>
        <PublishModal>
          <button data-testid="open-modal-trigger">Share</button>
        </PublishModal>
      </BuilderStoreContext.Provider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId("open-modal-trigger"))

    // Verify modal is open
    expect(screen.getByText("Share your form")).toBeInTheDocument()

    // Public URL input
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input.value).toContain("/f/customer-feedback-2026")
    expect(input.value).not.toContain("uuid-1234-5678-90ab")

    // External link anchor
    const link = screen.getByRole("link", { name: "Open in new tab" })
    expect(link).toHaveAttribute("href", "/f/customer-feedback-2026")
    expect(link.getAttribute("href")).not.toContain("uuid-1234-5678-90ab")
  })

  it("uses slug returned by formsApi.publish when transitioning from draft to published", async () => {
    const draftMockForm: FormFullResponse = {
      ...publishedMockForm,
      status: "draft",
      published_at: null,
      slug: "initial-draft-slug",
    }

    const store = createBuilderStore()
    store.getState().load(draftMockForm)

    vi.mocked(formsApi.publish).mockResolvedValueOnce({
      published_at: "2026-10-07T12:00:00Z",
      slug: "brand-new-published-slug",
    })

    render(
      <BuilderStoreContext.Provider value={store}>
        <PublishModal>
          <button data-testid="open-modal-trigger">Share</button>
        </PublishModal>
      </BuilderStoreContext.Provider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId("open-modal-trigger"))

    // In draft state, publish button is visible
    const publishBtn = screen.getByRole("button", { name: "Publish to get link" })
    await user.click(publishBtn)

    expect(formsApi.publish).toHaveBeenCalledWith("uuid-1234-5678-90ab")

    // After publish, link and input must use the newly returned slug
    const input = await screen.findByRole("textbox") as HTMLInputElement
    expect(input.value).toContain("/f/brand-new-published-slug")
    expect(input.value).not.toContain("uuid-1234-5678-90ab")

    const link = screen.getByRole("link", { name: "Open in new tab" })
    expect(link).toHaveAttribute("href", "/f/brand-new-published-slug")
  })
})
