"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, ArrowLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VersionHistoryProps {
  past: any[]
  current: any
  onRestoreVersion: (version: any, index: number) => void
}

export default function VersionHistory({ past, current, onRestoreVersion }: VersionHistoryProps) {
  const [open, setOpen] = useState(false)

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    if (!timestamp) return "Current Version"

    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Handle restoring a version
  const handleRestore = (version: any, index: number) => {
    onRestoreVersion(version, index)
    setOpen(false)
  }

  // Add timestamp to versions if they don't have one
  const versionsWithTimestamps = past.map((version, index) => {
    if (!version.timestamp) {
      return { ...version, timestamp: Date.now() - (past.length - index) * 1000 }
    }
    return version
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <History className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Version History</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-2">
              {/* Current version */}
              <div className="flex items-center justify-between p-2 rounded-md bg-primary/10 border border-primary">
                <div>
                  <div className="font-medium">Current Version</div>
                  <div className="text-xs text-muted-foreground">
                    {current.iconName} {current.textEnabled ? `with text "${current.text}"` : ""}
                  </div>
                </div>
              </div>

              {/* Past versions */}
              {versionsWithTimestamps
                .slice()
                .reverse()
                .map((version, index) => {
                  const actualIndex = past.length - 1 - index
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div>
                        <div className="font-medium">Version {past.length - index}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(version.timestamp)} - {version.iconName}
                          {version.textEnabled ? ` with text "${version.text}"` : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version, actualIndex)}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Restore
                      </Button>
                    </div>
                  )
                })}

              {past.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No previous versions available</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
