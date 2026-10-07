"use client"

import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  const form = useBuilderStore((state) => state.form)
  const updateFormSettings = useBuilderStore((state) => state.updateFormSettings)

  if (!form) return null

  const theme = form.theme || {}

  const handleUpdate = (updates: any) => {
    updateFormSettings(updates)
  }

  const handleThemeUpdate = (key: string, value: string) => {
    handleUpdate({ theme: { ...theme, [key]: value } })
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/10">
      <div className="max-w-2xl mx-auto py-12 px-6 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Form Settings</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage global settings for your form.</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-lg">General</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Form Title</label>
                <Input 
                  value={form.title || ""} 
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  placeholder="My Form"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <div className="flex items-center p-3 border rounded-md text-muted-foreground bg-muted/20 w-full relative">
                  <select 
                    className="w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer"
                    value={theme.language || "en"}
                    onChange={(e) => handleThemeUpdate("language", e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-lg">Thank You Screen</h3>
            <p className="text-sm text-muted-foreground">This is shown after the respondent completes the form.</p>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={form.thank_you_title || "Thank you!"} 
                  onChange={(e) => handleUpdate({ thank_you_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  value={form.thank_you_message || "Your response has been recorded."} 
                  onChange={(e) => handleUpdate({ thank_you_message: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Button Text</label>
                <Input 
                  value={theme.thankYouButton || "Create a Typeform"} 
                  onChange={(e) => handleThemeUpdate("thankYouButton", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
