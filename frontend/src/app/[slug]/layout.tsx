export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* The respondent view usually takes full screen with minimal or no headers */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
