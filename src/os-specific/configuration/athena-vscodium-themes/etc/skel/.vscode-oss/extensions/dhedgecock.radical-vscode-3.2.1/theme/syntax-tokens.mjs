import { token } from './utils.mjs'
import colors from './colors-tokens.mjs'

// The generic syntax tokens are themed here according to the Textmate naming
// convention and the package color semantics.
// See: http://manual.macromates.com/en/language_grammars#naming_conventions.html

//
// Generic syntax tokens
//

export default [
  // ℹ️ No color for generic <meta>, see naming conventions for details
  token('comment', colors.comment, 'italic'),
  // Booleans are constants (Uppercase "constants" are actually variables)
  token('constant', colors.constant),
  // Entities end up being a lot of things, most noticably class names, method names
  token('entity', colors.entity),
  token('invalid', colors.invalid, 'italic bold underline'),
  // Language keywords like `export` or `return`
  token('keyword', colors.keyword),
  // Generic for markup content
  token('markup', colors.markup),
  // Includes variable declarations
  token('storage', colors.storage),
  token('string', colors.string),
  // Support is meant to be things provided by external frameworks or libraries
  token('support', colors.support),
  token('variable', colors.variable),
]
