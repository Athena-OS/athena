local M = {}

M.base_30 = {
  white = "#F0f0f0",
  darker_black = "#090909",
  black = "#0f0f0f", --  nvim bg
  black2 = "#181818",
  one_bg = "#191919",
  one_bg2 = "#222222",
  one_bg3 = "#2a2a2a",
  grey = "#373737",
  grey_fg = "#414141",
  grey_fg2 = "#4b4b4b",
  light_grey = "#535353",
  red = "#ac8a8c",
  baby_pink = "#bb999b",
  pink = "#AC8AAC",
  line = "#242424", -- for lines like vertsplit
  green = "#8aac8b",
  vibrant_green = "#99bb9a",
  blue = "#9691b3",
  nord_blue = "#8F8AAC",
  yellow = "#ACA98A",
  sun = "#b3b091",
  purple = "#C49EC4",
  dark_purple = "#b58fb5",
  teal = "#8fb4b5",
  orange = "#9d9a7b",
  cyan = "#9EC3C4",
  statusline_bg = "#131313",
  lightbg = "#292929",
  pmenu_bg = "#8aac8b",
  folder_bg = "#8F8AAC",
}

M.base_16 = {
  base00 = "#0f0f0f",
  base01 = "#151515",
  base02 = "#191919",
  base03 = "#222222",
  base04 = "#535353",
  base05 = "#d8d8d8",
  base06 = "#e6e6e6",
  base07 = "#f0f0f0",
  base08 = "#b18f91",
  base09 = "#d8bb92",
  base0A = "#b1ae8f",
  base0B = "#8aac8b",
  base0C = "#91b2b3",
  base0D = "#a5a0c2",
  base0E = "#ac8aac",
  base0F = "#b39193",
}

M.polish_hl = {
  ["@variable"] = { fg = M.base_16.base05 },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "mountain")

return M
