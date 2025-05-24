import { jsPDF } from "jspdf"

// Enhanced error handling and validation
const validateElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`)
  }

  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    throw new Error("Element has zero dimensions")
  }

  return { element, rect }
}

// Helper function to convert CSS color to hex
const cssColorToHex = (cssColor: string): string => {
  if (!cssColor || cssColor === "transparent") return "#ffffff"
  if (cssColor.startsWith("#")) return cssColor

  // Create a temporary element to get computed color
  const div = document.createElement("div")
  div.style.color = cssColor
  document.body.appendChild(div)

  try {
    const computedColor = window.getComputedStyle(div).color
    document.body.removeChild(div)

    // Parse rgb/rgba values
    const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      const r = Number.parseInt(match[1]).toString(16).padStart(2, "0")
      const g = Number.parseInt(match[2]).toString(16).padStart(2, "0")
      const b = Number.parseInt(match[3]).toString(16).padStart(2, "0")
      return `#${r}${g}${b}`
    }
  } catch (error) {
    document.body.removeChild(div)
  }

  return cssColor
}

// Helper function to parse gradient colors with better error handling
const parseGradientColors = (backgroundStyle: string): { colors: string[]; angle: number } => {
  const defaultResult = { colors: ["#3b82f6", "#60a5fa"], angle: 135 }

  if (!backgroundStyle || !backgroundStyle.includes("linear-gradient")) {
    return defaultResult
  }

  try {
    // Extract angle
    let angle = 135
    const angleMatch = backgroundStyle.match(/linear-gradient\s*\(\s*(\d+)deg/)
    if (angleMatch) {
      angle = Number.parseInt(angleMatch[1])
    }

    // Extract colors - improved regex for better color matching
    const colorMatches = backgroundStyle.match(
      /(#[0-9a-fA-F]{3,6}|rgb$$[^)]+$$|rgba$$[^)]+$$|hsl$$[^)]+$$|hsla$$[^)]+$$)/g,
    )

    if (colorMatches && colorMatches.length >= 2) {
      const colors = colorMatches
        .slice(0, 2)
        .map((color) => cssColorToHex(color))
        .filter((color) => color !== "#ffffff" || colorMatches.length === 1)

      if (colors.length >= 2) {
        return { colors, angle }
      }
    }
  } catch (error) {
    console.warn("Error parsing gradient:", error)
  }

  return defaultResult
}

export const downloadSVG = (elementId: string, fileName: string): boolean => {
  try {
    const { element, rect } = validateElement(elementId)

    // Get computed styles and dimensions
    const styles = window.getComputedStyle(element)
    const width = Math.round(rect.width)
    const height = Math.round(rect.height)

    if (width <= 0 || height <= 0) {
      throw new Error("Invalid element dimensions")
    }

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", width.toString())
    svg.setAttribute("height", height.toString())
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.setAttribute("version", "1.1")

    // Create defs for gradients and filters
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    svg.appendChild(defs)

    // Create background
    const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    backgroundRect.setAttribute("width", "100%")
    backgroundRect.setAttribute("height", "100%")

    // Handle background (gradient or solid)
    if (styles.background && styles.background.includes("linear-gradient")) {
      const { colors, angle } = parseGradientColors(styles.background)

      // Create linear gradient
      const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      const gradientId = "logoGradient"
      gradient.setAttribute("id", gradientId)

      // Convert angle to SVG coordinates
      const angleRad = ((angle - 90) * Math.PI) / 180
      const x1 = 50 + 50 * Math.cos(angleRad + Math.PI)
      const y1 = 50 + 50 * Math.sin(angleRad + Math.PI)
      const x2 = 50 + 50 * Math.cos(angleRad)
      const y2 = 50 + 50 * Math.sin(angleRad)

      gradient.setAttribute("x1", `${Math.max(0, Math.min(100, x1))}%`)
      gradient.setAttribute("y1", `${Math.max(0, Math.min(100, y1))}%`)
      gradient.setAttribute("x2", `${Math.max(0, Math.min(100, x2))}%`)
      gradient.setAttribute("y2", `${Math.max(0, Math.min(100, y2))}%`)

      // Add color stops
      colors.forEach((color, index) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop")
        stop.setAttribute("offset", `${index * 100}%`)
        stop.setAttribute("stop-color", color)
        gradient.appendChild(stop)
      })

      defs.appendChild(gradient)
      backgroundRect.setAttribute("fill", `url(#${gradientId})`)
    } else {
      const bgColor = cssColorToHex(styles.backgroundColor)
      backgroundRect.setAttribute("fill", bgColor)
    }

    // Add border radius
    const borderRadius = styles.borderRadius
    if (borderRadius && borderRadius !== "0px") {
      const radiusValue = Number.parseInt(borderRadius)
      if (!isNaN(radiusValue) && radiusValue > 0) {
        backgroundRect.setAttribute("rx", Math.min(radiusValue, width / 2).toString())
        backgroundRect.setAttribute("ry", Math.min(radiusValue, height / 2).toString())
      }
    }

    // Add border
    const borderWidth = Number.parseFloat(styles.borderWidth) || 0
    if (borderWidth > 0) {
      backgroundRect.setAttribute("stroke", cssColorToHex(styles.borderColor))
      backgroundRect.setAttribute("stroke-width", borderWidth.toString())
    }

    svg.appendChild(backgroundRect)

    // Find and process the icon
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      const iconRect = iconElement.getBoundingClientRect()
      const iconStyles = window.getComputedStyle(iconElement)

      // Calculate icon position relative to the container
      const containerRect = element.getBoundingClientRect()
      const iconX = iconRect.left - containerRect.left
      const iconY = iconRect.top - containerRect.top

      // Create group for the icon
      const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")

      // Apply rotation if present
      if (iconStyles.transform && iconStyles.transform.includes("rotate")) {
        const rotateMatch = iconStyles.transform.match(/rotate$$([^)]+)deg$$/)
        if (rotateMatch) {
          const rotation = Number.parseFloat(rotateMatch[1])
          if (!isNaN(rotation)) {
            const centerX = iconX + iconRect.width / 2
            const centerY = iconY + iconRect.height / 2
            iconGroup.setAttribute("transform", `rotate(${rotation} ${centerX} ${centerY})`)
          }
        }
      }

      // Copy all paths from the original icon
      const paths = iconElement.querySelectorAll("path")
      paths.forEach((path) => {
        const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path")

        // Copy path data
        const pathData = path.getAttribute("d")
        if (pathData) {
          newPath.setAttribute("d", pathData)

          // Set colors based on computed styles
          const strokeColor = cssColorToHex(iconStyles.color)
          newPath.setAttribute("stroke", strokeColor)
          newPath.setAttribute("stroke-width", path.getAttribute("stroke-width") || "2")
          newPath.setAttribute("stroke-linecap", "round")
          newPath.setAttribute("stroke-linejoin", "round")

          // Handle fill
          const fillOpacity = Number.parseFloat(iconStyles.fillOpacity || "0")
          if (fillOpacity > 0) {
            newPath.setAttribute("fill", cssColorToHex(iconStyles.fill || strokeColor))
            newPath.setAttribute("fill-opacity", fillOpacity.toString())
          } else {
            newPath.setAttribute("fill", "none")
          }

          iconGroup.appendChild(newPath)
        }
      })

      // Set the viewBox and position for the icon group
      const viewBox = iconElement.getAttribute("viewBox") || "0 0 24 24"
      iconGroup.setAttribute("viewBox", viewBox)

      // Scale and position the icon
      const scaleX = iconRect.width / 24 // Assuming 24x24 viewBox
      const scaleY = iconRect.height / 24
      const transform = iconGroup.getAttribute("transform") || ""
      iconGroup.setAttribute(
        "transform",
        `${transform} translate(${iconX}, ${iconY}) scale(${scaleX}, ${scaleY})`.trim(),
      )

      svg.appendChild(iconGroup)
    }

    // Add text if present
    const textElement = element.querySelector("p")
    if (textElement && textElement.textContent) {
      const textRect = textElement.getBoundingClientRect()
      const textStyles = window.getComputedStyle(textElement)
      const containerRect = element.getBoundingClientRect()

      const textX = textRect.left - containerRect.left + textRect.width / 2
      const textY = textRect.top - containerRect.top + textRect.height / 2

      const textSvg = document.createElementNS("http://www.w3.org/2000/svg", "text")
      textSvg.setAttribute("x", textX.toString())
      textSvg.setAttribute("y", textY.toString())
      textSvg.setAttribute("text-anchor", "middle")
      textSvg.setAttribute("dominant-baseline", "central")
      textSvg.setAttribute("font-family", textStyles.fontFamily.replace(/"/g, "'"))
      textSvg.setAttribute("font-size", textStyles.fontSize)
      textSvg.setAttribute("font-weight", textStyles.fontWeight)
      textSvg.setAttribute("font-style", textStyles.fontStyle)
      textSvg.setAttribute("letter-spacing", textStyles.letterSpacing)
      textSvg.setAttribute("fill", cssColorToHex(textStyles.color))

      // Add text shadow if present
      if (textStyles.textShadow && textStyles.textShadow !== "none") {
        const filterId = "textShadow"
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
        filter.setAttribute("id", filterId)
        filter.innerHTML = `
          <feDropShadow dx="0" dy="0" stdDeviation="2" flood-opacity="0.5" flood-color="black"/>
        `
        defs.appendChild(filter)
        textSvg.setAttribute("filter", `url(#${filterId})`)
      }

      textSvg.textContent = textElement.textContent
      svg.appendChild(textSvg)
    }

    // Convert to string and download
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svg)
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileName || "logo"}.svg`
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("SVG export successful")
    return true
  } catch (error) {
    console.error("Error downloading SVG:", error)
    throw error
  }
}

export const downloadPNG = async (elementId: string, fileName: string, width = 0, height = 0): Promise<boolean> => {
  try {
    const { element, rect } = validateElement(elementId)

    const canvas = document.createElement("canvas")
    const scale = 2 // Higher DPI for better quality

    const targetWidth = width > 0 ? width : rect.width
    const targetHeight = height > 0 ? height : rect.height

    if (targetWidth <= 0 || targetHeight <= 0) {
      throw new Error("Invalid target dimensions")
    }

    canvas.width = targetWidth * scale
    canvas.height = targetHeight * scale

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    ctx.scale(scale, scale)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Clear canvas with transparency
    ctx.clearRect(0, 0, targetWidth, targetHeight)

    // Draw using the same logic as SVG but on canvas
    const styles = window.getComputedStyle(element)

    // Draw background
    if (styles.background && styles.background.includes("linear-gradient")) {
      const { colors, angle } = parseGradientColors(styles.background)

      const angleRad = ((angle - 90) * Math.PI) / 180
      const centerX = targetWidth / 2
      const centerY = targetHeight / 2
      const radius = Math.sqrt(targetWidth * targetWidth + targetHeight * targetHeight) / 2

      const x1 = centerX + radius * Math.cos(angleRad + Math.PI)
      const y1 = centerY + radius * Math.sin(angleRad + Math.PI)
      const x2 = centerX + radius * Math.cos(angleRad)
      const y2 = centerY + radius * Math.sin(angleRad)

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(1, colors[1])
      ctx.fillStyle = gradient
    } else {
      const bgColor = styles.backgroundColor
      if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
        ctx.fillStyle = bgColor
      } else {
        // Skip background for transparent
        ctx.fillStyle = "transparent"
      }
    }

    // Draw rounded rectangle if we have a background
    if (ctx.fillStyle !== "transparent") {
      const borderRadius = Number.parseInt(styles.borderRadius) || 0
      ctx.beginPath()
      if (borderRadius > 0) {
        // Use roundRect if available, fallback to manual drawing
        if (ctx.roundRect) {
          ctx.roundRect(0, 0, targetWidth, targetHeight, borderRadius)
        } else {
          // Manual rounded rectangle
          ctx.moveTo(borderRadius, 0)
          ctx.lineTo(targetWidth - borderRadius, 0)
          ctx.quadraticCurveTo(targetWidth, 0, targetWidth, borderRadius)
          ctx.lineTo(targetWidth, targetHeight - borderRadius)
          ctx.quadraticCurveTo(targetWidth, targetHeight, targetWidth - borderRadius, targetHeight)
          ctx.lineTo(borderRadius, targetHeight)
          ctx.quadraticCurveTo(0, targetHeight, 0, targetHeight - borderRadius)
          ctx.lineTo(0, borderRadius)
          ctx.quadraticCurveTo(0, 0, borderRadius, 0)
        }
      } else {
        ctx.rect(0, 0, targetWidth, targetHeight)
      }
      ctx.fill()

      // Draw border
      const borderWidth = Number.parseFloat(styles.borderWidth) || 0
      if (borderWidth > 0) {
        ctx.strokeStyle = styles.borderColor
        ctx.lineWidth = borderWidth
        ctx.stroke()
      }
    }

    // Convert icon to image and draw
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      try {
        const iconData = new XMLSerializer().serializeToString(iconElement)
        const iconBlob = new Blob([iconData], { type: "image/svg+xml;charset=utf-8" })
        const iconUrl = URL.createObjectURL(iconBlob)

        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Failed to load icon image"))
          img.src = iconUrl
        })

        const iconRect = iconElement.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()
        const iconX = (iconRect.left - containerRect.left) * (targetWidth / rect.width)
        const iconY = (iconRect.top - containerRect.top) * (targetHeight / rect.height)
        const iconW = iconRect.width * (targetWidth / rect.width)
        const iconH = iconRect.height * (targetHeight / rect.height)

        ctx.drawImage(img, iconX, iconY, iconW, iconH)
        URL.revokeObjectURL(iconUrl)
      } catch (error) {
        console.warn("Failed to render icon:", error)
      }
    }

    // Draw text
    const textElement = element.querySelector("p")
    if (textElement && textElement.textContent) {
      try {
        const textStyles = window.getComputedStyle(textElement)
        const textRect = textElement.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()

        const textX = (textRect.left - containerRect.left + textRect.width / 2) * (targetWidth / rect.width)
        const textY = (textRect.top - containerRect.top + textRect.height / 2) * (targetHeight / rect.height)

        const fontSize = Number.parseInt(textStyles.fontSize) * (targetWidth / rect.width)
        ctx.font = `${textStyles.fontStyle} ${textStyles.fontWeight} ${fontSize}px ${textStyles.fontFamily}`
        ctx.fillStyle = textStyles.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (textStyles.textShadow && textStyles.textShadow !== "none") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 4
        }

        ctx.fillText(textElement.textContent, textX, textY)
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      } catch (error) {
        console.warn("Failed to render text:", error)
      }
    }

    // Download
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `${fileName || "logo"}.png`
    link.href = dataUrl
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log("PNG export successful")
    return true
  } catch (error) {
    console.error("Error downloading PNG:", error)
    throw error
  }
}

export const downloadJPEG = async (
  elementId: string,
  fileName: string,
  width = 0,
  height = 0,
  quality = 90,
  backgroundColor = "#ffffff",
): Promise<boolean> => {
  try {
    const { element, rect } = validateElement(elementId)

    const canvas = document.createElement("canvas")
    const scale = 2

    const targetWidth = width > 0 ? width : rect.width
    const targetHeight = height > 0 ? height : rect.height

    if (targetWidth <= 0 || targetHeight <= 0) {
      throw new Error("Invalid target dimensions")
    }

    canvas.width = targetWidth * scale
    canvas.height = targetHeight * scale

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    ctx.scale(scale, scale)

    // Fill with background color first (JPEG doesn't support transparency)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    // Then draw the logo on top (same as PNG logic)
    const styles = window.getComputedStyle(element)

    if (styles.background && styles.background.includes("linear-gradient")) {
      const { colors, angle } = parseGradientColors(styles.background)

      const angleRad = ((angle - 90) * Math.PI) / 180
      const centerX = targetWidth / 2
      const centerY = targetHeight / 2
      const radius = Math.sqrt(targetWidth * targetWidth + targetHeight * targetHeight) / 2

      const x1 = centerX + radius * Math.cos(angleRad + Math.PI)
      const y1 = centerY + radius * Math.sin(angleRad + Math.PI)
      const x2 = centerX + radius * Math.cos(angleRad)
      const y2 = centerY + radius * Math.sin(angleRad)

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(1, colors[1])
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = styles.backgroundColor || backgroundColor
    }

    const borderRadius = Number.parseInt(styles.borderRadius) || 0
    ctx.beginPath()
    if (borderRadius > 0) {
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, targetWidth, targetHeight, borderRadius)
      } else {
        // Manual rounded rectangle
        ctx.moveTo(borderRadius, 0)
        ctx.lineTo(targetWidth - borderRadius, 0)
        ctx.quadraticCurveTo(targetWidth, 0, targetWidth, borderRadius)
        ctx.lineTo(targetWidth, targetHeight - borderRadius)
        ctx.quadraticCurveTo(targetWidth, targetHeight, targetWidth - borderRadius, targetHeight)
        ctx.lineTo(borderRadius, targetHeight)
        ctx.quadraticCurveTo(0, targetHeight, 0, targetHeight - borderRadius)
        ctx.lineTo(0, borderRadius)
        ctx.quadraticCurveTo(0, 0, borderRadius, 0)
      }
    } else {
      ctx.rect(0, 0, targetWidth, targetHeight)
    }
    ctx.fill()

    // Add icon and text (same as PNG)
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      try {
        const iconData = new XMLSerializer().serializeToString(iconElement)
        const iconBlob = new Blob([iconData], { type: "image/svg+xml;charset=utf-8" })
        const iconUrl = URL.createObjectURL(iconBlob)

        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Failed to load icon"))
          img.src = iconUrl
        })

        const iconRect = iconElement.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()
        const iconX = (iconRect.left - containerRect.left) * (targetWidth / rect.width)
        const iconY = (iconRect.top - containerRect.top) * (targetHeight / rect.height)
        const iconW = iconRect.width * (targetWidth / rect.width)
        const iconH = iconRect.height * (targetHeight / rect.height)

        ctx.drawImage(img, iconX, iconY, iconW, iconH)
        URL.revokeObjectURL(iconUrl)
      } catch (error) {
        console.warn("Failed to render icon:", error)
      }
    }

    const textElement = element.querySelector("p")
    if (textElement && textElement.textContent) {
      try {
        const textStyles = window.getComputedStyle(textElement)
        const textRect = textElement.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()

        const textX = (textRect.left - containerRect.left + textRect.width / 2) * (targetWidth / rect.width)
        const textY = (textRect.top - containerRect.top + textRect.height / 2) * (targetHeight / rect.height)

        const fontSize = Number.parseInt(textStyles.fontSize) * (targetWidth / rect.width)
        ctx.font = `${textStyles.fontStyle} ${textStyles.fontWeight} ${fontSize}px ${textStyles.fontFamily}`
        ctx.fillStyle = textStyles.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.fillText(textElement.textContent, textX, textY)
      } catch (error) {
        console.warn("Failed to render text:", error)
      }
    }

    const dataUrl = canvas.toDataURL("image/jpeg", quality / 100)
    const link = document.createElement("a")
    link.download = `${fileName || "logo"}.jpg`
    link.href = dataUrl
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log("JPEG export successful")
    return true
  } catch (error) {
    console.error("Error downloading JPEG:", error)
    throw error
  }
}

export const downloadPDF = async (
  elementId: string,
  fileName: string,
  width = 0,
  height = 0,
  pageSize = "a4",
  orientation = "portrait",
): Promise<boolean> => {
  try {
    const { element, rect } = validateElement(elementId)

    const canvas = document.createElement("canvas")

    const targetWidth = width > 0 ? width : rect.width
    const targetHeight = height > 0 ? height : rect.height

    if (targetWidth <= 0 || targetHeight <= 0) {
      throw new Error("Invalid target dimensions")
    }

    canvas.width = targetWidth * 2
    canvas.height = targetHeight * 2

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    ctx.scale(2, 2)

    // Draw logo (same logic as PNG)
    const styles = window.getComputedStyle(element)

    if (styles.background && styles.background.includes("linear-gradient")) {
      const { colors, angle } = parseGradientColors(styles.background)

      const angleRad = ((angle - 90) * Math.PI) / 180
      const centerX = targetWidth / 2
      const centerY = targetHeight / 2
      const radius = Math.sqrt(targetWidth * targetWidth + targetHeight * targetHeight) / 2

      const x1 = centerX + radius * Math.cos(angleRad + Math.PI)
      const y1 = centerY + radius * Math.sin(angleRad + Math.PI)
      const x2 = centerX + radius * Math.cos(angleRad)
      const y2 = centerY + radius * Math.sin(angleRad)

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(1, colors[1])
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = styles.backgroundColor || "#ffffff"
    }

    const borderRadius = Number.parseInt(styles.borderRadius) || 0
    ctx.beginPath()
    if (borderRadius > 0) {
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, targetWidth, targetHeight, borderRadius)
      } else {
        // Manual rounded rectangle
        ctx.moveTo(borderRadius, 0)
        ctx.lineTo(targetWidth - borderRadius, 0)
        ctx.quadraticCurveTo(targetWidth, 0, targetWidth, borderRadius)
        ctx.lineTo(targetWidth, targetHeight - borderRadius)
        ctx.quadraticCurveTo(targetWidth, targetHeight, targetWidth - borderRadius, targetHeight)
        ctx.lineTo(borderRadius, targetHeight)
        ctx.quadraticCurveTo(0, targetHeight, 0, targetHeight - borderRadius)
        ctx.lineTo(0, borderRadius)
        ctx.quadraticCurveTo(0, 0, borderRadius, 0)
      }
    } else {
      ctx.rect(0, 0, targetWidth, targetHeight)
    }
    ctx.fill()

    // Add icon and text
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      try {
        const iconData = new XMLSerializer().serializeToString(iconElement)
        const iconBlob = new Blob([iconData], { type: "image/svg+xml;charset=utf-8" })
        const iconUrl = URL.createObjectURL(iconBlob)

        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Failed to load icon"))
          img.src = iconUrl
        })

        const iconRect = iconElement.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()
        const iconX = (iconRect.left - containerRect.left) * (targetWidth / rect.width)
        const iconY = (iconRect.top - containerRect.top) * (targetHeight / rect.height)
        const iconW = iconRect.width * (targetWidth / rect.width)
        const iconH = iconRect.height * (targetHeight / rect.height)

        ctx.drawImage(img, iconX, iconY, iconW, iconH)
        URL.revokeObjectURL(iconUrl)
      } catch (error) {
        console.warn("Failed to render icon:", error)
      }
    }

    const textElement = element.querySelector("p")
    if (textElement && textElement.textContent) {
      try {
        const textStyles = window.getComputedStyle(textElement)
        const textRect = textElement.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()

        const textX = (textRect.left - containerRect.left + textRect.width / 2) * (targetWidth / rect.width)
        const textY = (textRect.top - containerRect.top + textRect.height / 2) * (targetHeight / rect.height)

        const fontSize = Number.parseInt(textStyles.fontSize) * (targetWidth / rect.width)
        ctx.font = `${textStyles.fontStyle} ${textStyles.fontWeight} ${fontSize}px ${textStyles.fontFamily}`
        ctx.fillStyle = textStyles.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.fillText(textElement.textContent, textX, textY)
      } catch (error) {
        console.warn("Failed to render text:", error)
      }
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation as any,
      unit: "mm",
      format: pageSize,
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pdfWidth - 2 * margin
    const maxHeight = pdfHeight - 2 * margin

    // Convert pixels to mm (assuming 96 DPI)
    const mmPerPx = 0.264583
    const logoWidthMm = targetWidth * mmPerPx
    const logoHeightMm = targetHeight * mmPerPx

    const scale = Math.min(maxWidth / logoWidthMm, maxHeight / logoHeightMm)
    const finalWidth = logoWidthMm * scale
    const finalHeight = logoHeightMm * scale

    const x = (pdfWidth - finalWidth) / 2
    const y = (pdfHeight - finalHeight) / 2

    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)
    pdf.save(`${fileName || "logo"}.pdf`)

    console.log("PDF export successful")
    return true
  } catch (error) {
    console.error("Error downloading PDF:", error)
    throw error
  }
}
