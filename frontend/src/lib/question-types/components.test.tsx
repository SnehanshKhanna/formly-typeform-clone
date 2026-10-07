import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { QuestionResponse } from "@/types/api"
import { shortTextDefinition } from "./short-text"
import { dropdownDefinition } from "./dropdown"
import { multipleChoiceDefinition } from "./multiple-choice"

describe("question types components", () => {
  it("short_text renders and types", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    const Wrapper = () => {
      const [val, setVal] = React.useState("")
      return (
        <shortTextDefinition.RespondentInput 
          question={{ type: "short_text", required: true, position: 0, config: null, description: null, title: "Test", id: "1", form_id: "1" } as unknown as QuestionResponse} 
          value={val} 
          onChange={(v) => { setVal(v as string); onChange(v) }} 
        />
      )
    }
    
    render(<Wrapper />)
    const input = screen.getByRole("textbox")
    await user.type(input, "hello")
    expect(onChange).toHaveBeenLastCalledWith("hello")
  })

  it("dropdown filters, arrows, Esc, Enter", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const options = [
      { id: "1", label: "Apple", position: 0 },
      { id: "2", label: "Banana", position: 1 }
    ]
    render(<dropdownDefinition.RespondentInput 
      question={{ type: "dropdown", required: true, position: 0, config: null, description: null, title: "Test", id: "1", form_id: "1", options } as unknown as QuestionResponse} 
      value="" 
      onChange={onChange} 
    />)
    
    // Open dropdown
    const box = screen.getByText("Select an option...")
    await user.click(box)
    
    const input = screen.getByPlaceholderText("Type to filter...")
    await user.type(input, "app")
    
    // Only apple is visible
    expect(screen.getByText("Apple")).toBeInTheDocument()
    expect(screen.queryByText("Banana")).not.toBeInTheDocument()
    
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Enter}")
    expect(onChange).toHaveBeenCalledWith(["1"])
    
    // Open again
    await user.click(box)
    await user.keyboard("{Escape}")
    expect(screen.queryByPlaceholderText("Type to filter...")).not.toBeInTheDocument()
  })

  it("multiple_choice toggles selections", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const options = [
      { id: "1", label: "Option A", position: 0 },
      { id: "2", label: "Option B", position: 1 }
    ]
    render(<multipleChoiceDefinition.RespondentInput 
      question={{ type: "multiple_choice", required: true, position: 0, config: { allow_multiple: true }, description: null, title: "Test", id: "1", form_id: "1", options } as unknown as QuestionResponse} 
      value={["1"]} 
      onChange={onChange} 
    />)
    
    const btn = screen.getByText("Option B")
    await user.click(btn)
    expect(onChange).toHaveBeenCalledWith(["1", "2"])
  })
})
