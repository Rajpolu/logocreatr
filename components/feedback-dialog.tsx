"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bug,
  Lightbulb,
  MessageCircle,
  Palette,
  Zap,
} from "lucide-react"

interface FeedbackData {
  feedback: string
  email: string
  category: string
}

const feedbackCategories = [
  { value: "general", label: "General Feedback", icon: MessageCircle, description: "General comments or suggestions" },
  { value: "bug", label: "Bug Report", icon: Bug, description: "Report a problem or error" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature" },
  { value: "ui", label: "UI/UX Feedback", icon: Palette, description: "Interface design feedback" },
  { value: "performance", label: "Performance Issue", icon: Zap, description: "Speed or responsiveness concerns" },
]

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FeedbackData>({
    feedback: "",
    email: "",
    category: "general",
  })

  const submitTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const validateForm = useCallback((): string | null => {
    if (!formData.feedback.trim()) {
      return "Please provide your feedback before submitting."
    }

    if (formData.feedback.trim().length < 5) {
      return "Feedback must be at least 5 characters long."
    }

    if (formData.feedback.trim().length > 5000) {
      return "Feedback cannot exceed 5000 characters."
    }

    if (formData.email.trim()) {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(formData.email.trim())) {
        return "Please enter a valid email address."
      }
    }

    return null
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      // Validate form
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }

      setLoading(true)

      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController()

        console.log("🚀 Submitting feedback:", {
          feedback: formData.feedback.trim(),
          email: formData.email.trim(),
          category: formData.category,
        })

        // Set timeout for the request
        submitTimeoutRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort()
          }
        }, 15000) // 15 second timeout

        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            feedback: formData.feedback.trim(),
            email: formData.email.trim() || null,
            category: formData.category,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }),
          signal: abortControllerRef.current.signal,
        })

        // Clear timeout on successful response
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current)
        }

        let data
        try {
          data = await response.json()
        } catch (parseError) {
          throw new Error("Invalid response from server. Please try again.")
        }

        console.log("📨 Feedback response:", data)

        if (!response.ok) {
          throw new Error(data.error || `Server error (${response.status}): ${response.statusText}`)
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to submit feedback")
        }

        // Success!
        setSubmitted(true)
        setFormData({ feedback: "", email: "", category: "general" })

        // Auto-close after 3 seconds
        setTimeout(() => {
          handleClose()
        }, 3000)
      } catch (error) {
        console.error("❌ Error submitting feedback:", error)

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            setError("Request was cancelled. Please try again.")
          } else if (error.message.includes("fetch")) {
            setError("Network error. Please check your connection and try again.")
          } else {
            setError(error.message)
          }
        } else {
          setError("An unexpected error occurred. Please try again.")
        }
      } finally {
        setLoading(false)

        // Clean up timeout
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current)
        }
      }
    },
    [formData, validateForm],
  )

  const handleClose = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    setOpen(false)
    setSubmitted(false)
    setError(null)
    setLoading(false)
    setFormData({ feedback: "", email: "", category: "general" })
  }, [])

  const handleInputChange = useCallback(
    (field: keyof FeedbackData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (error) {
        setError(null)
      }
    },
    [error],
  )

  const selectedCategory = feedbackCategories.find((cat) => cat.value === formData.category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:scale-105 transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-2">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
            <p className="text-xs text-muted-foreground">This dialog will close automatically in a few seconds.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-3">
              <Label htmlFor="category" className="text-sm font-medium">
                Feedback Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger id="category" className="rounded-lg">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <selectedCategory.icon className="h-3 w-3" />
                  {selectedCategory.description}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm font-medium">
                Your Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  formData.category === "bug"
                    ? "Please describe the bug you encountered, including steps to reproduce it..."
                    : formData.category === "feature"
                      ? "Describe the feature you'd like to see and how it would help you..."
                      : "Tell us about your experience, suggestions for improvement, or any other feedback..."
                }
                value={formData.feedback}
                onChange={(e) => handleInputChange("feedback", e.target.value)}
                className="min-h-[120px] resize-none rounded-lg"
                required
                maxLength={5000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formData.category === "bug" && "Include steps to reproduce, expected vs actual behavior"}
                  {formData.category === "feature" && "Describe the feature and its benefits"}
                  {!["bug", "feature"].includes(formData.category) && "Share your thoughts and suggestions"}
                </span>
                <span>{formData.feedback.length}/5000</span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Provide your email if you'd like us to follow up on your feedback.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="rounded-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.feedback.trim()}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
