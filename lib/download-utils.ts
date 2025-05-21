import { jsPDF } from "jspdf"

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

    // Create background rectangle only if the background is not transparent
    if (styles.backgroundColor !== "transparent" && styles.backgroundColor !== "rgba(0, 0, 0, 0)") {
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
          /linear-gradient\s*([^,]+),\s*([^)]+)\s*/,
          /linear-gradient\s*to\s+[^,]+,\s*([^,]+),\s*([^)]+)\s*/,
          /linear-gradient\s*([0-9]+deg),\s*([^,]+),\s*([^)]+)\s*/,
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
    }

    // Create a group for the content
    const contentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    svg.appendChild(contentGroup)

    // Get the content layout
    const contentElement = element.querySelector("div.flex")
    if (!contentElement) {
      console.error("Content element not found")
      return false
    }

    // Get the icon SVG
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      try {
        // Create a new SVG element for the icon
        const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        // Copy attributes from the original icon
        const iconWidth = iconElement.getBoundingClientRect().width
        const iconHeight = iconElement.getBoundingClientRect().height

        // Calculate position based on the content layout
        const x = (width - iconWidth) / 2
        let y = (height - iconHeight) / 2

        // Adjust position if text is present
        const textElement = element.querySelector("p")
        if (textElement) {
          const textPosition = contentElement.classList.contains("flex-col")
            ? "below"
            : contentElement.classList.contains("flex-col-reverse")
              ? "above"
              : "center"

          if (textPosition === "below") {
            y = (height - iconHeight) / 2 - textElement.getBoundingClientRect().height / 2
          } else if (textPosition === "above") {
            y = (height - iconHeight) / 2 + textElement.getBoundingClientRect().height / 2
          }
        }

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
          const rotateMatch = styles.transform.match(/rotate\s*([^)]+)deg\s*/)
          if (rotateMatch && rotateMatch[1]) {
            const rotation = Number.parseFloat(rotateMatch[1])

            // Calculate center of icon for rotation
            const centerX = x + iconWidth / 2
            const centerY = y + iconHeight / 2

            iconSvg.setAttribute("transform", `rotate(${rotation} ${centerX} ${centerY})`)
          }
        }

        contentGroup.appendChild(iconSvg)
      } catch (error) {
        console.error("Error processing icon for SVG:", error)
      }
    }

    // Add text if present
    const textElement = element.querySelector("p")
    if (textElement) {
      try {
        const textStyles = window.getComputedStyle(textElement)
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")

        // Get text position
        const textPosition = contentElement.classList.contains("flex-col")
          ? "below"
          : contentElement.classList.contains("flex-col-reverse")
            ? "above"
            : "center"

        // Calculate text position
        const textX = width / 2
        let textY

        if (textPosition === "below") {
          textY = height / 2 + iconElement!.getBoundingClientRect().height / 2 + 20
        } else if (textPosition === "above") {
          textY = height / 2 - iconElement!.getBoundingClientRect().height / 2 - 20
        } else {
          // center
          textY = height / 2 + Number.parseInt(textStyles.fontSize) / 3
        }

        // Set text attributes
        text.setAttribute("x", textX.toString())
        text.setAttribute("y", textY.toString())
        text.setAttribute("text-anchor", "middle")
        text.setAttribute("dominant-baseline", "middle")
        text.setAttribute("font-family", textStyles.fontFamily.replace(/"/g, "'"))
        text.setAttribute("font-size", textStyles.fontSize)
        text.setAttribute("fill", textStyles.color)
        text.setAttribute("font-weight", textStyles.fontWeight)
        text.setAttribute("font-style", textStyles.fontStyle)
        text.setAttribute("letter-spacing", textStyles.letterSpacing)

        // Add text shadow if needed
        if (textStyles.textShadow && textStyles.textShadow !== "none") {
          const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
          filter.setAttribute("id", "textShadow")
          filter.innerHTML = `
            <feDropShadow dx="0" dy="0" stdDeviation="1" flood-opacity="0.5" flood-color="black" />
          `
          svg.appendChild(filter)
          text.setAttribute("filter", "url(#textShadow)")
        }

        text.textContent = textElement.textContent
        contentGroup.appendChild(text)
      } catch (error) {
        console.error("Error processing text for SVG:", error)
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

export const downloadPNG = async (elementId: string, fileName: string, width = 0, height = 0) => {
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

    // Use custom dimensions if provided, otherwise use the element's dimensions
    const targetWidth = width > 0 ? width : rect.width
    const targetHeight = height > 0 ? height : rect.height

    canvas.width = targetWidth * scale
    canvas.height = targetHeight * scale

    // Get the context and draw the element
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) {
      console.error("Could not get canvas context")
      alert("Could not create PNG. Canvas context not available.")
      return false
    }

    // Scale everything for higher resolution
    ctx.scale(scale * (targetWidth / rect.width), scale * (targetHeight / rect.height))

    // Clear the canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Only draw background if it's not transparent
    const styles = window.getComputedStyle(element)
    if (styles.backgroundColor !== "transparent" && styles.backgroundColor !== "rgba(0, 0, 0, 0)") {
      // Draw background
      const width = Number.parseInt(styles.width)
      const height = Number.parseInt(styles.height)

      // Handle background - could be gradient or solid color
      if (styles.background.includes("linear-gradient")) {
        // For gradient backgrounds, create a gradient
        let colors: string[] = []
        let angle = 135 // Default angle

        // Try different regex patterns to handle various gradient formats
        const gradientPatterns = [
          /linear-gradient\s*([^,]+),\s*([^)]+)\s*/,
          /linear-gradient\s*to\s+[^,]+,\s*([^,]+),\s*([^)]+)\s*/,
          /linear-gradient\s*([0-9]+deg),\s*([^,]+),\s*([^)]+)\s*/,
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
    }

    // Get content layout
    const contentElement = element.querySelector("div.flex")
    if (!contentElement) {
      console.error("Content element not found")
      return false
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

        // Calculate position based on the content layout
        const x = (rect.width - iconWidth) / 2
        let y = (rect.height - iconHeight) / 2

        // Adjust position if text is present
        const textElement = element.querySelector("p")
        if (textElement) {
          const textPosition = contentElement.classList.contains("flex-col")
            ? "below"
            : contentElement.classList.contains("flex-col-reverse")
              ? "above"
              : "center"

          if (textPosition === "below") {
            y = (rect.height - iconHeight) / 2 - textElement.getBoundingClientRect().height / 2
          } else if (textPosition === "above") {
            y = (rect.height - iconHeight) / 2 + textElement.getBoundingClientRect().height / 2
          }
        }

        // Apply rotation if needed
        if (iconStyles.transform && iconStyles.transform.includes("rotate")) {
          const rotateMatch = iconStyles.transform.match(/rotate\s*([^)]+)deg\s*/)
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

    // Draw text if present
    const textElement = element.querySelector("p")
    if (textElement) {
      try {
        const textStyles = window.getComputedStyle(textElement)

        // Get text position
        const textPosition = contentElement.classList.contains("flex-col")
          ? "below"
          : contentElement.classList.contains("flex-col-reverse")
            ? "above"
            : "center"

        // Calculate text position
        const textX = rect.width / 2
        let textY

        if (textPosition === "below") {
          textY = rect.height / 2 + iconElement!.getBoundingClientRect().height / 2 + 20
        } else if (textPosition === "above") {
          textY = rect.height / 2 - iconElement!.getBoundingClientRect().height / 2 - 20
        } else {
          // center
          textY = rect.height / 2 + Number.parseInt(textStyles.fontSize) / 3
        }

        // Set text styles
        ctx.font = `${textStyles.fontStyle} ${textStyles.fontWeight} ${textStyles.fontSize} ${textStyles.fontFamily}`
        ctx.fillStyle = textStyles.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Add text shadow if needed
        if (textStyles.textShadow && textStyles.textShadow !== "none") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }

        // Draw text
        ctx.fillText(textElement.textContent || "", textX, textY)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      } catch (error) {
        console.error("Error drawing text to canvas:", error)
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

export const downloadJPEG = async (
  elementId: string,
  fileName: string,
  width = 0,
  height = 0,
  quality = 90,
  backgroundColor = "#ffffff",
) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error("Element not found for JPEG export:", elementId)
      alert("Could not find the logo element for export.")
      return false
    }

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const rect = element.getBoundingClientRect()

    // Set canvas size with higher resolution for better quality
    const scale = 4 // Higher resolution for better quality

    // Use custom dimensions if provided, otherwise use the element's dimensions
    const targetWidth = width > 0 ? width : rect.width
    const targetHeight = height > 0 ? height : rect.height

    canvas.width = targetWidth * scale
    canvas.height = targetHeight * scale

    // Get the context and draw the element
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      alert("Could not create JPEG. Canvas context not available.")
      return false
    }

    // Scale everything for higher resolution
    ctx.scale(scale * (targetWidth / rect.width), scale * (targetHeight / rect.height))

    // Fill with background color (JPEG doesn't support transparency)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw background
    const styles = window.getComputedStyle(element)

    // Handle background - could be gradient or solid color
    if (styles.background.includes("linear-gradient")) {
      // For gradient backgrounds, create a gradient
      let colors: string[] = []
      let angle = 135 // Default angle

      // Try different regex patterns to handle various gradient formats
      const gradientPatterns = [
        /linear-gradient\s*([^,]+),\s*([^)]+)\s*/,
        /linear-gradient\s*to\s+[^,]+,\s*([^,]+),\s*([^)]+)\s*/,
        /linear-gradient\s*([0-9]+deg),\s*([^,]+),\s*([^)]+)\s*/,
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
        ctx.fillStyle = styles.backgroundColor || backgroundColor
      }
    } else {
      // For solid backgrounds
      ctx.fillStyle = styles.backgroundColor || backgroundColor
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

    // Get content layout
    const contentElement = element.querySelector("div.flex")
    if (!contentElement) {
      console.error("Content element not found")
      return false
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

        // Calculate position based on the content layout
        const x = (rect.width - iconWidth) / 2
        let y = (rect.height - iconHeight) / 2

        // Adjust position if text is present
        const textElement = element.querySelector("p")
        if (textElement) {
          const textPosition = contentElement.classList.contains("flex-col")
            ? "below"
            : contentElement.classList.contains("flex-col-reverse")
              ? "above"
              : "center"

          if (textPosition === "below") {
            y = (rect.height - iconHeight) / 2 - textElement.getBoundingClientRect().height / 2
          } else if (textPosition === "above") {
            y = (rect.height - iconHeight) / 2 + textElement.getBoundingClientRect().height / 2
          }
        }

        // Apply rotation if needed
        if (iconStyles.transform && iconStyles.transform.includes("rotate")) {
          const rotateMatch = iconStyles.transform.match(/rotate\s*([^)]+)deg\s*/)
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
        alert("Failed to render icon on JPEG. Using background only.")
      }
    }

    // Draw text if present
    const textElement = element.querySelector("p")
    if (textElement) {
      try {
        const textStyles = window.getComputedStyle(textElement)

        // Get text position
        const textPosition = contentElement.classList.contains("flex-col")
          ? "below"
          : contentElement.classList.contains("flex-col-reverse")
            ? "above"
            : "center"

        // Calculate text position
        const textX = rect.width / 2
        let textY

        if (textPosition === "below") {
          textY = rect.height / 2 + iconElement!.getBoundingClientRect().height / 2 + 20
        } else if (textPosition === "above") {
          textY = rect.height / 2 - iconElement!.getBoundingClientRect().height / 2 - 20
        } else {
          // center
          textY = rect.height / 2 + Number.parseInt(textStyles.fontSize) / 3
        }

        // Set text styles
        ctx.font = `${textStyles.fontStyle} ${textStyles.fontWeight} ${textStyles.fontSize} ${textStyles.fontFamily}`
        ctx.fillStyle = textStyles.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Add text shadow if needed
        if (textStyles.textShadow && textStyles.textShadow !== "none") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }

        // Draw text
        ctx.fillText(textElement.textContent || "", textX, textY)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      } catch (error) {
        console.error("Error drawing text to canvas:", error)
      }
    }

    // Convert canvas to JPEG and download
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100)
      const link = document.createElement("a")
      link.download = `${fileName || "logo"}.jpg`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log("JPEG download successful")
      return true
    } catch (error) {
      console.error("Error creating JPEG:", error)
      alert("Failed to create JPEG. This might be due to CORS restrictions with the SVG content.")
      return false
    }
  } catch (error) {
    console.error("Error in JPEG download:", error)
    alert("There was an error downloading the JPEG. Please try again.")
    return false
  }
}

