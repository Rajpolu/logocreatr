export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { feedback, email, timestamp, userAgent } = body

    // Validate required fields
    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return Response.json({ success: false, error: "Feedback is required" }, { status: 400 })
    }

    // Validate email if provided
    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
      }
    }

    // Create feedback entry
    const feedbackEntry = {
      id: crypto.randomUUID(),
      feedback: feedback.trim(),
      email: email?.trim() || null,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || null,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    }

    // In a real application, you would save this to a database
    // For now, we'll log it to the console (in production, use a proper logging service)
    console.log("New feedback received:", {
      id: feedbackEntry.id,
      feedback: feedbackEntry.feedback,
      email: feedbackEntry.email,
      timestamp: feedbackEntry.timestamp,
    })

    // You could also save to a file, send to an external service, etc.
    // Example: await saveToDatabase(feedbackEntry)
    // Example: await sendToSlack(feedbackEntry)
    // Example: await sendEmail(feedbackEntry)

    return Response.json({
      success: true,
      message: "Feedback submitted successfully",
      id: feedbackEntry.id,
    })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
