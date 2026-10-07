import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { getQuestionType } from "@/lib/question-types/registry"
import { Switch } from "@/components/ui/switch"

export function SettingsPanel() {
  const selectedId = useBuilderStore((state) => state.selectedId)
  const questions = useBuilderStore((state) => state.questions)
  const updateQuestion = useBuilderStore((state) => state.updateQuestion)
  
  const question = questions.find((q) => q.id === selectedId)

  if (!selectedId || !question) {
    return <div className="p-4 text-sm text-muted-foreground">Select a question to edit settings.</div>
  }

  const typeDef = getQuestionType(question.type)
  const ConfigPanel = typeDef.ConfigPanel

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 font-semibold text-sm border-b">Settings</div>
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="space-y-4 pb-4 border-b">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question Type</div>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border text-sm">
            <typeDef.icon className="w-4 h-4 text-muted-foreground" />
            {typeDef.name}
          </div>
        </div>

        <div className="space-y-4 pb-4 border-b">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Validation</div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium cursor-pointer" htmlFor="required-switch">Required field</label>
            <Switch 
              id="required-switch"
              checked={question.required} 
              onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })} 
            />
          </div>
        </div>

        {ConfigPanel && (
          <div className="space-y-4 pb-4 border-b">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type Specific</div>
            <ConfigPanel 
              question={question as any} 
              onChange={(updates) => updateQuestion(question.id, updates as any)} 
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logic</div>
          <div className="p-3 bg-muted/50 rounded-md border border-dashed text-sm text-muted-foreground text-center">
            Coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
