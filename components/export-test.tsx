"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, AlertCircle, Download, TestTube } from "lucide-react"
import { downloadSVG, downloadPNG, downloadJPEG, downloadPDF } from "@/lib/download-utils"

interface ExportTestProps {
  settings: any
}

interface TestResult {
  format: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
  timestamp: Date
}

export default function ExportTest({ settings }: ExportTestProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const testFormats = [
    {
      name: "SVG",
      description: "Vector format test",
      test: () => downloadSVG("logo-preview", "test-logo"),
    },
    {
      name: "PNG",
      description: "Raster format test (512x512)",
      test: () => downloadPNG("logo-preview", "test-logo", 512, 512),
    },
    {
      name: "JPEG",
      description: "Compressed format test (512x512, 90% quality)",
      test: () => downloadJPEG("logo-preview", "test-logo", 512, 512, 90, "#ffffff"),
    },
    {
      name: "PDF",
      description: "Document format test (A4 portrait)",
      test: () => downloadPDF("logo-preview", "test-logo", 512, 512, "a4", "portrait"),
    },
  ]

  const runAllTests = async () => {
    setTesting(true)
    setResults([])

    for (const format of testFormats) {
      try {
        console.log(`Testing ${format.name} export...`)

        // Add a small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 500))

        const success = await format.test()

        const result: TestResult = {
          format: format.name,
          status: success ? "success" : "error",
          message: success ? `${format.name} export completed successfully` : `${format.name} export failed`,
          details: success
            ? `File should be downloaded as test-logo.${format.name.toLowerCase()}`
            : "Check browser console for detailed error information",
          timestamp: new Date(),
        }

        setResults((prev) => [...prev, result])
      } catch (error) {
        console.error(`Error testing ${format.name}:`, error)

        const result: TestResult = {
          format: format.name,
          status: "error",
          message: `${format.name} export threw an exception`,
          details: error instanceof Error ? error.message : "Unknown error occurred",
          timestamp: new Date(),
        }

        setResults((prev) => [...prev, result])
      }
    }

    setTesting(false)
  }

  const runSingleTest = async (format: (typeof testFormats)[0]) => {
    try {
      const success = await format.test()

      const result: TestResult = {
        format: format.name,
        status: success ? "success" : "error",
        message: success ? `${format.name} export completed successfully` : `${format.name} export failed`,
        details: success
          ? `File downloaded as test-logo.${format.name.toLowerCase()}`
          : "Check browser console for errors",
        timestamp: new Date(),
      }

      setResults((prev) => {
        const filtered = prev.filter((r) => r.format !== format.name)
        return [...filtered, result]
      })
    } catch (error) {
      console.error(`Error testing ${format.name}:`, error)

      const result: TestResult = {
        format: format.name,
        status: "error",
        message: `${format.name} export threw an exception`,
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      }

      setResults((prev) => {
        const filtered = prev.filter((r) => r.format !== format.name)
        return [...filtered, result]
      })
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
    } as const

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <TestTube className="h-4 w-4 mr-2" />
          Test Exports
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Format Testing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={testing} className="rounded-full">
              {testing ? "Testing..." : "Run All Tests"}
            </Button>
            <Button variant="outline" onClick={() => setResults([])} className="rounded-full">
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testFormats.map((format) => (
              <Card key={format.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{format.name}</h3>
                  <Button size="sm" variant="outline" onClick={() => runSingleTest(format)} className="rounded-full">
                    <Download className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{format.description}</p>

                {/* Show latest result for this format */}
                {results
                  .filter((r) => r.format === format.name)
                  .slice(-1)
                  .map((result, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{result.message}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        {result.details && <p className="text-xs text-muted-foreground mt-1">{result.details}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{result.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
              </Card>
            ))}
          </div>

          {results.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Test Results Summary</h3>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.format}</span>
                          {getStatusBadge(result.status)}
                          <span className="text-xs text-muted-foreground">{result.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm">{result.message}</p>
                        {result.details && <p className="text-xs text-muted-foreground">{result.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> This test will download files to verify export functionality.
            </p>
            <p>Check your Downloads folder for the test files after running tests.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
