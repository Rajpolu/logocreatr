"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useEffect } from "react"

interface PresetSelectorProps {
  onSelectPreset: (preset: any) => void
}

const presets = [
  {
    name: "Modern Minimal",
    iconName: "Zap",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#000000",
    gradientColor: "#333333",
    useGradient: true,
    borderRadius: 20,
    padding: 15,
    shadow: "md",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Vibrant Gradient",
    iconName: "Sparkles",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#ff5f6d",
    gradientColor: "#ffc371",
    useGradient: true,
    borderRadius: 25,
    padding: 15,
    shadow: "lg",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Corporate Blue",
    iconName: "Building2",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#2563eb",
    gradientColor: "#3b82f6",
    useGradient: true,
    borderRadius: 15,
    padding: 15,
    shadow: "md",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Eco Green",
    iconName: "Leaf",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#10b981",
    gradientColor: "#34d399",
    useGradient: true,
    borderRadius: 20,
    padding: 15,
    shadow: "md",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Playful Rounded",
    iconName: "Gamepad2",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#8b5cf6",
    gradientColor: "#d946ef",
    useGradient: true,
    borderRadius: 50,
    padding: 15,
    shadow: "lg",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Outlined",
    iconName: "Heart",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#000000",
    iconFillOpacity: 0,
    iconFillColor: "#000000",
    backgroundColor: "#ffffff",
    gradientColor: "#ffffff",
    useGradient: false,
    borderRadius: 20,
    padding: 15,
    shadow: "sm",
    borderWidth: 2,
    borderColor: "#000000",
  },
  {
    name: "Flat Design",
    iconName: "Layers",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#f97316",
    gradientColor: "#f97316",
    useGradient: false,
    borderRadius: 10,
    padding: 15,
    shadow: "none",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Neon Glow",
    iconName: "Lightbulb",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#111111",
    gradientColor: "#222222",
    useGradient: true,
    borderRadius: 20,
    padding: 15,
    shadow: "xl",
    borderWidth: 2,
    borderColor: "#00ffaa",
  },
  {
    name: "Tech Dark",
    iconName: "Cpu",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#00ffaa",
    iconFillOpacity: 0,
    iconFillColor: "#00ffaa",
    backgroundColor: "#121212",
    gradientColor: "#1e1e1e",
    useGradient: true,
    borderRadius: 15,
    padding: 15,
    shadow: "md",
    borderWidth: 0,
    borderColor: "#000000",
  },
  {
    name: "Pastel Dream",
    iconName: "Cloud",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#6366f1",
    iconFillOpacity: 0,
    iconFillColor: "#6366f1",
    backgroundColor: "#f9fafb",
    gradientColor: "#f3f4f6",
    useGradient: true,
    borderRadius: 30,
    padding: 15,
    shadow: "sm",
    borderWidth: 0,
    borderColor: "#000000",
  },
]

export default function PresetSelector({ onSelectPreset }: PresetSelectorProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Add keyboard navigation for horizontal scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scrollAreaRef.current) return

      const scrollAmount = 150

      if (e.key === "ArrowRight") {
        scrollAreaRef.current.scrollLeft += scrollAmount
      } else if (e.key === "ArrowLeft") {
        scrollAreaRef.current.scrollLeft -= scrollAmount
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [])

  return (
    <div className="relative">
      <ScrollArea className="w-full" orientation="horizontal">
        <div
          ref={scrollAreaRef}
          className="flex gap-2 pb-4 pr-4 min-w-max overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          tabIndex={0}
          role="listbox"
          aria-label="Logo presets"
        >
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              className="flex-shrink-0 whitespace-nowrap hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onSelectPreset(preset)}
              role="option"
              aria-selected="false"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
    </div>
  )
}
