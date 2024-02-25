local M = {}

M.base_30 = {
  white = "#d4d4d5",
  darker_black = "#0a0d11",
  black = "#101317", --  nvim bg
  black2 = "#191d22",
  one_bg = "#212428",
  one_bg2 = "#292c30",
  one_bg3 = "#33363a",
  grey = "#3e4145",
  grey_fg = "#45484c",
  grey_fg2 = "#4a4d51",
  light_grey = "#525559",
  red = "#f87070",
  baby_pink = "#ff8e8e",
  pink = "#ffa7a7",
  line = "#30303a", -- for lines like vertsplit
  green = "#37d99e",
  vibrant_green = "#79dcaa",
  blue = "#7ab0df",
  nord_blue = "#87bdec",
  yellow = "#ffe59e",
  sun = "#ffeda6",
  purple = "#c397d8",
  dark_purple = "#b68acb",
  teal = "#63b3ad",
  orange = "#f0a988",
  cyan = "#50cad2",
  statusline_bg = "#15191e",
  lightbg = "#24282d",
  pmenu_bg = "#3bdda2",
  folder_bg = "#5fb0fc",
}

M.base_16 = {
  base00 = "#101317",
  base01 = "#1a1d21",
  base02 = "#23262a",
  base03 = "#2b2e32",
  base04 = "#323539",
  base05 = "#c5c5c6",
  base06 = "#cbcbcc",
  base07 = "#d4d4d5",
  base08 = "#37d99e",
  base09 = "#f0a988",
  base0A = "#e5d487",
  base0B = "#e87979",
  base0C = "#37d99e",
  base0D = "#5fb0fc",
  base0E = "#c397d8",
  base0F = "#e87979",
}

M.polish_hl = {
  ["@punctuation.bracket"] = { fg = M.base_16.base07 },
  ["@parenthesis"] = { link = "@punctuation.bracket" },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "radium")

return M
