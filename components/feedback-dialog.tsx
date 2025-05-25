"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2, CheckCircle } from "lucide-react"

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedback.trim()) {
      alert("Please provide your feedback before submitting.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          email: email.trim() || null,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setSubmitted(true)
      setFeedback("")
      setEmail("")

      // Auto-close after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSubmitted(false)
    setFeedback("")
    setEmail("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:scale-105 transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm font-medium">
                Your Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback"
                placeholder="Tell us about your experience, suggestions for improvement, or report any issues..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] resize-none rounded-lg"
                required
              />
              <p className="text-xs text-muted-foreground">
                Share your thoughts, suggestions, or report any bugs you've encountered.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Provide your email if you'd like us to follow up on your feedback.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="rounded-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !feedback.trim()}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
