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

// Helper function to convert CSS color to hex with better error handling
const cssColorToHex = (cssColor: string): string => {
  if (!cssColor || cssColor === "transparent" || cssColor === "rgba(0, 0, 0, 0)") {
    return "#ffffff"
  }

  if (cssColor.startsWith("#")) {
    // Validate hex format
    const hex = cssColor.slice(1)
    if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
      // Convert 3-digit to 6-digit hex
      if (hex.length === 3) {
        return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
      }
      return cssColor
    }
  }

  // Handle rgb/rgba values
  const rgbMatch = cssColor.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)
  if (rgbMatch) {
    const r = Number.parseInt(rgbMatch[1]).toString(16).padStart(2, "0")
    const g = Number.parseInt(rgbMatch[2]).toString(16).padStart(2, "0")
    const b = Number.parseInt(rgbMatch[3]).toString(16).padStart(2, "0")
    return `#${r}${g}${b}`
  }

  // Fallback: create temporary element to compute color
  try {
    const div = document.createElement("div")
    div.style.color = cssColor
    div.style.display = "none"
    document.body.appendChild(div)

    const computedColor = window.getComputedStyle(div).color
    document.body.removeChild(div)

    const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      const r = Number.parseInt(match[1]).toString(16).padStart(2, "0")
      const g = Number.parseInt(match[2]).toString(16).padStart(2, "0")
      const b = Number.parseInt(match[3]).toString(16).padStart(2, "0")
      return `#${r}${g}${b}`
    }
  } catch (error) {
    console.warn("Failed to convert color:", cssColor, error)
  }

  return "#ffffff" // Safe fallback
}

// Enhanced function to get current background from element with real-time detection
const getCurrentBackground = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element)

  // Force style recalculation to get latest values
  element.offsetHeight // Trigger reflow

  // Check background-image first (gradients are stored here)
  const backgroundImage = styles.backgroundImage
  if (backgroundImage && backgroundImage !== "none" && backgroundImage.includes("linear-gradient")) {
    return {
      type: "gradient",
      value: backgroundImage,
    }
  }

  // Check background shorthand property
  const background = styles.background
  if (background && background.includes("linear-gradient")) {
    return {
      type: "gradient",
      value: background,
    }
  }

  // Get background color
  const backgroundColor = styles.backgroundColor
  return {
    type: "solid",
    value: backgroundColor || "#ffffff",
  }
}

