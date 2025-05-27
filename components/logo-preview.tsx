"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"

interface LogoPreviewProps {
  settings: {
    iconName: string
    iconSize: number
    iconRotation: number
    iconColor: string
    iconFillOpacity: number
    iconFillColor: string
    backgroundColor: string
    gradientColor: string
    useGradient: boolean
    borderRadius: number
    padding: number
    shadow: string
    borderWidth: number
    borderColor: string
    // Text properties
    text: string
    textEnabled: boolean
    textFont: string
    textSize: number
    textColor: string
    textPosition: string
    textWeight: string
    textStyle: string
    textLetterSpacing: number
  }
}

export default function LogoPreview({ settings }: LogoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[settings.iconName] || LucideIcons.Palette

  // Map shadow values to Tailwind classes
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  }

  // Calculate content layout based on text position
  const getContentLayout = () => {
    if (!settings.textEnabled || !settings.text) {
      return "items-center justify-center"
    }

    switch (settings.textPosition) {
      case "above":
        return "flex-col-reverse items-center justify-center"
      case "below":
        return "flex-col items-center justify-center"
      case "center":
        return "items-center justify-center relative"
      default:
        return "items-center justify-center"
    }
  }

  // Calculate the effective icon size - maximized while respecting padding
  const getEffectiveIconSize = () => {
    // Base size is the user's setting, but we'll scale it up
    const baseSize = settings.iconSize * 1.5 // Increase by 50% for better visibility

    // If text is enabled, we need to leave space for it
    if (settings.textEnabled && settings.text) {
      return settings.textPosition === "center" ? baseSize : baseSize * 0.85
    }

    // Without text, we can maximize the icon size
    return baseSize
  }

  // Enhanced background style generation with forced style updates
  const getBackgroundStyle = () => {
    if (settings.useGradient) {
      const gradient = `linear-gradient(135deg, ${settings.backgroundColor}, ${settings.gradientColor})`
      console.log("🎨 LogoPreview - Generated gradient:", gradient)

      return {
        background: gradient,
        backgroundImage: gradient, // Ensure both properties are set
        // Force browser to recognize the change
        WebkitBackgroundImage: gradient,
        MozBackgroundImage: gradient,
      }
    } else {
      return {
        backgroundColor: settings.backgroundColor,
        background: settings.backgroundColor,
        backgroundImage: "none", // Clear any previous gradient
      }
    }
  }

  // Enhanced effect to ensure DOM updates are applied immediately
  useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current

      // Force immediate style application
      const backgroundStyle = getBackgroundStyle()
      Object.assign(element.style, backgroundStyle)

      // Add comprehensive data attributes for export detection
      if (settings.useGradient) {
        const gradientData = {
          colors: [settings.backgroundColor, settings.gradientColor],
          angle: 135,
          useGradient: true,
        }
        element.setAttribute("data-gradient", JSON.stringify(gradientData))
        element.setAttribute("data-use-gradient", "true")
        element.setAttribute("data-background-color", settings.backgroundColor)
        element.setAttribute("data-gradient-color", settings.gradientColor)

        console.log("📊 Updated gradient data attributes:", gradientData)
      } else {
        element.removeAttribute("data-gradient")
        element.setAttribute("data-use-gradient", "false")
        element.setAttribute("data-background-color", settings.backgroundColor)
        element.removeAttribute("data-gradient-color")

        console.log("📊 Updated solid background data attributes")
      }

      // Force reflow to ensure styles are applied
      element.offsetHeight

      console.log("🔄 LogoPreview - Style update applied:", {
        useGradient: settings.useGradient,
        backgroundColor: settings.backgroundColor,
        gradientColor: settings.gradientColor,
        computedStyle: window.getComputedStyle(element).background,
      })
    }
  }, [settings.useGradient, settings.backgroundColor, settings.gradientColor])

  const backgroundStyle = getBackgroundStyle()

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Card
        className="p-10 mb-6 flex items-center justify-center bg-white shadow-md"
        style={{
          width: "440px",
          height: "440px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          id="logo-preview"
          ref={containerRef}
          style={{
            width: "320px", // Increased from 280px for more space
            height: "320px", // Increased from 280px for more space
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...backgroundStyle, // Apply the enhanced background style
            borderRadius: `${settings.borderRadius}%`,
            padding: `${settings.padding}%`,
            border: `${settings.borderWidth}px solid ${settings.borderColor}`,
            transition: "all 0.3s ease",
            position: "relative", // Ensure proper positioning of children
          }}
          className={shadowClasses[settings.shadow as keyof typeof shadowClasses]}
          data-use-gradient={settings.useGradient}
          data-background-color={settings.backgroundColor}
          data-gradient-color={settings.gradientColor}
        >
          <div className={`flex ${getContentLayout()} w-full h-full`}>
            {/* Icon */}
            <div
              className={`flex items-center justify-center ${
                settings.textEnabled && settings.textPosition === "center" ? "absolute" : ""
              }`}
              style={{
                width: "100%",
                height: settings.textEnabled && settings.text && settings.textPosition !== "center" ? "80%" : "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {IconComponent && (
                <IconComponent
                  style={{
                    width: `${getEffectiveIconSize()}%`,
                    height: `${getEffectiveIconSize()}%`,
                    color: settings.iconColor,
                    transform: `rotate(${settings.iconRotation}deg)`,
                    transition: "all 0.3s ease",
                    maxWidth: "90%", // Prevent overflow
                    maxHeight: "90%", // Prevent overflow
                  }}
                  fill={settings.iconFillOpacity > 0 ? settings.iconFillColor : "none"}
                  fillOpacity={settings.iconFillOpacity / 100}
                  strokeWidth={2}
                />
              )}
            </div>

            {/* Text */}
            {settings.textEnabled && settings.text && (
              <div
                className={`text-center ${
                  settings.textPosition === "center" ? "absolute z-10" : "my-2"
                } max-w-full overflow-hidden`}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: settings.textPosition !== "center" ? "20%" : "auto",
                }}
              >
                <p
                  style={{
                    fontFamily: settings.textFont,
                    fontSize: `${settings.textSize}px`,
                    color: settings.textColor,
                    fontWeight: settings.textWeight,
                    fontStyle: settings.textStyle,
                    letterSpacing: `${settings.textLetterSpacing}px`,
                    textShadow: settings.textPosition === "center" ? "0 0 4px rgba(0,0,0,0.5)" : "none",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {settings.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
      <div className="text-center text-gray-500 max-w-md">
        <p>Customize your logo by adjusting the settings on the left panel.</p>
        <p className="mt-2">When you're happy with your design, click Export to save your logo.</p>
      </div>
    </div>
  )
}
