local M = {}

M.base_30 = {
  white = "#ced4df",
  darker_black = "#1c1c26",
  black = "#20202A", --  nvim bg
  black2 = "#25252f",
  one_bg = "#2a2a34",
  one_bg2 = "#34343e",
  one_bg3 = "#3e3e48",
  grey = "#484852",
  grey_fg = "#4e4e58",
  grey_fg2 = "#54545e",
  light_grey = "#5a5a64",
  red = "#ebb9b9",
  baby_pink = "#EAC1C1",
  pink = "#E9D1D1",
  line = "#2d2d37", -- for lines like vertsplit
  green = "#b1dba4",
  vibrant_green = "#BEE0A8",
  blue = "#CDDBF9",
  nord_blue = "#BCCAEB",
  yellow = "#E6DFB8",
  sun = "#EEE8BA",
  purple = "#f6bbe7",
  dark_purple = "#E8B6E9",
  teal = "#AEDCB7",
  orange = "#E8CCA7",
  cyan = "#b8dceb",
  statusline_bg = "#262630",
  lightbg = "#2e2e38",
  pmenu_bg = "#ebb9b9",
  folder_bg = "#b8dceb",
}

M.base_16 = {
  base00 = "#20202A",
  base01 = "#2c2e3e",
  base02 = "#3D4059",
  base03 = "#313449",
  base04 = "#63718b",
  base05 = "#bac0cb",
  base06 = "#c5cbd6",
  base07 = "#ced4df",
  base08 = "#ebb9b9",
  base09 = "#e8cca7",
  base0A = "#e6dfb8",
  base0B = "#b1dba4",
  base0C = "#b8dceb",
  base0D = "#a3b8ef",
  base0E = "#f6bbe7",
  base0F = "#eAc1c1",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "aquarium")

return M
