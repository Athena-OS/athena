import { token } from '../utils.mjs'
import { BLUES, GRAYS, PINKS } from '../colors-tokens.mjs'

export const comment = [
  // Documentation comment blocks
  token('comment.block.documentation', GRAYS[200]),
  token('string.quoted.docstring', GRAYS[200], 'italic'), // same for Python

  // @tags for JSDoc
  token('comment.block.documentation storage', PINKS[100]),

  // {type} for JSDoc
  token('comment.block.documentation entity', GRAYS[500]),

  // name of JSDoc variables documentation
  token('variable.other.jsdoc', BLUES[100]),
]
