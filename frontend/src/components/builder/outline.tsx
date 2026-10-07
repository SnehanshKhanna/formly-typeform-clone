import { useBuilderStore } from "@/lib/store/BuilderStoreProvider"
import { getAllQuestionTypes } from "@/lib/question-types/registry"
import { Copy, Trash2, Plus, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { AddQuestionPopover } from "./add-question-popover"

function SortableQuestionItem({ q, idx, isOverlay = false }: { q: any; idx: number; isOverlay?: boolean }) {
  const selectedId = useBuilderStore((state) => state.selectedId)
  const select = useBuilderStore((state) => state.select)
  const deleteQuestion = useBuilderStore((state) => state.deleteQuestion)
  const duplicateQuestion = useBuilderStore((state) => state.duplicateQuestion)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const typeDefs = getAllQuestionTypes()
  const typeDef = typeDefs.find((t) => t.type === q.type)
  const Icon = typeDef?.icon || Plus

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => select(q.id)}
      className={cn(
        "group flex items-center gap-2 p-2 text-sm rounded-md cursor-pointer transition-colors relative bg-card",
        selectedId === q.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
        isDragging && !isOverlay ? "opacity-50" : "opacity-100",
        isOverlay ? "shadow-lg border cursor-grabbing" : ""
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab hover:bg-muted-foreground/10 p-0.5 rounded -ml-1 text-muted-foreground/50 hover:text-muted-foreground"
        onClick={(e) => e.stopPropagation()} // prevent select on grip click
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      <div className="text-muted-foreground w-4 text-center text-xs">{idx + 1}</div>
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1 truncate">{q.title || typeDef?.name || "Your question here"}</div>
      
      {!isOverlay && (
        <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-card/80 px-1 rounded backdrop-blur-sm">
          <button
            onClick={(e) => { e.stopPropagation(); duplicateQuestion(q.id) }}
            className="p-1 hover:bg-muted-foreground/10 rounded"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id) }}
            className="p-1 hover:bg-destructive/10 text-destructive rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export function Outline() {
  const questions = useBuilderStore((state) => state.questions)
  const addQuestion = useBuilderStore((state) => state.addQuestion)
  const reorderQuestions = useBuilderStore((state) => state.reorderQuestions)

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      const newOrder = arrayMove(questions, oldIndex, newIndex).map(q => q.id)
      reorderQuestions(newOrder)
    }
  }

  const activeQuestion = activeId ? questions.find((q) => q.id === activeId) : null
  const activeIndex = activeQuestion ? questions.findIndex((q) => q.id === activeId) : -1

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 font-semibold text-sm border-b">Outline</div>
      <div className="flex-1 overflow-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {questions.map((q, idx) => (
                <SortableQuestionItem key={q.id} q={q} idx={idx} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
            {activeQuestion ? <SortableQuestionItem q={activeQuestion} idx={activeIndex} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <div className="p-4 border-t">
        <AddQuestionPopover />
      </div>
    </div>
  )
}
