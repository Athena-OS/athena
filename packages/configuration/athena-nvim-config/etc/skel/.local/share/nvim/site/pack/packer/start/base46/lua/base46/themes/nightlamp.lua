local M = {}

M.base_30 = {
  white = "#e0d6bd",
  darker_black = "#13141a",
  black = "#18191f", --nvim bg
  black2 = "#202127",
  one_bg = "#27282e",
  one_bg2 = "#2d2e34",
  one_bg3 = "#33343a",
  grey = "#3d3e44",
  grey_fg = "#48494f",
  grey_fg2 = "#4d4e54",
  light_grey = "#55565c",
  red = "#a67476",
  baby_pink = "#d6b3bd",
  pink = "#c99aa7",
  line = "#313238", --for lines like vertsplit
  green = "#8aa387",
  vibrant_green = "#94ad91",
  nord_blue = "#8d9bb3",
  blue = "#5a6986",
  yellow = "#ccb89c",
  sun = "#deb88a",
  purple = "#b8aad9",
  dark_purple = "#a99bca",
  teal = "#7aacaa",
  orange = "#cd9672",
  cyan = "#90a0a0",
  statusline_bg = "#1d1e24",
  lightbg = "#2b2c32",
  pmenu_bg = "#b58385",
  folder_bg = "#90a0a0",
}

M.base_16 = {
  base00 = "#18191f",
  base01 = "#222329",
  base02 = "#2c2d33",
  base03 = "#3c3d43",
  base04 = "#48494f",
  base05 = "#b8af9e",
  base06 = "#cbc0ab",
  base07 = "#e0d6bd",
  base08 = "#b8aad9",
  base09 = "#cd9672",
  base0A = "#ccb89c",
  base0B = "#8aa387",
  base0C = "#7aacaa",
  base0D = "#b58385",
  base0E = "#8e9cb4",
  base0F = "#90a0a0",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "nightlamp")

return M
