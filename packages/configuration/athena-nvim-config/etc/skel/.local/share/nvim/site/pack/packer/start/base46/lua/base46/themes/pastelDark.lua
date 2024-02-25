local M = {}

M.base_30 = {
  white = "#b5bcc9",
  darker_black = "#10171e",
  black = "#131a21", --  nvim bg
  black2 = "#1a2128",
  one_bg = "#1e252c",
  one_bg2 = "#2a3138",
  one_bg3 = "#363d44",
  grey = "#363d44",
  grey_fg = "#4e555c",
  grey_fg2 = "#51585f",
  light_grey = "#545b62",
  red = "#ef8891",
  baby_pink = "#fca2aa",
  pink = "#fca2af",
  line = "#272e35", -- for lines like vertsplit
  green = "#9fe8c3",
  vibrant_green = "#9ce5c0",
  blue = "#99aee5",
  nord_blue = "#9aa8cf",
  yellow = "#fbdf90",
  sun = "#fbdf9a",
  purple = "#c2a2e3",
  dark_purple = "#b696d7",
  teal = "#92dbb6",
  orange = "#EDA685",
  cyan = "#b5c3ea",
  statusline_bg = "#181f26",
  lightbg = "#222930",
  pmenu_bg = "#ef8891",
  folder_bg = "#99aee5",
}

M.base_16 = {
  base0A = "#f5d595",
  base04 = "#4f565d",
  base07 = "#b5bcc9",
  base05 = "#ced4df",
  base0E = "#c2a2e3",
  base0D = "#a3b8ef",
  base0C = "#abb9e0",
  base0B = "#9ce5c0",
  base02 = "#31383f",
  base0F = "#e88e9b",
  base03 = "#40474e",
  base08 = "#ef8891",
  base01 = "#2c333a",
  base00 = "#131a21",
  base09 = "#EDA685",
  base06 = "#d3d9e4",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "javacafe")

return M
