local M = {}

M.base_30 = {
  white = "#cdcecf",
  darker_black = "#121c29",
  black = "#192330",
  black2 = "#202a37",
  one_bg = "#252f3c", -- real bg of onedark
  one_bg2 = "#313b48",
  one_bg3 = "#3d4754",
  grey = "#495360",
  grey_fg = "#535d6a",
  grey_fg2 = "#5c6673",
  light_grey = "#646e7b",
  red = "#c94f6d",
  baby_pink = "#e26886",
  pink = "#d85e7c",
  line = "#2a3441",
  green = "#8ebaa4",
  vibrant_green = "#6ad4d6",
  blue = "#719cd6",
  nord_blue = "#86abdc",
  yellow = "#dbc074",
  sun = "#e0c989",
  purple = "#baa1e2",
  dark_purple = "#9d79d6",
  teal = "#5cc6c8",
  orange = "#fe9373",
  cyan = "#8be5e7",
  statusline_bg = "#202a37",
  lightbg = "#313b48",
  pmenu_bg = "#719cd6",
  folder_bg = "#719cd6",
}

M.base_16 = {
  base00 = "#192330",
  base01 = "#252f3c",
  base02 = "#313b48",
  base03 = "#3d4754",
  base04 = "#495360",
  base05 = "#c0c8d5",
  base06 = "#c7cfdc",
  base07 = "#ced6e3",
  base08 = "#e26886",
  base09 = "#fe9373",
  base0A = "#dbc074",
  base0B = "#8ebaa4",
  base0C = "#7ad4d6",
  base0D = "#86abdc",
  base0E = "#9d79d6",
  base0F = "#d85e7c",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "nightfox")

return M
