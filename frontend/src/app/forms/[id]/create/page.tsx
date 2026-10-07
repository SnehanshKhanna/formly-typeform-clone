"use client"

import { Outline } from "@/components/builder/outline"
import { Canvas } from "@/components/builder/canvas"
import { SettingsPanel } from "@/components/builder/settings-panel"

export default function BuilderPage() {
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full">
      <div className="md:w-64 border-b md:border-b-0 md:border-r bg-muted/20 flex flex-col shrink-0 md:h-full min-h-[150px] max-h-[25vh] md:max-h-none">
        <Outline />
      </div>
      <div className="flex-1 overflow-auto bg-[#F7F7F7] min-w-[300px]">
        <Canvas />
      </div>
      <div className="md:w-80 border-t md:border-t-0 md:border-l bg-card flex flex-col shrink-0 md:h-full min-h-[200px] max-h-[35vh] md:max-h-none">
        <SettingsPanel />
      </div>
    </div>
  )
}
