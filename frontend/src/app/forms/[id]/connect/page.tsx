import { Plug, FileSpreadsheet, MessageSquare, Database } from "lucide-react"

export default function ConnectPage() {
  const integrations = [
    { id: "sheets", name: "Google Sheets", description: "Send responses to a spreadsheet automatically.", icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-100" },
    { id: "slack", name: "Slack", description: "Get a message whenever someone submits your form.", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
    { id: "webhooks", name: "Webhooks", description: "Send form responses to your own endpoints.", icon: Plug, color: "text-blue-600", bg: "bg-blue-100" },
    { id: "airtable", name: "Airtable", description: "Sync responses as records in Airtable.", icon: Database, color: "text-pink-600", bg: "bg-pink-100" }
  ]

  return (
    <div className="flex-1 overflow-auto bg-muted/10">
      <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Connect Integrations</h2>
          <p className="text-muted-foreground mt-1 text-sm">Send your responses to other apps automatically.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((app) => (
            <div key={app.id} className="flex items-start p-6 bg-background rounded-xl border shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  Coming Soon
                </span>
              </div>
              
              <div className={`p-4 rounded-lg mr-4 ${app.bg}`}>
                <app.icon className={`w-6 h-6 ${app.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{app.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{app.description}</p>
                <div className="mt-4 text-sm font-medium text-primary">Connect</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
