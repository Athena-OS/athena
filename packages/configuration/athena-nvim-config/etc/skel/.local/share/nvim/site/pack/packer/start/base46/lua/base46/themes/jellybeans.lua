local M = {}

M.base_30 = {
  white = "#e8e8d3",
  darker_black = "#101010",
  black = "#151515", --  nvim bg
  black2 = "#1c1c1c",
  one_bg = "#252525",
  one_bg2 = "#2e2e2e",
  one_bg3 = "#3a3a3a",
  grey = "#424242",
  grey_fg = "#474747",
  grey_fg2 = "#4c4c4c",
  light_grey = "#525252",
  red = "#cf6a4c",
  baby_pink = "#da7557",
  pink = "#f0a0c0",
  line = "#2d2d2d", -- for lines like vertsplit
  green = "#99ad6a",
  vibrant_green = "#c2cea6",
  nord_blue = "#768cb4",
  blue = "#8197bf",
  yellow = "#fad07a",
  sun = "#ffb964",
  purple = "#ea94ea",
  dark_purple = "#e58fe5",
  teal = "#668799",
  orange = "#e78a4e",
  cyan = "#8fbfdc",
  statusline_bg = "#191919",
  lightbg = "#2c2c2c",
  pmenu_bg = "#8197bf",
  folder_bg = "#8197bf",
}

M.base_16 = {
  base00 = "#151515",
  base01 = "#2e2e2e",
  base02 = "#3a3a3a",
  base03 = "#424242",
  base04 = "#474747",
  base05 = "#d9d9c4",
  base06 = "#dedec9",
  base07 = "#f1f1e5",
  base08 = "#dd785a",
  base09 = "#c99f4a",
  base0A = "#e1b655",
  base0B = "#99ad6a",
  base0C = "#7187af",
  base0D = "#8fa5cd",
  base0E = "#e18be1",
  base0F = "#cf6a4c",
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "jellybeans")

return M
