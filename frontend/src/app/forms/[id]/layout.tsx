export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b h-14 flex items-center px-4 justify-between bg-card">
        <div className="font-semibold text-sm">Form Builder</div>
        <div className="flex items-center gap-2">
          {/* Builder Nav Placeholder */}
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  )
}
