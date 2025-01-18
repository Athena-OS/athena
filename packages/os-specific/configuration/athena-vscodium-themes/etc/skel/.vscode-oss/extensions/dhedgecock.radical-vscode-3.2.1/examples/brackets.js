// Example of bracket colors

function radicalBrackets({ brackets } = { brackets: [] }) {
  return brackets.map((bracket) => ({ radLevel: bracket.status }))
}

radicalBrackets()
