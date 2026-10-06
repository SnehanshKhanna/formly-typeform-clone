export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b h-14 flex items-center px-4 md:px-6">
        <div className="font-bold text-lg tracking-tight">Formly</div>
        <div className="ml-auto flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">U</div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
