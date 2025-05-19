"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Paintbrush } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

// Predefined color swatches
const colorSwatches = [
  // Grayscale
  "#000000",
  "#262626",
  "#525252",
  "#737373",
  "#a3a3a3",
  "#d4d4d4",
  "#e5e5e5",
  "#f5f5f5",
  "#ffffff",
  // Red
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#fecaca",
  "#fee2e2",
  // Orange
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#fed7aa",
  "#ffedd5",
  // Amber
  "#f59e0b",
  "#fbbf24",
  "#fcd34d",
  "#fde68a",
  "#fef3c7",
  // Yellow
  "#eab308",
  "#facc15",
  "#fde047",
  "#fef08a",
  "#fef9c3",
  // Lime
  "#84cc16",
  "#a3e635",
  "#bef264",
  "#d9f99d",
  "#ecfccb",
  // Green
  "#22c55e",
  "#4ade80",
  "#86efac",
  "#bbf7d0",
  "#dcfce7",
  // Emerald
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#d1fae5",
  // Teal
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#99f6e4",
  "#ccfbf1",
  // Cyan
  "#06b6d4",
  "#22d3ee",
  "#67e8f9",
  "#a5f3fc",
  "#cffafe",
  // Sky
  "#0ea5e9",
  "#38bdf8",
  "#7dd3fc",
  "#bae6fd",
  "#e0f2fe",
  // Blue
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#dbeafe",
  // Indigo
  "#4f46e5",
  "#6366f1",
  "#818cf8",
  "#a5b4fc",
  "#c7d2fe",
  // Violet
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  // Purple
  "#9333ea",
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#f3e8ff",
  // Fuchsia
  "#c026d3",
  "#d946ef",
  "#e879f9",
  "#f0abfc",
  "#fae8ff",
  // Pink
  "#db2777",
  "#ec4899",
  "#f472b6",
  "#f9a8d4",
  "#fce7f3",
  // Rose
  "#e11d48",
  "#f43f5e",
  "#fb7185",
  "#fda4af",
  "#fee2e2",
]

// Material design palette
const materialColors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#9e9e9e",
  "#607d8b",
]

