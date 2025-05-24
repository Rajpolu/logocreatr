"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ColorPicker from "@/components/color-picker"

interface TextCustomizationProps {
  settings: {
    text: string
    textEnabled: boolean
    textFont: string
    textSize: number
    textColor: string
    textPosition: string
    textWeight: string
    textStyle: string
    textLetterSpacing: number
  }
  onChange: (key: string, value: any) => void
}

// Expanded font selection with trending and popular fonts
const fontOptions = [
  // Trending Modern Fonts
  {
    value: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    label: "SF Pro Display (Apple)",
    category: "trending",
  },
  {
    value: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    label: "System UI (Modern)",
    category: "trending",
  },
  {
    value: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    label: "Segoe UI Variable (Microsoft)",
    category: "trending",
  },
  {
    value: "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, sans-serif",
    label: "Rounded Sans (Friendly)",
    category: "trending",
  },
  {
    value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    label: "Helvetica Neue (Clean)",
    category: "trending",
  },

  // Popular Sans-Serif
  {
    value: "Roboto, 'Helvetica Neue', Arial, sans-serif",
    label: "Roboto (Google)",
    category: "popular",
  },
  {
    value: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
    label: "Open Sans (Readable)",
    category: "popular",
  },
  {
    value: "Lato, 'Helvetica Neue', Arial, sans-serif",
    label: "Lato (Humanist)",
    category: "popular",
  },
  {
    value: "Montserrat, 'Helvetica Neue', Arial, sans-serif",
    label: "Montserrat (Geometric)",
    category: "popular",
  },
  {
    value: "Poppins, 'Helvetica Neue', Arial, sans-serif",
    label: "Poppins (Rounded)",
    category: "popular",
  },
  {
    value: "Source Sans Pro, 'Helvetica Neue', Arial, sans-serif",
    label: "Source Sans Pro (Adobe)",
    category: "popular",
  },

  // Classic Fonts
  {
    value: "Georgia, Cambria, 'Times New Roman', Times, serif",
    label: "Georgia (Serif)",
    category: "classic",
  },
  {
    value: "'Times New Roman', Times, serif",
    label: "Times New Roman (Traditional)",
    category: "classic",
  },
  {
    value: "Garamond, 'Times New Roman', serif",
    label: "Garamond (Elegant)",
    category: "classic",
  },
  {
    value: "Palatino, 'Palatino Linotype', 'Book Antiqua', serif",
    label: "Palatino (Calligraphic)",
    category: "classic",
  },
  {
    value: "Arial, Helvetica, sans-serif",
    label: "Arial (Universal)",
    category: "classic",
  },
  {
    value: "Verdana, Geneva, Tahoma, sans-serif",
    label: "Verdana (Screen)",
    category: "classic",
  },

  // Display & Decorative
  {
    value: "Impact, Haettenschweiler, 'Franklin Gothic Bold', Charcoal, sans-serif",
    label: "Impact (Bold)",
    category: "display",
  },
  {
    value: "'Arial Black', Gadget, sans-serif",
    label: "Arial Black (Heavy)",
    category: "display",
  },
  {
    value: "Oswald, Impact, 'Franklin Gothic Bold', sans-serif",
    label: "Oswald (Condensed)",
    category: "display",
  },
  {
    value: "'Bebas Neue', Impact, 'Franklin Gothic Bold', sans-serif",
    label: "Bebas Neue (Strong)",
    category: "display",
  },
  {
    value: "Playfair Display, Georgia, serif",
    label: "Playfair Display (Elegant)",
    category: "display",
  },

  // Script & Handwriting
  {
    value: "'Brush Script MT', 'Brush Script Std', cursive",
    label: "Brush Script (Casual)",
    category: "script",
  },
  {
    value: "'Lucida Handwriting', 'Brush Script MT', cursive",
    label: "Lucida Handwriting",
    category: "script",
  },
  {
    value: "Pacifico, 'Brush Script MT', cursive",
    label: "Pacifico (Playful)",
    category: "script",
  },
  {
    value: "'Dancing Script', 'Brush Script MT', cursive",
    label: "Dancing Script (Flowing)",
    category: "script",
  },

  // Monospace & Technical
  {
    value: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    label: "SF Mono (Apple)",
    category: "monospace",
  },
  {
    value: "'Cascadia Code', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    label: "Cascadia Code (Microsoft)",
    category: "monospace",
  },
  {
    value: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    label: "JetBrains Mono (Developer)",
    category: "monospace",
  },
  {
    value: "'Fira Code', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    label: "Fira Code (Ligatures)",
    category: "monospace",
  },
  {
    value: "'Courier New', Courier, monospace",
    label: "Courier New (Classic)",
    category: "monospace",
  },

  // Experimental & Unique
  {
    value: "Papyrus, Herculanum, fantasy",
    label: "Papyrus (Ancient)",
    category: "experimental",
  },
  {
    value: "'Comic Sans MS', cursive",
    label: "Comic Sans MS (Casual)",
    category: "experimental",
  },
  {
    value: "Chalkduster, 'Bradley Hand', cursive",
    label: "Chalkduster (Textured)",
    category: "experimental",
  },
]

