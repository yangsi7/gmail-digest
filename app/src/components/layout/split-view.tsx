'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'

interface SplitViewProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultSize?: number
  minSize?: number
  className?: string
}

export function SplitView({
  left,
  right,
  defaultSize = 40,
  minSize = 25,
  className
}: SplitViewProps) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className={cn('min-h-[calc(100vh-12rem)] rounded-lg border', className)}
    >
      <ResizablePanel defaultSize={defaultSize} minSize={minSize}>
        <div className="h-full overflow-hidden">
          {left}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={minSize}>
        <div className="h-full overflow-hidden">
          {right}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
