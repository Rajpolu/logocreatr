"use client"

import { useState, useReducer, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Undo2, Redo2, Search, Palette, Type, Github } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LogoPreview from "@/components/logo-preview"
import IconSelector from "@/components/icon-selector"
import ColorPicker from "@/components/color-picker"
import PresetSelector from "@/components/preset-selector"
import TextCustomization from "@/components/text-customization"
import AILogoGenerator from "@/components/ai-logo-generator"
import ExportDialog from "@/components/export-dialog"
import { historyReducer, initialState } from "@/lib/history-reducer"
import { downloadSVG, downloadPNG } from "@/lib/download-utils"
import VersionHistory from "@/components/version-history"

export default function Home() {
  const [state, dispatch] = useReducer(historyReducer, initialState)
  const { current, past, future } = state

  const [searchTerm, setSearchTerm] = useState("")
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null)
  const [downloadPopoverOpen, setDownloadPopoverOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("icon") // "icon", "text", "background"

  const handleChange = useCallback(
    (key: string, value: any) => {
      dispatch({
        type: "UPDATE",
        payload: {
          ...current,
          [key]: value,
        },
      })
    },
    [current],
  )

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" })
  }, [])

  const handleRedo = useCallback(() => {
    dispatch({ type: "REDO" })
  }, [])

  const applyPreset = useCallback(
    (preset: any) => {
      dispatch({
        type: "UPDATE",
        payload: {
          ...current,
          ...preset,
        },
      })
    },
    [current],
  )

  const handleDownload = useCallback(
    async (format: "svg" | "png") => {
      try {
        setDownloadLoading(format)

        let success = false
        if (format === "svg") {
          success = downloadSVG("logo-preview", current.iconName || "logo")
        } else {
          success = await downloadPNG("logo-preview", current.iconName || "logo")
        }

        if (success) {
          // Close the popover after successful download
          setTimeout(() => {
            setDownloadPopoverOpen(false)
          }, 500)
        }
      } catch (error) {
        console.error(`Error downloading ${format}:`, error)
        alert(`Failed to download ${format}. Please try again.`)
      } finally {
        setDownloadLoading(null)
      }
    },
    [current.iconName],
  )

  const handleRestoreVersion = useCallback((version, index) => {
    dispatch({
      type: "RESTORE_VERSION",
      payload: { version, index },
    })
  }, [])

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-black p-2 rounded">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Logo Creator</h1>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open("https://github.com/yourusername/logo-creator", "_blank")}
                    className="rounded-full"
                  >
                    <Github className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View on GitHub</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUndo}
                    disabled={past.length === 0}
                    className="rounded-full"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRedo}
                    disabled={future.length === 0}
                    className="rounded-full"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <VersionHistory past={past} current={current} onRestoreVersion={handleRestoreVersion} />

            {/* Replace the simple download popover with the new ExportDialog */}
            <ExportDialog logoName={current.iconName || "logo"} settings={current} />
          </div>
        </header>

        <Tabs defaultValue="customize" className="w-full">
          <TabsList className="mb-6 rounded-full">
            <TabsTrigger value="customize" className="rounded-full">
              Customize Logo
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-full">
              AI Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customize">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6 md:max-h-[calc(100vh-180px)] md:overflow-y-auto pr-2">
                <Card className="p-4">
                  <h2 className="text-lg font-medium mb-4">Presets</h2>
                  <PresetSelector onSelectPreset={applyPreset} />
                </Card>

                <Card className="p-4">
                  <div className="flex border-b mb-4">
                    <button
                      className={`px-4 py-2 ${
                        activeTab === "icon" ? "border-b-2 border-primary font-medium" : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("icon")}
                    >
                      <Palette className="h-4 w-4 inline mr-2" />
                      Icon
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        activeTab === "text" ? "border-b-2 border-primary font-medium" : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("text")}
                    >
                      <Type className="h-4 w-4 inline mr-2" />
                      Text
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        activeTab === "background" ? "border-b-2 border-primary font-medium" : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("background")}
                    >
                      <div className="h-4 w-4 bg-gray-300 rounded inline-block mr-2" />
                      Background
                    </button>
                  </div>

                  {activeTab === "icon" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-medium mb-2">Icon Selection</h3>
                        <div className="relative mb-4">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search icons..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="h-48">
                          <IconSelector
                            searchTerm={searchTerm}
                            selectedIcon={current.iconName}
                            onSelectIcon={(icon) => handleChange("iconName", icon)}
                          />
                        </ScrollArea>
                      </div>

                      <div>
                        <h3 className="text-md font-medium mb-2">Icon Customization</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm">Size</label>
                              <span className="text-sm">{current.iconSize}%</span>
                            </div>
                            <Slider
                              value={[current.iconSize]}
                              min={10}
                              max={150}
                              step={1}
                              onValueChange={(value) => handleChange("iconSize", value[0])}
                              className="my-4"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm">Rotation</label>
                              <span className="text-sm">{current.iconRotation}°</span>
                            </div>
                            <Slider
                              value={[current.iconRotation]}
                              min={0}
                              max={360}
                              step={1}
                              onValueChange={(value) => handleChange("iconRotation", value[0])}
                              className="my-4"
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1">Icon Color</label>
                            <ColorPicker
                              color={current.iconColor}
                              onChange={(color) => handleChange("iconColor", color)}
                              label="Icon Color"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm">Fill Opacity</label>
                              <span className="text-sm">{current.iconFillOpacity}%</span>
                            </div>
                            <Slider
                              value={[current.iconFillOpacity]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => handleChange("iconFillOpacity", value[0])}
                              className="my-4"
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1">Fill Color</label>
                            <ColorPicker
                              color={current.iconFillColor}
                              onChange={(color) => handleChange("iconFillColor", color)}
                              label="Fill Color"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "text" && (
                    <div>
                      <h3 className="text-md font-medium mb-2">Text Customization</h3>
                      <TextCustomization settings={current} onChange={handleChange} />
                    </div>
                  )}

                  {activeTab === "background" && (
                    <div>
                      <h3 className="text-md font-medium mb-2">Background Customization</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="use-gradient">Use Gradient</Label>
                          <Switch
                            id="use-gradient"
                            checked={current.useGradient}
                            onCheckedChange={(checked) => handleChange("useGradient", checked)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Background Color</label>
                          <ColorPicker
                            color={current.backgroundColor}
                            onChange={(color) => handleChange("backgroundColor", color)}
                            label="Background"
                          />
                        </div>

                        {current.useGradient && (
                          <div>
                            <label className="block text-sm mb-1">Gradient Color</label>
                            <ColorPicker
                              color={current.gradientColor}
                              onChange={(color) => handleChange("gradientColor", color)}
                              label="Gradient"
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="text-sm">Border Radius</label>
                            <span className="text-sm">{current.borderRadius}%</span>
                          </div>
                          <Slider
                            value={[current.borderRadius]}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(value) => handleChange("borderRadius", value[0])}
                            className="my-4"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="text-sm">Padding</label>
                            <span className="text-sm">{current.padding}%</span>
                          </div>
                          <Slider
                            value={[current.padding]}
                            min={0}
                            max={30}
                            step={1}
                            onValueChange={(value) => handleChange("padding", value[0])}
                            className="my-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Shadow</label>
                          <Select value={current.shadow} onValueChange={(value) => handleChange("shadow", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shadow style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="sm">Small</SelectItem>
                              <SelectItem value="md">Medium</SelectItem>
                              <SelectItem value="lg">Large</SelectItem>
                              <SelectItem value="xl">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="text-sm">Border Width</label>
                            <span className="text-sm">{current.borderWidth}px</span>
                          </div>
                          <Slider
                            value={[current.borderWidth]}
                            min={0}
                            max={10}
                            step={0.5}
                            onValueChange={(value) => handleChange("borderWidth", value[0])}
                            className="my-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Border Color</label>
                          <ColorPicker
                            color={current.borderColor}
                            onChange={(color) => handleChange("borderColor", color)}
                            label="Border"
                          />
                        </div>
                      </div>

                      {/* Add grid controls */}
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Grid Overlay</h4>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-grid">Show Grid</Label>
                          <Switch
                            id="show-grid"
                            checked={current.showGrid}
                            onCheckedChange={(checked) => handleChange("showGrid", checked)}
                          />
                        </div>

                        {current.showGrid && (
                          <>
                            <div className="mt-4">
                              <div className="flex justify-between mb-1">
                                <label className="text-sm">Grid Size</label>
                                <span className="text-sm">{current.gridSize}</span>
                              </div>
                              <Slider
                                value={[current.gridSize]}
                                min={5}
                                max={20}
                                step={1}
                                onValueChange={(value) => handleChange("gridSize", value[0])}
                                className="my-4"
                              />
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm mb-1">Grid Color</label>
                              <ColorPicker
                                color={current.gridColor}
                                onChange={(color) => handleChange("gridColor", color)}
                                label="Grid"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
                {/* Add footer at the bottom */}
                <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t">
                  Made with ❤️ in India by Rajpolu
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col items-center justify-center">
                <LogoPreview settings={current} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <AILogoGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
