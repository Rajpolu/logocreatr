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

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Impact", label: "Impact" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
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
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="text-font" className="block text-sm mb-1">
              Font Family
            </Label>
            <Select value={settings.textFont} onValueChange={(value) => onChange("textFont", value)}>
              <SelectTrigger id="text-font">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
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
              <SelectTrigger id="text-position">
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
              <SelectTrigger id="text-weight">
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
              <SelectTrigger id="text-style">
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
