local M = {}

M.base_30 = {
  white = "#D9D7D6",
  darker_black = "#000a0e",
  black = "#061115", --  nvim bg
  black2 = "#0d181c",
  one_bg = "#131e22",
  one_bg2 = "#1c272b",
  one_bg3 = "#242f33",
  grey = "#313c40",
  grey_fg = "#3b464a",
  grey_fg2 = "#455054",
  light_grey = "#4f5a5e",
  red = "#DF5B61",
  baby_pink = "#EE6A70",
  pink = "#F16269",
  line = "#222d31", -- for lines like vertsplit
  green = "#78B892",
  vibrant_green = "#8CD7AA",
  nord_blue = "#5A84BC",
  blue = "#6791C9",
  yellow = "#ecd28b",
  sun = "#f6dc95",
  purple = "#C488EC",
  dark_purple = "#BC83E3",
  teal = "#7ACFE4",
  orange = "#E89982",
  cyan = "#67AFC1",
  statusline_bg = "#0A1519",
  lightbg = "#1a2529",
  pmenu_bg = "#78B892",
  folder_bg = "#6791C9",
}

M.base_16 = {
  base00 = "#061115",
  base01 = "#0C171B",
  base02 = "#101B1F",
  base03 = "#192428",
  base04 = "#212C30",
  base05 = "#D9D7D6",
  base06 = "#E3E1E0",
  base07 = "#EDEBEA",
  base08 = "#f26e74",
  base09 = "#ecd28b",
  base0A = "#E9967E",
  base0B = "#82c29c",
  base0C = "#6791C9",
  base0D = "#79AAEB",
  base0E = "#C488EC",
  base0F = "#F16269",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "rxyhn")

return M
