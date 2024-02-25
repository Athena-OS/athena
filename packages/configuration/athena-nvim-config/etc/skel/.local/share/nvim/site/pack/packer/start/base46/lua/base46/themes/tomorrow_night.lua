local M = {}

M.base_30 = {
  white = "#C5C8C2",
  darker_black = "#191b1d",
  black = "#1d1f21", -- nvim bg
  black2 = "#232527",
  one_bg = "#2d2f31",
  one_bg2 = "#353b45",
  one_bg3 = "#30343c",
  grey = "#434547",
  grey_fg = "#545B68",
  grey_fg2 = "#616875",
  light_grey = "#676e7b",
  red = "#cc6666",
  baby_pink = "#FF6E79",
  pink = "#ff9ca3",
  line = "#313335", -- for lines like vertsplit
  green = "#a4b595",
  vibrant_green = "#a3b991",
  nord_blue = "#728da8",
  blue = "#6f8dab",
  yellow = "#d7bd8d",
  sun = "#e4c180",
  purple = "#b4bbc8",
  dark_purple = "#b290ac",
  teal = "#8abdb6",
  orange = "#DE935F",
  cyan = "#70c0b1",
  statusline_bg = "#212326",
  lightbg = "#373B41",
  pmenu_bg = "#a4b595",
  folder_bg = "#6f8dab",
}

M.base_16 = {
  base0A = "#f0c674",
  base04 = "#b4b7b4",
  base07 = "#ffffff",
  base05 = "#c5c8c6",
  base0E = "#b294bb",
  base0D = "#81a2be",
  base0C = "#8abeb7",
  base0B = "#b5bd68",
  base02 = "#373b41",
  base0F = "#a3685a",
  base03 = "#969896",
  base08 = "#cc6666",
  base01 = "#282a2e",
  base00 = "#1d1f21",
  base09 = "#de935f",
  base06 = "#e0e0e0",
}

vim.opt.bg = "dark"

M.polish_hl = {
  PmenuSel = { fg = M.base_30.black, bg = M.base_30.red },
}

M = require("base46").override_theme(M, "tomorrow_night")

return M
