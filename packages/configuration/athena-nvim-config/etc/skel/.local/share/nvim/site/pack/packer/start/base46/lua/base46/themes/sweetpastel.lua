local M = {}

M.base_30 = {
  white = "#FFDEDE",
  darker_black = "#161a1e",
  black = "#1B1F23", --  nvim bg
  black2 = "#22262a",
  one_bg = "#25292d", -- real bg of onedark
  one_bg2 = "#2f3337",
  one_bg3 = "#393d41",
  grey = "#43474b",
  grey_fg = "#4b4f53",
  grey_fg2 = "#54585c",
  light_grey = "#5d6165",
  red = "#e5a3a1",
  baby_pink = "#FFC0EB",
  pink = "#F8B3CC",
  line = "#343A40", -- for lines like vertsplit
  green = "#B4E3AD",
  vibrant_green = "#9EDABE",
  nord_blue = "#B0CEEF",
  blue = "#A3CBE7", -- #
  yellow = "#ECE3B1",
  sun = "#E7DA84",
  purple = "#CEACE8",
  dark_purple = "#B1A8FB",
  teal = "#94D2CF",
  orange = "#F1C192",
  cyan = "#C9D4FF",
  statusline_bg = "#22262a",
  lightbg = "#2f3337",
  pmenu_bg = "#F8B3CC",
  folder_bg = "#A3CBE7",
}

M.base_16 = {
  base00 = "#1B1F23",
  base01 = "#25292d",
  base02 = "#2f3337",
  base03 = "#393d41",
  base04 = "#43474b",
  base05 = "#FDE5E6",
  base06 = "#DEE2E6",
  base07 = "#F8F9FA",
  base08 = "#e5a3a1",
  base09 = "#F1C192",
  base0A = "#ECE3B1",
  base0B = "#B4E3AD",
  base0C = "#F8B3CC",
  base0D = "#A3CBE7",
  base0E = "#CEACE8",
  base0F = "#e5a3a1",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "sweetpastel")

return M
