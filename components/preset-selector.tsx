"use client"

import { Button } from "@/components/ui/button"
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
    textFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
    textFont:
      "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', Calibri, sans-serif",
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
    textFont: "Helvetica, Arial, sans-serif",
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
    textFont: "Georgia, Cambria, 'Times New Roman', Times, serif",
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
    textFont:
      "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', Calibri, sans-serif",
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
    textFont: "Helvetica, Arial, sans-serif",
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
    textFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
    textFont: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
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
    textFont: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
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
    textFont:
      "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', Calibri, sans-serif",
  },
]

export default function PresetSelector({ onSelectPreset }: PresetSelectorProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Enhanced horizontal scrolling for mouse wheel and trackpad
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollAreaRef.current) return

      // Prevent default behavior to avoid page scrolling
      e.preventDefault()

      // Determine scroll direction and amount
      // For trackpads, use deltaX directly (horizontal gesture)
      // For mouse wheels, use deltaY for horizontal scrolling
      const scrollAmount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY

      // Apply the scroll
      scrollAreaRef.current.scrollLeft += scrollAmount
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      // Use { passive: false } to allow preventDefault()
      scrollArea.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={scrollAreaRef}
        className="flex gap-2 pb-4 pr-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "thin",
        }}
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
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
    </div>
  )
}
