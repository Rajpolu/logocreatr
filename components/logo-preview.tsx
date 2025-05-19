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

  // Ensure the logo is centered in the container
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement
        if (parent) {
          const parentHeight = parent.clientHeight
          const logoHeight = containerRef.current.clientHeight
          const marginTop = Math.max(0, (parentHeight - logoHeight) / 2)
          containerRef.current.style.marginTop = `${marginTop}px`
        }
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Card className="p-8 mb-6 flex items-center justify-center">
        <div
          id="logo-preview"
          ref={containerRef}
          style={{
            width: "300px",
            height: "300px",
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
          }}
          className={shadowClasses[settings.shadow as keyof typeof shadowClasses]}
        >
          {IconComponent && (
            <IconComponent
              style={{
                width: `${settings.iconSize}%`,
                height: `${settings.iconSize}%`,
                color: settings.iconColor,
                transform: `rotate(${settings.iconRotation}deg)`,
                transition: "all 0.3s ease",
              }}
              fill={settings.iconFillOpacity > 0 ? settings.iconFillColor : "none"}
              fillOpacity={settings.iconFillOpacity / 100}
              strokeWidth={2}
            />
          )}
        </div>
      </Card>
      <div className="text-center text-gray-500 max-w-md">
        <p>Customize your logo by adjusting the settings on the left panel.</p>
        <p className="mt-2">When you're happy with your design, click Download to save your logo.</p>
        <p classname="mt-4">Designed and Developed with ❤️ in India by Rajpolu</p>
      </div>
    </div>
  )
}
