// Utility method to generate a syntax token
const generateToken = (name, color, fontStyle) => ({
  scope: name,
  settings: {
    foreground: color,
    fontStyle,
  },
})
export default generateToken
