local M = {}

M.base_30 = {
  white = "#c7b89d",
  darker_black = "#1a1d1e",
  black = "#1e2122", --  nvim bg
  black2 = "#242728",
  one_bg = "#282b2c",
  one_bg2 = "#393c3d",
  one_bg3 = "#404344",
  grey = "#484b4c",
  grey_fg = "#575a5b",
  grey_fg2 = "#545758",
  light_grey = "#606364",
  red = "#ec6b64",
  baby_pink = "#ce8196",
  pink = "#ff75a0",
  line = "#323536", -- for lines like vertsplit
  green = "#89b482",
  vibrant_green = "#a9b665",
  nord_blue = "#6f8faf",
  blue = "#6d8dad",
  yellow = "#d6b676",
  sun = "#d1b171",
  purple = "#9385b4",
  dark_purple = "#887aa9",
  teal = "#749689",
  orange = "#e78a4e",
  cyan = "#82b3a8",
  statusline_bg = "#222526",
  lightbg = "#2d3031",
  pmenu_bg = "#89b482",
  folder_bg = "#6d8dad",
}

M.base_16 = {
  base0A = "#e0c080",
  base04 = "#d4be98",
  base07 = "#c7b89d",
  base05 = "#c0b196",
  base0E = "#d3869b",
  base0D = "#7daea3",
  base0C = "#86b17f",
  base0B = "#a9b665",
  base02 = "#36393a",
  base0F = "#d65d0e",
  base03 = "#404344",
  base08 = "#ec6b64",
  base01 = "#2c2f30",
  base00 = "#1e2122",
  base09 = "#e78a4e",
  base06 = "#c3b499",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "gruvchad")

return M
