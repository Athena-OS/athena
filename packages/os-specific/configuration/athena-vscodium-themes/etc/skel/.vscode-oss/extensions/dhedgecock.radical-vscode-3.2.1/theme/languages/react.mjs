import { token } from '../utils.mjs'
import { BLUES, GRAYS, GREENS, TEALS } from '../colors-tokens.mjs'

export const react = [
  // JSX component names, eg <Radical
  token('support.class.component', TEALS[300]),

  // JSX HTML names, eg <div
  token('entity.name.tag', BLUES[300]),

  // JSX attribute names, eg someProp=
  token('entity.other.attribute-name', GREENS[100]),

  // JSX tags punctuation, eg: </
  token('punctuation.definition.tag', GRAYS[150]),
]
