import chroma from 'chroma-js'

export const alpha = (color, opacity) => chroma(color).alpha(opacity).hex()

// Utility method to generate a syntax token
export const token = (name, color, fontStyle) => ({
  scope: name,
  settings: {
    foreground: color,
    fontStyle,
  },
})
