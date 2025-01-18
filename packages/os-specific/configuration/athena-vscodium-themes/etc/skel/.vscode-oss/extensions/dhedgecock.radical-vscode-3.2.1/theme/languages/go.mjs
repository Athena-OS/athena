import { token } from '../utils.mjs'
import { BLUES, CHARTREUSES, GRAYS, PINKS } from '../colors-tokens.mjs'

export const go = [
  // The amount of characters in Go that don't have any assigned tokens is alot,
  // which makes the language look very dark. Overriding the base color to a
  // light gray makes it closer to languages like JS
  token('source.go', GRAYS[100]),

  // --------------------------------------------------------
  // Functions

  // called functions, eg Println in: fmt.Println
  token('support.function', BLUES[150]),

  // --------------------------------------------------------
  // Keywords

  // control flow, eg: return, if
  // ⓘ matches js token 'keyword.control.flow'
  token('keyword.control', PINKS[500]),

  // module imports, eg: import ()
  token('keyword.import', PINKS[400]),

  // eg: nil
  token('constant.language.go', CHARTREUSES[150]),
]