export const downloadPDF = async (
  elementId: string,
  fileName: string,
  width = 0,
  height = 0,
  pageSize = "a4",
  orientation = "portrait",
) => {
  try {
    // First create a PNG of the logo
    const canvas = document.createElement("canvas")
    const element = document.getElementById(elementId)

    if (!element) {
      console.error("Element not found for PDF export")
      alert("Could not find the logo element for export.")
      return false
    }

    const rect = element.getBoundingClientRect()

    // Use custom dimensions if provided, otherwise use the element's dimensions
    const targetWidth = width > 0 ? width : rect.width
    const targetHeight = height > 0 ? height : rect.height

    // Set canvas size
    canvas.width = targetWidth
    canvas.height = targetHeight

    // Get the context
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      alert("Could not create PDF. Canvas context not available.")
      return false
    }

    // Scale to fit the target dimensions
    ctx.scale(targetWidth / rect.width, targetHeight / rect.height)

    // Draw the logo to canvas (reusing code from PNG export)
    // Draw background
    const styles = window.getComputedStyle(element)

    // Handle background - could be gradient or solid color
    if (styles.background.includes("linear-gradient")) {
      // For gradient backgrounds, create a gradient
      let colors: string[] = []
      let angle = 135 // Default angle

      // Try different regex patterns to handle various gradient formats
      const gradientPatterns = [
        /linear-gradient\s*([^,]+),\s*([^)]+)\s*/,
        /linear-gradient\s*to\s+[^,]+,\s*([^,]+),\s*([^)]+)\s*/,
        /linear-gradient\s*([0-9]+deg),\s*([^,]+),\s*([^)]+)\s*/,
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

    // Get content layout
    const contentElement = element.querySelector("div.flex")
    if (!contentElement) {
      console.error("Content element not found")
      return false
    }

    // Draw the icon
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

        // Calculate position based on the content layout
        const x = (rect.width - iconWidth) / 2
        let y = (rect.height - iconHeight) / 2

        // Adjust position if text is present
        const textElement = element.querySelector("p")
        if (textElement) {
          const textPosition = contentElement.classList.contains("flex-col")
            ? "below"
            : contentElement.classList.contains("flex-col-reverse")
              ? "above"
              : "center"

          if (textPosition === "below") {
            y = (rect.height - iconHeight) / 2 - textElement.getBoundingClientRect().height / 2
          } else if (textPosition === "above") {
            y = (rect.height - iconHeight) / 2 + textElement.getBoundingClientRect().height / 2
          }
        }

        // Apply rotation if needed
        if (iconStyles.transform && iconStyles.transform.includes("rotate")) {
          const rotateMatch = iconStyles.transform.match(/rotate\s*([^)]+)deg\s*/)
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
      }
    }

    // Draw text if present
    const textElement = element.querySelector("p")
    if (textElement) {
      try {
        const textStyles = window.getComputedStyle(textElement)

        // Get text position
        const textPosition = contentElement.classList.contains("flex-col")
          ? "below"
          : contentElement.classList.contains("flex-col-reverse")
            ? "above"
            : "center"

        // Calculate text position
        const textX = rect.width / 2
        let textY

        if (textPosition === "below") {
          textY = rect.height / 2 + iconElement!.getBoundingClientRect().height / 2 + 20
        } else if (textPosition === "above") {
          textY = rect.height / 2 - iconElement!.getBoundingClientRect().height / 2 - 20
        } else {
          // center
          textY = rect.height / 2 + Number.parseInt(textStyles.fontSize) / 3
        }

        // Set text styles
        ctx.font = `${textStyles.fontStyle} ${textStyles.fontWeight} ${textStyles.fontSize} ${textStyles.fontFamily}`
        ctx.fillStyle = textStyles.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Add text shadow if needed
        if (textStyles.textShadow && textStyles.textShadow !== "none") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }

        // Draw text
        ctx.fillText(textElement.textContent || "", textX, textY)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      } catch (error) {
        console.error("Error drawing text to canvas:", error)
      }
    }

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: pageSize,
    })

    // Get the dimensions of the PDF page in points
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate the maximum size that will fit on the page with margins
    const margin = 10 // 10mm margin
    const maxWidth = pdfWidth - 2 * margin
    const maxHeight = pdfHeight - 2 * margin

    // Calculate the scale to fit the logo on the page
    const scale = Math.min(maxWidth / targetWidth, maxHeight / targetHeight)

    // Calculate the centered position
    const x = (pdfWidth - targetWidth * scale) / 2
    const y = (pdfHeight - targetHeight * scale) / 2

    // Convert canvas to data URL
    const imgData = canvas.toDataURL("image/png")

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", x, y, targetWidth * scale, targetHeight * scale)

    // Save the PDF
    pdf.save(`${fileName || "logo"}.pdf`)

    console.log("PDF download successful")
    return true
  } catch (error) {
    console.error("Error in PDF download:", error)
    alert("There was an error downloading the PDF. Please try again.")
    return false
  }
}
