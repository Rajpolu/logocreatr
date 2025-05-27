"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Download, Loader2 } from "lucide-react"
import { downloadSVG, downloadPNG, downloadJPEG, downloadPDF } from "@/lib/download-utils"

interface ExportDialogProps {
  logoName: string
  settings: any
}

// Common size presets for logos
const sizePresets = [
  { name: "Small (256px)", width: 256, height: 256 },
  { name: "Medium (512px)", width: 512, height: 512 },
  { name: "Large (1024px)", width: 1024, height: 1024 },
  { name: "Social Media (800px)", width: 800, height: 800 },
  { name: "Favicon (32px)", width: 32, height: 32 },
  { name: "App Icon (192px)", width: 192, height: 192 },
  { name: "Print (2048px)", width: 2048, height: 2048 },
]

// Social media platform size presets
const socialMediaPresets = [
  { name: "Facebook Profile (170x170)", width: 170, height: 170 },
  { name: "Twitter Profile (400x400)", width: 400, height: 400 },
  { name: "Instagram Profile (110x110)", width: 110, height: 110 },
  { name: "LinkedIn Company (300x300)", width: 300, height: 300 },
  { name: "YouTube Channel (800x800)", width: 800, height: 800 },
]

export default function ExportDialog({ logoName, settings }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState("png")
  const [sizeOption, setSizeOption] = useState("medium")
  const [customWidth, setCustomWidth] = useState(512)
  const [customHeight, setCustomHeight] = useState(512)
  const [jpegQuality, setJpegQuality] = useState(90)
  const [jpegBackground, setJpegBackground] = useState("#ffffff")
  const [pdfSize, setPdfSize] = useState("a4")
  const [pdfOrientation, setPdfOrientation] = useState("portrait")

  const handleExport = async () => {
    try {
      setLoading(true)

      console.log("🚀 Starting export with settings:", settings)
      console.log("📊 Current background settings:", {
        useGradient: settings?.useGradient,
        backgroundColor: settings?.backgroundColor,
        gradientColor: settings?.gradientColor,
      })

      // Determine export size
      let width = 512
      let height = 512

      if (sizeOption === "custom") {
        width = customWidth
        height = customHeight
      } else if (sizeOption.startsWith("preset_")) {
        const presetIndex = Number(sizeOption.split("_")[1])
        width = sizePresets[presetIndex].width
        height = sizePresets[presetIndex].height
      } else if (sizeOption.startsWith("social_")) {
        const presetIndex = Number(sizeOption.split("_")[1])
        width = socialMediaPresets[presetIndex].width
        height = socialMediaPresets[presetIndex].height
      }

      // Export based on selected format with settings passed
      let success = false
      const fileName = logoName || "logo"

      switch (format) {
        case "svg":
          success = downloadSVG("logo-preview", fileName, settings)
          break
        case "png":
          success = await downloadPNG("logo-preview", fileName, width, height, settings)
          break
        case "jpeg":
          success = await downloadJPEG("logo-preview", fileName, width, height, jpegQuality, jpegBackground, settings)
          break
        case "pdf":
          success = await downloadPDF("logo-preview", fileName, width, height, pdfSize, pdfOrientation, settings)
          break
      }

      if (success) {
        console.log("✅ Export completed successfully")
        setTimeout(() => {
          setOpen(false)
        }, 500)
      } else {
        console.error("❌ Export failed")
        alert(`Failed to export as ${format}. Please try again.`)
      }
    } catch (error) {
      console.error(`❌ Error exporting as ${format}:`, error)
      alert(`Failed to export as ${format}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <Download className="h-4 w-4 mr-2" />
          Export Logo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Logo</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="format" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4 rounded-lg">
            <TabsTrigger value="format" className="rounded-lg">
              Format
            </TabsTrigger>
            <TabsTrigger value="size" className="rounded-lg">
              Size
            </TabsTrigger>
            <TabsTrigger value="options" className="rounded-lg">
              Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                  format === "svg" ? "border-primary bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => setFormat("svg")}
              >
                <div className="font-bold mb-1">SVG</div>
                <div className="text-xs text-muted-foreground">Vector format, scalable</div>
              </div>
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                  format === "png" ? "border-primary bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => setFormat("png")}
              >
                <div className="font-bold mb-1">PNG</div>
                <div className="text-xs text-muted-foreground">Raster format with transparency</div>
              </div>
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                  format === "jpeg" ? "border-primary bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => setFormat("jpeg")}
              >
                <div className="font-bold mb-1">JPEG</div>
                <div className="text-xs text-muted-foreground">Compressed, no transparency</div>
              </div>
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                  format === "pdf" ? "border-primary bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => setFormat("pdf")}
              >
                <div className="font-bold mb-1">PDF</div>
                <div className="text-xs text-muted-foreground">Document format for print</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="size" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="size-option">Size Presets</Label>
                <Select value={sizeOption} onValueChange={setSizeOption}>
                  <SelectTrigger id="size-option" className="rounded-lg">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">Medium (512x512)</SelectItem>
                    {sizePresets.map((preset, index) => (
                      <SelectItem key={preset.name} value={`preset_${index}`}>
                        {preset.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Size</SelectItem>
                    <SelectItem value="social" disabled>
                      -- Social Media Sizes --
                    </SelectItem>
                    {socialMediaPresets.map((preset, index) => (
                      <SelectItem key={preset.name} value={`social_${index}`}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {sizeOption === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-width">Width (px)</Label>
                    <Input
                      id="custom-width"
                      type="number"
                      min="16"
                      max="4096"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-height">Height (px)</Label>
                    <Input
                      id="custom-height"
                      type="number"
                      min="16"
                      max="4096"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Note: SVG format is vector-based and will scale to any size without quality loss.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            {format === "jpeg" && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label htmlFor="jpeg-quality">JPEG Quality</Label>
                    <span className="text-sm">{jpegQuality}%</span>
                  </div>
                  <Slider
                    id="jpeg-quality"
                    value={[jpegQuality]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(value) => setJpegQuality(value[0])}
                    className="my-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jpeg-background">Background Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-full border cursor-pointer"
                      style={{ backgroundColor: jpegBackground }}
                      onClick={() => setJpegBackground("#ffffff")}
                    />
                    <Input
                      id="jpeg-background"
                      type="text"
                      value={jpegBackground}
                      onChange={(e) => setJpegBackground(e.target.value)}
                      className="flex-1 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {format === "pdf" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdf-size">PDF Page Size</Label>
                  <Select value={pdfSize} onValueChange={setPdfSize}>
                    <SelectTrigger id="pdf-size" className="rounded-lg">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="tabloid">Tabloid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pdf-orientation">Orientation</Label>
                  <Select value={pdfOrientation} onValueChange={setPdfOrientation}>
                    <SelectTrigger id="pdf-orientation" className="rounded-lg">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {format === "png" && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  PNG format preserves transparency and is ideal for web use and digital media.
                </p>
              </div>
            )}

            {format === "svg" && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  SVG format is vector-based and will scale to any size without quality loss. It's ideal for print and
                  web use.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={handleExport} disabled={loading} className="rounded-lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
