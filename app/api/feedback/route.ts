export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { feedback, email, timestamp, userAgent } = body

    // Validate required fields
    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return Response.json({ success: false, error: "Feedback is required" }, { status: 400 })
    }

    // Validate email if provided
    if (email && typeof email === "string" && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
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
      processed: true,
    }

    // Log feedback to console (in production, save to database)
    console.log("=== NEW FEEDBACK RECEIVED ===")
    console.log("ID:", feedbackEntry.id)
    console.log("Feedback:", feedbackEntry.feedback)
    console.log("Email:", feedbackEntry.email || "Not provided")
    console.log("Timestamp:", feedbackEntry.timestamp)
    console.log("User Agent:", feedbackEntry.userAgent)
    console.log("IP:", feedbackEntry.ip)
    console.log("=============================")

    // Simulate processing delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 500))

    return Response.json({
      success: true,
      message: "Feedback submitted successfully",
      id: feedbackEntry.id,
    })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to process feedback. Please try again.",
      },
      { status: 500 },
    )
  }
}