const positionOptions = [
  { value: "above", label: "Above Icon" },
  { value: "below", label: "Below Icon" },
  { value: "center", label: "Center (Overlay)" },
]

const weightOptions = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" },
  { value: "normal", label: "Normal (400)" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "bold", label: "Bold (700)" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
]

const styleOptions = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
  { value: "oblique", label: "Oblique" },
]

export default function TextCustomization({ settings, onChange }: TextCustomizationProps) {
  const [text, setText] = useState(settings.text)

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  const handleTextBlur = () => {
    onChange("text", text)
  }

  // Group fonts by category
  const fontsByCategory = fontOptions.reduce(
    (acc, font) => {
      if (!acc[font.category]) acc[font.category] = []
      acc[font.category].push(font)
      return acc
    },
    {} as Record<string, typeof fontOptions>,
  )

  const categoryLabels = {
    trending: "🔥 Trending",
    popular: "⭐ Popular",
    classic: "📚 Classic",
    display: "🎨 Display",
    script: "✍️ Script",
    monospace: "💻 Monospace",
    experimental: "🧪 Experimental",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-text">Enable Text</Label>
        <Switch
          id="enable-text"
          checked={settings.textEnabled}
          onCheckedChange={(checked) => onChange("textEnabled", checked)}
        />
      </div>

      {settings.textEnabled && (
        <>
          <div>
            <Label htmlFor="text-input" className="block text-sm mb-1">
              Text Content
            </Label>
            <Input
              id="text-input"
              placeholder="Enter logo text"
              value={text}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              className="w-full rounded-full"
            />
          </div>

          <div>
            <Label htmlFor="text-font" className="block text-sm mb-1">
              Font Family
            </Label>
            <Select value={settings.textFont} onValueChange={(value) => onChange("textFont", value)}>
              <SelectTrigger id="text-font" className="rounded-full">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.entries(fontsByCategory).map(([category, fonts]) => (
                  <div key={category}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                      {categoryLabels[category as keyof typeof categoryLabels] || category}
                    </div>
                    {fonts.map((font) => (
                      <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="text-size" className="text-sm">
                Font Size
              </Label>
              <span className="text-sm">{settings.textSize}px</span>
            </div>
            <Slider
              id="text-size"
              value={[settings.textSize]}
              min={8}
              max={120}
              step={1}
              onValueChange={(value) => onChange("textSize", value[0])}
              className="my-4"
            />
          </div>

          <div>
            <Label htmlFor="text-color" className="block text-sm mb-1">
              Text Color
            </Label>
            <ColorPicker
              color={settings.textColor}
              onChange={(color) => onChange("textColor", color)}
              label="Text Color"
            />
          </div>

          <div>
            <Label htmlFor="text-position" className="block text-sm mb-1">
              Text Position
            </Label>
            <Select value={settings.textPosition} onValueChange={(value) => onChange("textPosition", value)}>
              <SelectTrigger id="text-position" className="rounded-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="text-weight" className="block text-sm mb-1">
              Font Weight
            </Label>
            <Select value={settings.textWeight} onValueChange={(value) => onChange("textWeight", value)}>
              <SelectTrigger id="text-weight" className="rounded-full">
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                {weightOptions.map((weight) => (
                  <SelectItem key={weight.value} value={weight.value}>
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="text-style" className="block text-sm mb-1">
              Font Style
            </Label>
            <Select value={settings.textStyle} onValueChange={(value) => onChange("textStyle", value)}>
              <SelectTrigger id="text-style" className="rounded-full">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="text-letter-spacing" className="text-sm">
                Letter Spacing
              </Label>
              <span className="text-sm">{settings.textLetterSpacing}px</span>
            </div>
            <Slider
              id="text-letter-spacing"
              value={[settings.textLetterSpacing]}
              min={-5}
              max={20}
              step={0.5}
              onValueChange={(value) => onChange("textLetterSpacing", value[0])}
              className="my-4"
            />
          </div>
        </>
      )}
    </div>
  )
}