// Brand colors
const brandColors = [
  "#1877F2", // Facebook
  "#1DA1F2", // Twitter
  "#0A66C2", // LinkedIn
  "#FF0000", // YouTube
  "#25D366", // WhatsApp
  "#EA4335", // Google Red
  "#4285F4", // Google Blue
  "#FBBC04", // Google Yellow
  "#34A853", // Google Green
  "#7289DA", // Discord
  "#FF6900", // Nickelodeon
  "#5865F2", // Discord Blue
  "#000000", // Apple
  "#FF3E00", // Svelte
  "#61DAFB", // React
  "#4FC08D", // Vue
  "#FF4785", // Storybook
  "#F24E1E", // Figma
  "#FF9900", // Amazon
  "#FF5A5F", // Airbnb
]

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(color)
  const [activeTab, setActiveTab] = useState<string>("swatches")

  // Update input value when color prop changes
  useEffect(() => {
    setInputValue(color)
  }, [color])

  // Function to determine if text should be white or black based on background color
  const getTextColor = useCallback((bgColor: string) => {
    // Handle transparent color
    if (bgColor === "transparent") return "#000000"

    try {
      // Convert hex to RGB
      const hex = bgColor.replace("#", "")
      const r = Number.parseInt(hex.substring(0, 2), 16)
      const g = Number.parseInt(hex.substring(2, 4), 16)
      const b = Number.parseInt(hex.substring(4, 6), 16)

      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

      // Return white for dark backgrounds, black for light backgrounds
      return luminance > 0.5 ? "#000000" : "#ffffff"
    } catch (e) {
      return "#000000" // Default to black if there's an error
    }
  }, [])

  // Validate and normalize hex color
  const validateHexColor = useCallback(
    (value: string): string => {
      // Handle transparent special case
      if (value === "transparent") return value

      // Check if it's a valid hex color
      const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/

      if (hexRegex.test(value)) {
        // Ensure it has a # prefix
        if (!value.startsWith("#")) {
          return `#${value}`
        }

        // Convert 3-digit hex to 6-digit
        if (value.length === 4) {
          const r = value[1]
          const g = value[2]
          const b = value[3]
          return `#${r}${r}${g}${g}${b}${b}`
        }

        return value
      }

      return color // Return the original color if invalid
    },
    [color],
  )

  // Handle input change and validate hex color
  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Only update if it's a valid hex color or "transparent"
    const normalizedValue = validateHexColor(value)
    if (normalizedValue !== color) {
      onChange(normalizedValue)
    }
  }

  // Handle color picker change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputValue(newColor)
    onChange(newColor)
  }

  // Handle swatch selection
  const handleSwatchClick = (swatch: string) => {
    setInputValue(swatch)
    onChange(swatch)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2 relative"
            style={{
              backgroundColor: color === "transparent" ? "#ffffff" : color,
              border: color === "transparent" ? "2px dashed #d4d4d4" : undefined,
            }}
            aria-label={`Pick a color${label ? ` for ${label}` : ""}`}
          >
            {color === "transparent" && <Paintbrush className="h-4 w-4 absolute" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" sideOffset={5}>
          <Tabs defaultValue="swatches" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="swatches" className="flex-1">
                Swatches
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swatches" className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tailwind Colors</p>
                  <ScrollArea className="h-32">
                    <div className="grid grid-cols-9 gap-1">
                      {colorSwatches.map((swatch) => (
                        <button
                          key={swatch}
                          className="w-6 h-6 rounded-md border border-gray-300 transition-transform hover:scale-110 relative"
                          style={{ backgroundColor: swatch }}
                          onClick={() => handleSwatchClick(swatch)}
                          title={swatch}
                          type="button"
                        >
                          {color.toLowerCase() === swatch.toLowerCase() && (
                            <Check
                              className="absolute inset-0 m-auto h-4 w-4"
                              style={{ color: getTextColor(swatch) }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Material Design</p>
                  <div className="grid grid-cols-5 gap-1">
                    {materialColors.map((swatch) => (
                      <button
                        key={swatch}
                        className="w-6 h-6 rounded-md border border-gray-300 transition-transform hover:scale-110 relative"
                        style={{ backgroundColor: swatch }}
                        onClick={() => handleSwatchClick(swatch)}
                        title={swatch}
                        type="button"
                      >
                        {color.toLowerCase() === swatch.toLowerCase() && (
                          <Check className="absolute inset-0 m-auto h-4 w-4" style={{ color: getTextColor(swatch) }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Brand Colors</p>
                  <div className="grid grid-cols-5 gap-1">
                    {brandColors.map((swatch) => (
                      <button
                        key={swatch}
                        className="w-6 h-6 rounded-md border border-gray-300 transition-transform hover:scale-110 relative"
                        style={{ backgroundColor: swatch }}
                        onClick={() => handleSwatchClick(swatch)}
                        title={swatch}
                        type="button"
                      >
                        {color.toLowerCase() === swatch.toLowerCase() && (
                          <Check className="absolute inset-0 m-auto h-4 w-4" style={{ color: getTextColor(swatch) }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Color Picker</label>
                  <Input
                    type="color"
                    value={color === "transparent" ? "#ffffff" : color}
                    onChange={handleColorPickerChange}
                    className="w-full h-10 p-1 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hex Value</label>
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={() => setInputValue(color)} // Reset to actual color on blur if invalid
                    className="w-full mt-1"
                  />
                </div>
                {label === "Background" && (
                  <div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        onChange("transparent")
                        setInputValue("transparent")
                        setIsOpen(false)
                      }}
                      type="button"
                    >
                      Set Transparent
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <div
        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer"
        title={color}
        onClick={() => setIsOpen(true)}
      >
        {inputValue}
      </div>
    </div>
  )
}
