interface GridOverlayProps {
  visible: boolean
  size: number
  color: string
}

export default function GridOverlay({ visible, size, color }: GridOverlayProps) {
  if (!visible) return null

  // Calculate the number of lines based on size
  const spacing = size
  const lines = []

  // Create a 10x10 grid (adjust as needed)
  for (let i = 1; i < 10; i++) {
    // Horizontal lines
    lines.push(
      <line
        key={`h-${i}`}
        x1="0%"
        y1={`${i * 10}%`}
        x2="100%"
        y2={`${i * 10}%`}
        stroke={color}
        strokeWidth="1"
        strokeDasharray={spacing < 5 ? "2,2" : ""}
      />,
    )

    // Vertical lines
    lines.push(
      <line
        key={`v-${i}`}
        x1={`${i * 10}%`}
        y1="0%"
        x2={`${i * 10}%`}
        y2="100%"
        stroke={color}
        strokeWidth="1"
        strokeDasharray={spacing < 5 ? "2,2" : ""}
      />,
    )
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" style={{ zIndex: 10 }}>
      {lines}
    </svg>
  )
}
