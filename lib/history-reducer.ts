export const initialState = {
  past: [],
  current: {
    iconName: "Palette",
    iconSize: 80, // Increased from 60 to 80
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 20, // Set a default fill opacity of 20%
    iconFillColor: "#ffffff",
    backgroundColor: "#3b82f6",
    gradientColor: "#60a5fa",
    useGradient: true,
    borderRadius: 20,
    padding: 15,
    shadow: "md",
    borderWidth: 0,
    borderColor: "#000000",
    // Text properties
    text: "",
    textEnabled: false,
    textFont: "Inter",
    textSize: 24,
    textColor: "#ffffff",
    textPosition: "below", // "above", "below", "center"
    textWeight: "normal", // "normal", "medium", "bold"
    textStyle: "normal", // "normal", "italic"
    textLetterSpacing: 0,
    // Grid properties
    showGrid: false,
    gridSize: 10,
    gridColor: "rgba(255,255,255,0.2)",
  },
  future: [],
}

export function historyReducer(state: any, action: any) {
  const { past, current, future } = state

  switch (action.type) {
    case "UPDATE":
      return {
        past: [...past, { ...current, timestamp: Date.now() }],
        current: action.payload,
        future: [],
      }
    case "UNDO":
      if (past.length === 0) return state
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      return {
        past: newPast,
        current: previous,
        future: [current, ...future],
      }
    case "REDO":
      if (future.length === 0) return state
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        past: [...past, current],
        current: next,
        future: newFuture,
      }
    case "RESTORE_VERSION":
      const { version, index } = action.payload
      const newPastUpToVersion = past.slice(0, index)

      return {
        past: newPastUpToVersion,
        current: version,
        future: [current, ...past.slice(index + 1), ...future],
      }
    default:
      return state
  }
}
