"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download } from "lucide-react"

export default function AILogoGenerator() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateLogo = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to generate logo")
      }

      setGeneratedLogo(data.svg)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate logo")
    } finally {
      setLoading(false)
    }
  }

  const downloadSVG = () => {
    if (!generatedLogo) return

    try {
      // Create a blob from the SVG string
      const blob = new Blob([generatedLogo], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement("a")
      link.href = url
      link.download = "ai-generated-logo.svg"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading SVG:", error)
      alert("There was an error downloading the SVG. Please try again.")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">AI Logo Generator</h2>
        <p className="text-gray-500 mb-6">
          Describe your brand or the logo you want, and our AI will create a custom logo for you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logo Description</label>
            <Textarea
              placeholder="E.g., A modern tech company logo with blue and green colors"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={generateLogo} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Logo"
            )}
          </Button>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </Card>

      <div className="flex flex-col items-center justify-center">
        {generatedLogo ? (
          <div className="flex flex-col items-center">
            <Card className="p-8 mb-6 shadow-md">
              <div className="w-64 h-64" dangerouslySetInnerHTML={{ __html: generatedLogo }} />
            </Card>
            <Button variant="outline" onClick={downloadSVG}>
              <Download className="mr-2 h-4 w-4" />
              Download SVG
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">
            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400">Your AI logo will appear here</p>
            </div>
            <p>Enter a description and click "Generate Logo" to create your custom logo.</p>
          </div>
        )}
      </div>
    </div>
  )
}
