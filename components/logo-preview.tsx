"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import GridOverlay from "@/components/grid-overlay"

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
    // Grid properties (optional)
    showGrid?: boolean
    gridSize?: number
    gridColor?: string
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

  // Ensure the logo is centered in the container with balanced padding
  useEffect(() => {
    // Use a simpler approach to avoid ResizeObserver loops
    if (containerRef.current) {
      // Apply initial centering with CSS instead of continuous observation
      containerRef.current.style.margin = "auto"
    }

    // No need for ResizeObserver as we're using CSS centering
    // This avoids the "ResizeObserver loop completed with undelivered notifications" error
  }, [])

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
            width: "280px",
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: settings.useGradient
              ? `linear-gradient(135deg, ${settings.backgroundColor}, ${settings.gradientColor})`
              : settings.backgroundColor,
            borderRadius: `${settings.borderRadius}%`,
            padding: `${settings.padding}%`,
            border: `${settings.borderWidth}px solid ${settings.borderColor}`,
            transition: "all 0.3s ease",
            position: "relative", // Add this for absolute positioning of grid
          }}
          className={shadowClasses[settings.shadow as keyof typeof shadowClasses]}
        >
          <GridOverlay
            visible={settings.showGrid || false}
            size={settings.gridSize || 10}
            color={settings.gridColor || "rgba(255,255,255,0.2)"}
          />
          <div className={`flex ${getContentLayout()} w-full h-full`}>
            {/* Icon */}
            <div
              className={`flex items-center justify-center ${
                settings.textEnabled && settings.textPosition === "center" ? "absolute" : ""
              }`}
            >
              {IconComponent && (
                <IconComponent
                  style={{
                    width: `${settings.iconSize * 2.0}%`, // Increased icon size by 100%
                    height: `${settings.iconSize * 2.0}%`, // Increased icon size by 100%
                    color: settings.iconColor,
                    transform: `rotate(${settings.iconRotation}deg)`,
                    transition: "all 0.3s ease",
                  }}
                  fill={settings.iconFillOpacity > 0 ? settings.iconFillColor : settings.iconColor}
                  fillOpacity={settings.iconFillOpacity > 0 ? settings.iconFillOpacity / 100 : 0.2}
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
