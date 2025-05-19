export const downloadSVG = (elementId: string, fileName: string) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error("Element not found for SVG export:", elementId)
      alert("Could not find the logo element for export.")
      return false
    }

    // Get computed styles
    const styles = window.getComputedStyle(element)
    const width = Number.parseInt(styles.width)
    const height = Number.parseInt(styles.height)

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", width.toString())
    svg.setAttribute("height", height.toString())
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.setAttribute("version", "1.1")

    // Create background rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", "100%")
    rect.setAttribute("height", "100%")

    // Handle background - could be gradient or solid color
    if (styles.background.includes("linear-gradient")) {
      // For gradient backgrounds, create a linearGradient element
      const gradientId = "logoGradient"
      const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      linearGradient.setAttribute("id", gradientId)
      linearGradient.setAttribute("x1", "0%")
      linearGradient.setAttribute("y1", "0%")
      linearGradient.setAttribute("x2", "100%")
      linearGradient.setAttribute("y2", "100%")

      // Extract colors from the gradient
      // Try different regex patterns to handle various gradient formats
      let colors: string[] = []
      const gradientPatterns = [
        /linear-gradient$$\s*([^,]+),\s*([^)]+)\s*$$/,
        /linear-gradient$$\s*to\s+[^,]+,\s*([^,]+),\s*([^)]+)\s*$$/,
        /linear-gradient$$\s*([0-9]+deg),\s*([^,]+),\s*([^)]+)\s*$$/,
      ]

      let match = null
      for (const pattern of gradientPatterns) {
        match = styles.background.match(pattern)
        if (match) {
          // If the pattern has 3 groups, the colors are in groups 2 and 3
          if (match.length >= 4) {
            colors = [match[2], match[3]].map((c) => c.trim())
          }
          // If the pattern has 2 groups, the colors are in groups 1 and 2
          else if (match.length >= 3) {
            colors = [match[1], match[2]].map((c) => c.trim())
          }
          break
        }
      }

      if (colors.length >= 2) {
        // Create stops
        colors.forEach((color, index) => {
          const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop")
          stop.setAttribute("offset", index === 0 ? "0%" : "100%")
          stop.setAttribute("stop-color", color)
          linearGradient.appendChild(stop)
        })

        svg.appendChild(linearGradient)
        rect.setAttribute("fill", `url(#${gradientId})`)
      } else {
        // Fallback if gradient parsing fails
        rect.setAttribute("fill", styles.backgroundColor || "#ffffff")
      }
    } else {
      // For solid backgrounds
      rect.setAttribute("fill", styles.backgroundColor || "#ffffff")
    }

    // Add border radius
    const borderRadius = styles.borderRadius
    if (borderRadius && borderRadius !== "0px") {
      rect.setAttribute("rx", borderRadius)
    }

    // Add border if present
    const borderWidth = Number.parseInt(styles.borderWidth)
    if (borderWidth > 0) {
      rect.setAttribute("stroke", styles.borderColor)
      rect.setAttribute("stroke-width", styles.borderWidth)
    }

    svg.appendChild(rect)

    // Get the icon SVG
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      try {
        // Create a new SVG element for the icon
        const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        // Copy attributes from the original icon
        const iconWidth = iconElement.getBoundingClientRect().width
        const iconHeight = iconElement.getBoundingClientRect().height
        const x = (width - iconWidth) / 2
        const y = (height - iconHeight) / 2

        iconSvg.setAttribute("x", x.toString())
        iconSvg.setAttribute("y", y.toString())
        iconSvg.setAttribute("width", iconWidth.toString())
        iconSvg.setAttribute("height", iconHeight.toString())
        iconSvg.setAttribute("viewBox", iconElement.getAttribute("viewBox") || "0 0 24 24")

        // Copy all paths and other elements from the original icon
        Array.from(iconElement.children).forEach((child) => {
          const newChild = child.cloneNode(true) as Element

          // Apply styles to paths
          if (child.tagName.toLowerCase() === "path") {
            const iconStyles = window.getComputedStyle(iconElement)

            // Apply fill if it has fill opacity
            if (iconStyles.fillOpacity && Number.parseFloat(iconStyles.fillOpacity) > 0) {
              newChild.setAttribute("fill", iconStyles.fill)
              newChild.setAttribute("fill-opacity", iconStyles.fillOpacity)
            } else {
              newChild.setAttribute("fill", "none")
            }

            // Apply stroke color
            newChild.setAttribute("stroke", iconStyles.color)
            newChild.setAttribute("stroke-width", child.getAttribute("stroke-width") || "2")
            newChild.setAttribute("stroke-linecap", "round")
            newChild.setAttribute("stroke-linejoin", "round")
          }

          iconSvg.appendChild(newChild)
        })

        // Apply rotation if needed
        if (styles.transform && styles.transform.includes("rotate")) {
          const rotateMatch = styles.transform.match(/rotate$$([^)]+)deg$$/)
          if (rotateMatch && rotateMatch[1]) {
            const rotation = Number.parseFloat(rotateMatch[1])

            // Calculate center of icon for rotation
            const centerX = x + iconWidth / 2
            const centerY = y + iconHeight / 2

            iconSvg.setAttribute("transform", `rotate(${rotation} ${centerX} ${centerY})`)
          }
        }

        svg.appendChild(iconSvg)
      } catch (error) {
        console.error("Error processing icon for SVG:", error)
      }
    }

    // Convert SVG to string
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svg)

    // Ensure proper XML declaration
    svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgString

    // Create download link
    const blob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileName || "logo"}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("SVG download successful")
    return true
  } catch (error) {
    console.error("Error downloading SVG:", error)
    alert("There was an error downloading the SVG. Please try again.")
    return false
  }
}

