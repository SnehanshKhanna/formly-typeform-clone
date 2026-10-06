import { toast } from "sonner"

export async function copyToClipboard(text: string, successMessage = "Copied to clipboard") {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
    } else {
      // Fallback
      const textArea = document.createElement("textarea")
      textArea.value = text
      // Avoid scrolling to bottom
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.position = "fixed"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      textArea.remove()
      toast.success(successMessage)
    }
  } catch (error) {
    console.error("Failed to copy:", error)
    toast.error("Failed to copy to clipboard")
  }
}
