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

// System font stacks that are available across platforms
const fontOptions = [
  // Modern Sans-Serif Fonts
  {
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    label: "System UI (Modern)",
    className: "font-system",
  },
  {
    value:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    label: "Sans-Serif (Clean)",
    className: "font-sans",
  },
  {
    value:
      "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', Calibri, sans-serif",
    label: "Rounded Sans (Friendly)",
    className: "font-rounded",
  },

  // Classic Fonts
  {
    value: "Georgia, Cambria, 'Times New Roman', Times, serif",
    label: "Serif (Classic)",
    className: "font-serif",
  },
  {
    value: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    label: "Monospace (Technical)",
    className: "font-mono",
  },
  {
    value: "Helvetica, Arial, sans-serif",
    label: "Helvetica (Clean)",
  },
  {
    value: "Verdana, Geneva, Tahoma, sans-serif",
    label: "Verdana (Readable)",
  },
  {
    value: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
    label: "Trebuchet MS (Friendly)",
  },

  // Distinctive Fonts
  {
    value: "Impact, Haettenschweiler, 'Franklin Gothic Bold', Charcoal, 'Helvetica Inserat', 'Arial Black', sans-serif",
    label: "Impact (Bold)",
    className: "font-display",
  },
  {
    value: "'Brush Script MT', 'Brush Script Std', 'Lucida Calligraphy', 'Lucida Handwriting', cursive",
    label: "Script (Handwritten)",
    className: "font-handwriting",
  },
  {
    value: "Papyrus, Herculanum, Party LET, Curlz MT, Harrington, fantasy",
    label: "Decorative",
    className: "font-decorative",
  },
  {
    value: "'Arial Black', Gadget, sans-serif",
    label: "Arial Black (Heavy)",
  },
  {
    value: "'Lucida Console', Monaco, monospace",
    label: "Lucida Console (Tech)",
  },
]

const positionOptions = [
  { value: "above", label: "Above Icon" },
  { value: "below", label: "Below Icon" },
  { value: "center", label: "Center (Overlay)" },
]

const weightOptions = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "bold", label: "Bold" },
]

const styleOptions = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
]

export default function TextCustomization({ settings, onChange }: TextCustomizationProps) {
  const [text, setText] = useState(settings.text)

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  const handleTextBlur = () => {
    onChange("text", text)
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
              <SelectContent>
                <div className="font-categories">
                  <div className="category-label px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Modern Sans-Serif
                  </div>
                  {fontOptions.slice(0, 3).map((font) => (
                    <SelectItem key={font.value} value={font.value} className={font.className}>
                      {font.label}
                    </SelectItem>
                  ))}

                  <div className="category-label mt-2 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Classic
                  </div>
                  {fontOptions.slice(3, 8).map((font) => (
                    <SelectItem key={font.value} value={font.value} className={font.className}>
                      {font.label}
                    </SelectItem>
                  ))}

                  <div className="category-label mt-2 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Distinctive
                  </div>
                  {fontOptions.slice(8).map((font) => (
                    <SelectItem key={font.value} value={font.value} className={font.className}>
                      {font.label}
                    </SelectItem>
                  ))}
                </div>
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
              max={72}
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
              min={-2}
              max={10}
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
