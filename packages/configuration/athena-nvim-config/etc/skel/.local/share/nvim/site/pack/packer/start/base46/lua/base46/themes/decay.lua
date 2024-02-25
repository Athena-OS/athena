local M = {}

M.base_30 = {
  white = "#dee1e6",
  darker_black = "#111519",
  black = "#171B20", --  nvim bg
  black2 = "#1e2227",
  one_bg = "#262a2f",
  one_bg2 = "#2f3338",
  one_bg3 = "#373b40",
  grey = "#41454a",
  grey_fg = "#494d52",
  grey_fg2 = "#505459",
  light_grey = "#5a5e63",
  red = "#e05f65",
  baby_pink = "#ea696f",
  pink = "#c68aee",
  line = "#282d35", -- for lines like vertsplit
  green = "#78DBA9",
  vibrant_green = "#87eab8",
  blue = "#70a5eb",
  nord_blue = "#74bee9",
  yellow = "#f1cf8a",
  sun = "#e7c580",
  purple = "#c68aee",
  dark_purple = "#b77bdf",
  teal = "#7ddac5",
  orange = "#e9a180",
  cyan = "#74bee9",
  statusline_bg = "#1c2026",
  lightbg = "#2b3038",
  pmenu_bg = "#7ddac5",
  folder_bg = "#78DBA9",
}

M.base_16 = {
  base00 = "#171B20",
  base01 = "#21262e",
  base02 = "#242931",
  base03 = "#485263",
  base04 = "#485263",
  base05 = "#b6beca",
  base06 = "#dee1e6",
  base07 = "#dee1e6",
  base08 = "#e05f65",
  base09 = "#e9a180",
  base0A = "#f1cf8a",
  base0B = "#78DBA9",
  base0C = "#9cd1ff",
  base0D = "#74bee9",
  base0E = "#c68aee",
  base0F = "#e05f65",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "decay")

return M
