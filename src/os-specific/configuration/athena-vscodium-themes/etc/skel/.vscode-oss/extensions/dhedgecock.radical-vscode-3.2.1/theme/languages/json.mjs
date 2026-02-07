import { token } from '../utils.mjs'
import { BLUES, GRAYS } from '../colors-tokens.mjs'

export const json = [
  // Property keys
  token('support.type.property-name.json', GRAYS[300]),

  // Property values
  token('source.json string', BLUES[100]),

  // Punctuation (Object and Array)
  token(
    'source.json punctuation.separator, source.json punctuation.definition.dictionary, source.json punctuation.definition.array',
    GRAYS[500],
  ),
]
