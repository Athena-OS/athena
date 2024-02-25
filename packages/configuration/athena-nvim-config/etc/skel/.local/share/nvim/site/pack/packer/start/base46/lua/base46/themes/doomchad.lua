local M = {}

M.base_30 = {
  white = "#bbc2cf",
  darker_black = "#22262e",
  black = "#282c34", --  nvim bg
  black2 = "#2e323a",
  one_bg = "#32363e", -- real bg of onedark
  one_bg2 = "#3c4048",
  one_bg3 = "#41454d",
  grey = "#494d55",
  grey_fg = "#53575f",
  grey_fg2 = "#5d6169",
  light_grey = "#676b73",
  red = "#ff6b5a",
  baby_pink = "#ff7665",
  pink = "#ff75a0",
  line = "#3b3f47", -- for lines like vertsplit
  green = "#98be65",
  vibrant_green = "#a9cf76",
  nord_blue = "#47a5e5",
  blue = "#61afef",
  yellow = "#ECBE7B",
  sun = "#f2c481",
  purple = "#dc8ef3",
  dark_purple = "#c678dd",
  teal = "#4db5bd",
  orange = "#ea9558",
  cyan = "#46D9FF",
  statusline_bg = "#2d3139",
  lightbg = "#3a3e46",
  pmenu_bg = "#98be65",
  folder_bg = "#51afef",
}

M.base_16 = {
  base00 = "#282c34",
  base01 = "#32363e",
  base02 = "#3c4048",
  base03 = "#4e525a",
  base04 = "#5a5e66",
  base05 = "#a7aebb",
  base06 = "#b3bac7",
  base07 = "#bbc2cf",
  base08 = "#ff6c6b",
  base09 = "#ea9558",
  base0A = "#ECBE7B",
  base0B = "#98be65",
  base0C = "#66c4ff",
  base0D = "#48a6e6",
  base0E = "#9c94d4",
  base0F = "#c85a50",
}

M.polish_hl = {
  ["@field"] = { fg = M.base_30.blue },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "doomchad")

return M
