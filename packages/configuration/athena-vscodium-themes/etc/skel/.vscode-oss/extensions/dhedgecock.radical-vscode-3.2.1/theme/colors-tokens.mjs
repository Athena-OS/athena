import { BORDERS, PRIMARY_BACKGROUND } from './colors-workbench.mjs'

export const GRAYS = {
  100: '#B4DAE9',
  150: '#94b4c4',
  200: '#75B7BB',
  300: '#7c9c9e',
  400: '#639196',
  500: '#45898C',
}

export const BLUES = {
  100: '#BAF7FC',
  150: '#8ce1e7',
  200: '#79D5DB',
  300: '#6ACBD8',
}

export const CHARTREUSES = {
  100: '#E5FCA6',
  150: '#DFFD8E',
  200: '#DCFF7A',
  300: '#B3E27C',
}

export const PINKS = {
  100: '#fda8bc',
  200: '#FE8DA5',
  300: '#F37AB0',
  400: '#F272AA',
  500: '#FB4293',
  600: '#FF1998',
}

export const TEALS = {
  100: '#A9FEF7',
  200: '#A4FFE4',
  300: '#7AFFE2',
}

export const GREENS = {
  100: '#B3E4C2',
}

export default {
  comment: GRAYS[500],
  constant: CHARTREUSES[100],
  entity: '#a6e2e0',
  keyword: '#d5358f',
  markup: GRAYS[150], // ⓘ matches editor foreground color
  storage: PINKS[300],
  string: TEALS[100],
  support: '#7cb3b6',
  variable: GRAYS[100],
  // --- Status syntax tokens
  invalid: '#ff427b',
}

export const terminal = {
  'terminal.background': PRIMARY_BACKGROUND,
  'terminal.foreground': '#A8D2D4',
  // Border between multiple terminals
  'terminal.border': BORDERS[200],

  'terminal.selectionBackground': '#874df84d',

  'terminalCursor.background': '#ff428e',
  'terminalCursor.foreground': '#defff7',

  'terminal.ansiBlack': '#30317D',
  'terminal.ansiBrightBlack': '#391AB5',

  'terminal.ansiBlue': '#7DD9E4',
  'terminal.ansiBrightBlue': '#84F9FE',

  'terminal.ansiMagenta': '#fa61b8',
  'terminal.ansiBrightMagenta': '#d5358f',

  'terminal.ansiRed': '#FF5395',
  'terminal.ansiBrightRed': '#FF427B',

  'terminal.ansiGreen': '#D8FF4E',
  'terminal.ansiBrightGreen': '#C8FF00',

  'terminal.ansiYellow': '#FFFC7E',
  'terminal.ansiBrightYellow': '#F8D846',

  'terminal.ansiCyan': '#A8FFEF',
  'terminal.ansiBrightCyan': '#83FEE8',

  'terminal.ansiWhite': '#cff0e8',
  'terminal.ansiBrightWhite': '#cbfff2',
}