export const downloadPNG = async (elementId: string, fileName: string) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error("Element not found for PNG export:", elementId)
      alert("Could not find the logo element for export.")
      return false
    }

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const rect = element.getBoundingClientRect()

    // Set canvas size with higher resolution for better quality
    const scale = 4 // Higher resolution for better quality
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale

    // Get the context and draw the element
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      alert("Could not create PNG. Canvas context not available.")
      return false
    }

    // Scale everything for higher resolution
    ctx.scale(scale, scale)

    // Draw background
    const styles = window.getComputedStyle(element)

    // Handle background - could be gradient or solid color
    if (styles.background.includes("linear-gradient")) {
      // For gradient backgrounds, create a gradient
      let colors: string[] = []
      let angle = 135 // Default angle

      // Try different regex patterns to handle various gradient formats
      const gradientPatterns = [
        /linear-gradient$$\s*([^,]+),\s*([^)]+)\s*$$/,
        /linear-gradient$$\s*to\s+[^,]+,\s*([^,]+),\s*([^)]+)\s*$$/,
        /linear-gradient$$\s*([0-9]+deg),\s*([^,]+),\s*([^)]+)\s*$$/,
      ]

      let match = null
      for (const pattern of gradientPatterns) {
        match = styles.background.match(pattern)
        if (match) {
          // Check if the first group is an angle
          if (match[1] && match[1].includes("deg")) {
            angle = Number.parseInt(match[1])
          }

          // If the pattern has 3 groups, the colors are in groups 2 and 3
          if (match.length >= 4) {
            colors = [match[2], match[3]].map((c) => c.trim())
          }
          // If the pattern has 2 groups, the colors are in groups 1 and 2
          else if (match.length >= 3) {
            colors = [match[1], match[2]].map((c) => c.trim())
          }
          break
        }
      }

      // Create gradient based on angle
      let gradient

      // Convert angle to radians and calculate start/end points
      const angleRad = ((angle - 90) * Math.PI) / 180
      const gradientSize = Math.sqrt(rect.width * rect.width + rect.height * rect.height)
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const startX = centerX - (Math.cos(angleRad) * gradientSize) / 2
      const startY = centerY - (Math.sin(angleRad) * gradientSize) / 2
      const endX = centerX + (Math.cos(angleRad) * gradientSize) / 2
      const endY = centerY + (Math.sin(angleRad) * gradientSize) / 2

      gradient = ctx.createLinearGradient(startX, startY, endX, endY)

      // Add color stops
      if (colors.length >= 2) {
        gradient.addColorStop(0, colors[0])
        gradient.addColorStop(1, colors[1])
        ctx.fillStyle = gradient
      } else {
        // Fallback if gradient parsing fails
        ctx.fillStyle = styles.backgroundColor || "#ffffff"
      }
    } else {
      // For solid backgrounds
      ctx.fillStyle = styles.backgroundColor || "#ffffff"
    }

    // Get border radius
    const borderRadiusValue = styles.borderRadius
    const borderRadius = borderRadiusValue ? Number.parseInt(borderRadiusValue) : 0

    // Draw rounded rectangle
    ctx.beginPath()
    ctx.moveTo(borderRadius, 0)
    ctx.lineTo(rect.width - borderRadius, 0)
    ctx.quadraticCurveTo(rect.width, 0, rect.width, borderRadius)
    ctx.lineTo(rect.width, rect.height - borderRadius)
    ctx.quadraticCurveTo(rect.width, rect.height, rect.width - borderRadius, rect.height)
    ctx.lineTo(borderRadius, rect.height)
    ctx.quadraticCurveTo(0, rect.height, 0, rect.height - borderRadius)
    ctx.lineTo(0, borderRadius)
    ctx.quadraticCurveTo(0, 0, borderRadius, 0)
    ctx.closePath()
    ctx.fill()

    // Draw border if needed
    const borderWidth = Number.parseFloat(styles.borderWidth)
    if (borderWidth > 0) {
      ctx.strokeStyle = styles.borderColor
      ctx.lineWidth = borderWidth
      ctx.stroke()
    }

    // Draw the icon using HTML2Canvas approach
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      try {
        // Create a data URL from the SVG
        const svgData = new XMLSerializer().serializeToString(iconElement)

        // Fix SVG for proper rendering in canvas
        const fixedSvgData = svgData
          .replace(/fill="currentColor"/g, `fill="${styles.color}"`)
          .replace(/stroke="currentColor"/g, `stroke="${styles.color}"`)

        const svgBlob = new Blob([fixedSvgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)

        // Create image and wait for it to load
        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = (e) => {
            console.error("Image load error:", e)
            reject(e)
          }
          img.src = url
        })

        // Get icon styles
        const iconStyles = window.getComputedStyle(iconElement)

        // Calculate position to center the icon
        const iconWidth = iconElement.getBoundingClientRect().width
        const iconHeight = iconElement.getBoundingClientRect().height
        const x = (rect.width - iconWidth) / 2
        const y = (rect.height - iconHeight) / 2

        // Apply rotation if needed
        if (iconStyles.transform && iconStyles.transform.includes("rotate")) {
          const rotateMatch = iconStyles.transform.match(/rotate$$([^)]+)deg$$/)
          if (rotateMatch && rotateMatch[1]) {
            const rotation = Number.parseFloat(rotateMatch[1])

            // Save context state
            ctx.save()

            // Translate to center of icon, rotate, then draw
            ctx.translate(rect.width / 2, rect.height / 2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.drawImage(img, -iconWidth / 2, -iconHeight / 2, iconWidth, iconHeight)

            // Restore context state
            ctx.restore()
          } else {
            ctx.drawImage(img, x, y, iconWidth, iconHeight)
          }
        } else {
          ctx.drawImage(img, x, y, iconWidth, iconHeight)
        }

        // Revoke the object URL to free memory
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error drawing SVG to canvas:", error)
        alert("Failed to render icon on PNG. Using background only.")
      }
    }

    // Convert canvas to PNG and download
    try {
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${fileName || "logo"}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log("PNG download successful")
      return true
    } catch (error) {
      console.error("Error creating PNG:", error)
      alert("Failed to create PNG. This might be due to CORS restrictions with the SVG content.")
      return false
    }
  } catch (error) {
    console.error("Error in PNG download:", error)
    alert("There was an error downloading the PNG. Please try again.")
    return false
  }
}
