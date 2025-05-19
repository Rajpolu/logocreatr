export const initialState = {
  past: [],
  current: {
    iconName: "Palette",
    iconSize: 60,
    iconRotation: 0,
    iconColor: "#ffffff",
    iconFillOpacity: 0,
    iconFillColor: "#ffffff",
    backgroundColor: "#3b82f6",
    gradientColor: "#60a5fa",
    useGradient: true,
    borderRadius: 20,
    padding: 15,
    shadow: "md",
    borderWidth: 0,
    borderColor: "#000000",
  },
  future: [],
}

export function historyReducer(state: any, action: any) {
  const { past, current, future } = state

  switch (action.type) {
    case "UPDATE":
      return {
        past: [...past, current],
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
    default:
      return state
  }
}
