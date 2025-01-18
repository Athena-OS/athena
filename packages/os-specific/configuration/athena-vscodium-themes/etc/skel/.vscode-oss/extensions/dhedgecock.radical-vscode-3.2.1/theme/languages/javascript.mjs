import { token } from '../utils.mjs'
import { BLUES, CHARTREUSES, PINKS, TEALS } from '../colors-tokens.mjs'

export const javascript = [
  // --------------------------------------------------------
  // Constants

  // Boolean values, eg: true
  token('constant.language.boolean', CHARTREUSES[300]),

  // Null values, eg: null
  token('constant.language.null', CHARTREUSES[200]),

  // --------------------------------------------------------
  // Functions

  // called functions, eg log in: console.log
  token('entity.name.function', BLUES[150]),

  // --------------------------------------------------------
  // Keywords

  // keywords, eg: return, if
  // ⓘ matches go token 'keyword.control'
  token('keyword.control.flow', PINKS[600]),

  // export keyword
  token('keyword.control.export', PINKS[600]),

  // keywords import and from in: import someModule from 'some-module'
  token('keyword.control.import, keyword.control.from', PINKS[400]),

  // operators, eg = in: const rad = 'radical', ===
  token('keyword.operator', PINKS[200]),

  // function in: function radical () {}
  token('storage.type.function', PINKS[500]),

  // this is PINKS[500] bc of storage.type.function which is too bright, reset to match keyword.operator
  token('storage.type.function.arrow', PINKS[200]),

  // --------------------------------------------------------
  // Strings

  // Template strings, eg: `radical-${status}`
  token('string.template', TEALS[200]),
]