// Enhanced gradient parsing with better error handling
const parseGradientColors = (backgroundStyle: string): { colors: string[]; angle: number } => {
  const defaultResult = { colors: ["#3b82f6", "#60a5fa"], angle: 135 }

  if (!backgroundStyle || !backgroundStyle.includes("linear-gradient")) {
    return defaultResult
  }

  try {
    // Extract angle with multiple pattern support
    let angle = 135
    const anglePatterns = [
      /linear-gradient\s*\(\s*(\d+)deg/,
      /linear-gradient\s*\(\s*(\d+\.?\d*)deg/,
      /linear-gradient\s*\(\s*to\s+(\w+)/,
    ]

    for (const pattern of anglePatterns) {
      const match = backgroundStyle.match(pattern)
      if (match) {
        if (match[1] && !isNaN(Number(match[1]))) {
          angle = Number(match[1])
          break
        } else if (match[1]) {
          // Handle directional keywords
          const directions: Record<string, number> = {
            right: 90,
            bottom: 180,
            left: 270,
            top: 0,
          }
          angle = directions[match[1]] || 135
          break
        }
      }
    }

    // Enhanced color extraction with multiple formats
    const colorPatterns = [/#[0-9a-fA-F]{3,8}/g, /rgb$$[^)]+$$/g, /rgba$$[^)]+$$/g, /hsl$$[^)]+$$/g, /hsla$$[^)]+$$/g]

    let allColors: string[] = []
    for (const pattern of colorPatterns) {
      const matches = backgroundStyle.match(pattern)
      if (matches) {
        allColors = allColors.concat(matches)
      }
    }

    if (allColors.length >= 2) {
      const colors = allColors
        .slice(0, 2)
        .map((color) => cssColorToHex(color))
        .filter((color) => color && color !== "#ffffff")

      if (colors.length >= 2) {
        return { colors, angle }
      } else if (colors.length === 1) {
        // If only one color found, create a subtle gradient
        return { colors: [colors[0], colors[0]], angle }
      }
    }
  } catch (error) {
    console.warn("Error parsing gradient:", error)
  }

  return defaultResult
}

// Enhanced SVG export with better background detection
export const downloadSVG = (elementId: string, fileName: string): boolean => {
  try {
    const { element, rect } = validateElement(elementId)

    // Force style recalculation
    element.offsetHeight

    // Get current background with real-time detection
    const background = getCurrentBackground(element)
    const width = Math.round(rect.width)
    const height = Math.round(rect.height)

    console.log("SVG Export - Current background:", background)

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
    if (background.type === "gradient") {
      const { colors, angle } = parseGradientColors(background.value)
      console.log("SVG Export - Parsed gradient:", { colors, angle })

      // Create linear gradient
      const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      const gradientId = `logoGradient_${Date.now()}`
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
      const bgColor = cssColorToHex(background.value)
      console.log("SVG Export - Solid background:", bgColor)
      backgroundRect.setAttribute("fill", bgColor)
    }

    // Add border radius and other styles
    const styles = window.getComputedStyle(element)
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

    // Add icon and text (existing logic)
    const iconElement = element.querySelector("svg")
    if (iconElement) {
      const iconRect = iconElement.getBoundingClientRect()
      const iconStyles = window.getComputedStyle(iconElement)
      const containerRect = element.getBoundingClientRect()
      const iconX = iconRect.left - containerRect.left
      const iconY = iconRect.top - containerRect.top

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
        const pathData = path.getAttribute("d")
        if (pathData) {
          newPath.setAttribute("d", pathData)
          const strokeColor = cssColorToHex(iconStyles.color)
          newPath.setAttribute("stroke", strokeColor)
          newPath.setAttribute("stroke-width", path.getAttribute("stroke-width") || "2")
          newPath.setAttribute("stroke-linecap", "round")
          newPath.setAttribute("stroke-linejoin", "round")

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

      const scaleX = iconRect.width / 24
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

      if (textStyles.textShadow && textStyles.textShadow !== "none") {
        const filterId = `textShadow_${Date.now()}`
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
        filter.setAttribute("id", filterId)
        filter.innerHTML = `<feDropShadow dx="0" dy="0" stdDeviation="2" flood-opacity="0.5" flood-color="black"/>`
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

    console.log("✅ SVG export successful")
    return true
  } catch (error) {
    console.error("❌ Error downloading SVG:", error)
    throw error
  }
}

// Enhanced PNG export with real-time background detection
export const downloadPNG = async (elementId: string, fileName: string, width = 0, height = 0): Promise<boolean> => {
  try {
    const { element, rect } = validateElement(elementId)

    // Force style recalculation
    element.offsetHeight

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

    // Get current background with real-time detection
    const background = getCurrentBackground(element)
    console.log("PNG Export - Current background:", background)

    // Draw background
    if (background.type === "gradient") {
      const { colors, angle } = parseGradientColors(background.value)
      console.log("PNG Export - Parsed gradient:", { colors, angle })

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
      const bgColor = background.value
      console.log("PNG Export - Solid background:", bgColor)
      if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
        ctx.fillStyle = bgColor
      } else {
        ctx.fillStyle = "transparent"
      }
    }

    // Draw rounded rectangle if we have a background
    if (ctx.fillStyle !== "transparent") {
      const styles = window.getComputedStyle(element)
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

    console.log("✅ PNG export successful")
    return true
  } catch (error) {
    console.error("❌ Error downloading PNG:", error)
    throw error
  }
}

// Enhanced JPEG export with real-time background detection
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

    // Force style recalculation
    element.offsetHeight

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

    // Get current background and draw it
    const background = getCurrentBackground(element)
    console.log("JPEG Export - Current background:", background)

    if (background.type === "gradient") {
      const { colors, angle } = parseGradientColors(background.value)
      console.log("JPEG Export - Parsed gradient:", { colors, angle })

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
      ctx.fillStyle = background.value || backgroundColor
      console.log("JPEG Export - Solid background:", ctx.fillStyle)
    }

    const styles = window.getComputedStyle(element)
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

    // Add icon and text (same logic as PNG)
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

    console.log("✅ JPEG export successful")
    return true
  } catch (error) {
    console.error("❌ Error downloading JPEG:", error)
    throw error
  }
}

// Enhanced PDF export with real-time background detection
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

    // Force style recalculation
    element.offsetHeight

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

    // Get current background and draw it
    const background = getCurrentBackground(element)
    console.log("PDF Export - Current background:", background)

    if (background.type === "gradient") {
      const { colors, angle } = parseGradientColors(background.value)
      console.log("PDF Export - Parsed gradient:", { colors, angle })

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
      ctx.fillStyle = background.value || "#ffffff"
      console.log("PDF Export - Solid background:", ctx.fillStyle)
    }

    const styles = window.getComputedStyle(element)
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

    // Add icon and text (same logic as other formats)
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

    console.log("✅ PDF export successful")
    return true
  } catch (error) {
    console.error("❌ Error downloading PDF:", error)
    throw error
  }
}
