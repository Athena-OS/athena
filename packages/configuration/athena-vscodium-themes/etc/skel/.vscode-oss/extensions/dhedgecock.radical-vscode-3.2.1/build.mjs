import { promises as fs } from 'fs'

// Load theme color variables
import colors from './theme/colors-workbench.mjs'

// Load terminal variables
import { terminal } from './theme/colors-tokens.mjs'

// Load syntax tokens
import tokens from './theme/syntax-tokens.mjs'
import { comment } from './theme/languages/comment.mjs'
import { go } from './theme/languages/go.mjs'
import { html } from './theme/languages/html.mjs'
import { markdown } from './theme/languages/markdown.mjs'
import { javascript } from './theme/languages/javascript.mjs'
import { json } from './theme/languages/json.mjs'
import { react } from './theme/languages/react.mjs'
import { yaml } from './theme/languages/yaml.mjs'

// Create the base theme definition
// ---------------------------------------------------------------------------

let theme = {
  $schema: 'vscode://schemas/color-theme',
  author: 'Dan Hedgecock',
  name: 'Radical',
  colorSpaceName: 'sRGB',
  semanticClass: 'theme.dark.radical',
  // Editor theme styles
  colors: {
    ...colors,
    ...terminal,
  },
  tokenColors: [
    ...tokens,
    ...comment,
    ...go,
    ...html,
    ...markdown,
    ...javascript,
    ...json,
    ...react,
    ...yaml,
  ],
}

// Convert color variables to string vlaues
// ---------------------------------------------------------------------------

// Delete any value that is null (as a convention this lets us track that all
// theme variables are being set by assigning values to all of them)
Object.keys(theme.colors).forEach((color) => {
  if (theme.colors[color] === null) delete theme.colors[color]
})

// Stringify all of the combined theme styles so we can run string regexes on it to
// replace color variables with color values
theme = JSON.stringify(theme, null, 2)

// Base file has been extended with additional theme styles and color variables have
// been replaced with Panda theme values. Write to /dist for consumption.
fs.writeFile('dist/Radical.json', theme)
  .then(() => console.log('Build finished'))
  .catch((err) => console.warn(err))
