import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams, usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { SaveIndicator } from "./save-indicator"
import { PublishModal } from "./publish-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TopBar() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  
  const form = useBuilderStore((state) => state.form)
  const renameForm = useBuilderStore((state) => state.renameForm)
  const flushAndWait = useBuilderStore((state) => state.flushAndWait)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(form?.title || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (form && !isEditingTitle) {
      setTitleValue(form.title || "")
    }
  }, [form?.title, isEditingTitle, form])

  const handleBack = async (e: React.MouseEvent) => {
    e.preventDefault()
    await flushAndWait()
    router.push("/")
  }

  const handleTabClick = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    await flushAndWait()
    router.push(href)
  }

  const commitTitle = () => {
    setIsEditingTitle(false)
    if (titleValue.trim() && titleValue !== form?.title) {
      renameForm(titleValue.trim())
    } else {
      setTitleValue(form?.title || "")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitTitle()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
      setTitleValue(form?.title || "")
    }
  }

  const tabs = [
    { label: "Create", href: `/forms/${id}/create` },
    { label: "Settings", href: `/forms/${id}/settings` },
    { label: "Connect", href: `/forms/${id}/connect` },
    { label: "Results", href: `/forms/${id}/results` },
  ]

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-card">
      <div className="flex items-center gap-4 flex-1">
        <button aria-label="Go back" onClick={handleBack} className="p-2 hover:bg-muted rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {isEditingTitle ? (
          <input
            ref={inputRef}
            type="text"
            className="text-sm font-semibold bg-transparent border-b border-foreground outline-none w-48"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div 
            className="text-sm font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
            onClick={() => setIsEditingTitle(true)}
          >
            {form?.title || "Untitled form"}
          </div>
        )}
      </div>

      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <a
              key={tab.label}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab.href)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {tab.label}
            </a>
          )
        })}
      </nav>

      <div className="flex items-center justify-end gap-4 flex-1">
        <SaveIndicator />
        <Button variant="outline" size="sm">Preview</Button>
        <PublishModal>
          <Button size="sm" className="bg-primary text-primary-foreground">
            {form?.status === "published" ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Published
              </div>
            ) : (
              "Publish"
            )}
          </Button>
        </PublishModal>
      </div>
    </header>
  )
}
