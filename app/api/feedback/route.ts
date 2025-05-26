export async function POST(req: Request) {
  try {
    // Add request timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 10000) // 10 second timeout
    })

    const bodyPromise = req.json()
    const body = await Promise.race([bodyPromise, timeoutPromise])

    const { feedback, email, timestamp, userAgent, category = "general" } = body

    // Enhanced validation
    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return Response.json(
        {
          success: false,
          error: "Feedback is required and cannot be empty",
        },
        { status: 400 },
      )
    }

    if (feedback.trim().length < 5) {
      return Response.json(
        {
          success: false,
          error: "Feedback must be at least 5 characters long",
        },
        { status: 400 },
      )
    }

    if (feedback.trim().length > 5000) {
      return Response.json(
        {
          success: false,
          error: "Feedback cannot exceed 5000 characters",
        },
        { status: 400 },
      )
    }

    // Enhanced email validation
    if (email && typeof email === "string" && email.trim()) {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(email.trim())) {
        return Response.json(
          {
            success: false,
            error: "Please enter a valid email address",
          },
          { status: 400 },
        )
      }
    }

    // Validate category
    const validCategories = ["bug", "feature", "general", "ui", "performance"]
    if (category && !validCategories.includes(category)) {
      return Response.json(
        {
          success: false,
          error: "Invalid feedback category",
        },
        { status: 400 },
      )
    }

    // Create comprehensive feedback entry
    const feedbackEntry = {
      id: crypto.randomUUID(),
      feedback: feedback.trim(),
      email: email?.trim() || null,
      category: category || "general",
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || null,
      ip:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("cf-connecting-ip") ||
        "unknown",
      headers: {
        referer: req.headers.get("referer"),
        origin: req.headers.get("origin"),
        userAgent: req.headers.get("user-agent"),
      },
      processed: true,
      status: "received",
    }

    // Enhanced logging with structured format
    console.log("=".repeat(60))
    console.log("📝 NEW FEEDBACK RECEIVED")
    console.log("=".repeat(60))
    console.log(`🆔 ID: ${feedbackEntry.id}`)
    console.log(`📂 Category: ${feedbackEntry.category}`)
    console.log(`💬 Feedback: ${feedbackEntry.feedback}`)
    console.log(`📧 Email: ${feedbackEntry.email || "Not provided"}`)
    console.log(`⏰ Timestamp: ${feedbackEntry.timestamp}`)
    console.log(`🌐 IP: ${feedbackEntry.ip}`)
    console.log(`🔧 User Agent: ${feedbackEntry.userAgent || "Not provided"}`)
    console.log("=".repeat(60))

    // Simulate processing time for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    // In production, you would:
    // 1. Save to database: await saveToDatabase(feedbackEntry)
    // 2. Send notifications: await sendToSlack(feedbackEntry)
    // 3. Send email: await sendEmailNotification(feedbackEntry)
    // 4. Log to external service: await logToService(feedbackEntry)

    return Response.json(
      {
        success: true,
        message: "Thank you! Your feedback has been received successfully.",
        id: feedbackEntry.id,
        timestamp: feedbackEntry.timestamp,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("❌ FEEDBACK API ERROR:", error)

    // Determine error type and provide appropriate response
    if (error instanceof SyntaxError) {
      return Response.json(
        {
          success: false,
          error: "Invalid request format. Please try again.",
        },
        { status: 400 },
      )
    }

    if (error instanceof Error && error.message === "Request timeout") {
      return Response.json(
        {
          success: false,
          error: "Request timed out. Please check your connection and try again.",
        },
        { status: 408 },
      )
    }

    return Response.json(
      {
        success: false,
        error: "We're experiencing technical difficulties. Please try again in a moment.",
        errorId: crypto.randomUUID(), // For tracking purposes
      },
      { status: 500 },
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
