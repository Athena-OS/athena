-- Credits to original theme https://gitlab.com/snakedye/chocolate
-- This is modified version of it

local M = {}

M.base_30 = {
  white = "#cdc0ad",
  darker_black = "#201d1c",
  black = "#252221", --  nvim bg
  black2 = "#2b2827",
  one_bg = "#2f2c2b",
  one_bg2 = "#393635",
  one_bg3 = "#43403f",
  grey = "#4d4a49",
  grey_fg = "#575453",
  grey_fg2 = "#615e5d",
  light_grey = "#6b6867",
  red = "#c65f5f",
  baby_pink = "#dc7575",
  pink = "#d16a6a",
  line = "#322f2e", -- for lines like vertsplit
  green = "#8ca589",
  vibrant_green = "#95ae92",
  nord_blue = "#728797",
  blue = "#7d92a2",
  yellow = "#d9b27c",
  sun = "#e1ba84",
  purple = "#998396",
  dark_purple = "#917b8e",
  teal = "#749689",
  orange = "#d08b65",
  cyan = "#829e9b",
  statusline_bg = "#292625",
  lightbg = "#353231",
  pmenu_bg = "#859e82",
  folder_bg = "#768b9b",
  beige = "#ab9382",
}

M.base_16 = {
  base00 = "#252221",
  base01 = "#2f2c2b",
  base02 = "#393635",
  base03 = "#43403f",
  base04 = "#4d4a49",
  base05 = "#c8bAA4",
  base06 = "#beae94",
  base07 = "#cdc0ad",
  base08 = "#c65f5f",
  base09 = "#d08b65",
  base0A = "#d9b27c",
  base0B = "#8ca589",
  base0C = "#998396",
  base0D = "#7d92a2",
  base0E = "#c65f5f",
  base0F = "#ab9382",
}

M.polish_hl = {
  ["@field"] = { fg = M.base_30.purple },
  ["@variable"] = { fg = M.base_16.base06 },
  ["@module"] = { fg = M.base_30.beige },
  Operator = { fg = M.base_30.blue },
  ["@attribute"] = { fg = M.base_30.cyan },
  ["@punctuation.bracket"] = { fg = M.base_16.base06 },
  ["@parenthesis"] = { link = "@punctuation.bracket" },
  ["@parameter"] = { fg = M.base_30.green },
  ["@function.builtin"] = { fg = M.base_30.yellow },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "chocolate")

return M
