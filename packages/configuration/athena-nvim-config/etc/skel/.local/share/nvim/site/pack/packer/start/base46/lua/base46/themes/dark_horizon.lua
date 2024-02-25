local M = {}

M.base_30 = {
  white = "#FFFFFF",
  darker_black = "#080808",
  black = "#0e0e0e", --  nvim bg
  black2 = "#181818",
  one_bg = "#1c1c1c",
  one_bg2 = "#212121",
  one_bg3 = "#292929",
  grey = "#363636",
  grey_fg = "#404040",
  grey_fg2 = "#4a4a4a",
  light_grey = "#525252",
  red = "#dc322f",
  baby_pink = "#a72e5b",
  pink = "#ff75a0",
  line = "#1d1d1d", -- for lines like vertsplit
  green = "#AAD84C",
  vibrant_green = "#b9e75b",
  nord_blue = "#18a3af",
  blue = "#25B0BC",
  yellow = "#fdb830",
  sun = "#ffc038",
  purple = "#da70d6",
  dark_purple = "#c65cc2",
  teal = "#749689",
  orange = "#FFA500",
  cyan = "#6BE4E6",
  statusline_bg = "#181818",
  lightbg = "#292929",
  pmenu_bg = "#15bf84",
  folder_bg = "#07929e",
}

M.base_16 = {
  base00 = "#0e0e0e",
  base01 = "#181818",
  base02 = "#292929",
  base03 = "#363636",
  base04 = "#3f4248",
  base05 = "#c9c7be",
  base06 = "#E6E1CF",
  base07 = "#D9D7CE",
  base08 = "#D9D7CE", -- Confirmed: Variables Confirmed
  base09 = "#eaa273", -- Confirmed: Integers, Booleans
  base0A = "#825aff", -- Classes
  base0B = "#E3A587", -- Confirmed: Strings
  base0C = "#F09483", -- Escape characters, Regular expressions
  base0D = "#FFA500", -- Functions, Methods
  base0E = "#2ca9b4", -- Confirmed: Keywords, Storage, Selector, Markup
  base0F = "#d75271", -- Deprecated, Opening/Closing embedded language tags
}

M.polish_hl = {
  Include = { fg = M.base_16.base0E, bold = true },
  luaTSField = { fg = M.base_16.base0E },
  Repeat = { fg = M.base_16.base0E },
  ["@variable"] = { fg = M.base_16.base08 },
  ["@property"] = { fg = M.base_16.base0E },
  ["@tag.delimiter"] = { fg = M.base_16.base05 },
  ["@function"] = { fg = M.base_30.orange },
  ["@parameter"] = { fg = M.base_16.base0F },
  ["@constructor"] = { fg = M.base_16.base0A },
  ["@tag.attribute"] = { fg = M.base_16.orange },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "dark_horizon")

return M
