"use client"

import { Outline } from "@/components/builder/outline"
import { Canvas } from "@/components/builder/canvas"
import { SettingsPanel } from "@/components/builder/settings-panel"

export default function BuilderPage() {
  return (
    <div className="flex-1 flex overflow-hidden h-full">
      <div className="w-64 border-r bg-muted/20 flex flex-col hidden lg:flex">
        <Outline />
      </div>
      <div className="flex-1 overflow-auto bg-[#F7F7F7]">
        <Canvas />
      </div>
      <div className="w-80 border-l bg-card flex flex-col hidden lg:flex">
        <SettingsPanel />
      </div>
    </div>
  )
}
