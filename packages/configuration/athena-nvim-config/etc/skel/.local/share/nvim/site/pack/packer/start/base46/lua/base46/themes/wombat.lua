local M = {}

M.base_30 = {
  white = "#e4e0d7",
  darker_black = "#1b1b1b",
  black = "#222222",
  black2 = "#292929",
  one_bg = "#333333",
  one_bg2 = "#3a3a3a",
  one_bg3 = "#414141",
  grey = "#4b4b4b",
  grey_fg = "#535353",
  grey_fg2 = "#5a5a5a",
  light_grey = "#646464",
  red = "#FF8F7E",
  baby_pink = "#f58eff",
  pink = "#e780f8",
  line = "#353535",
  green = "#AEE474",
  vibrant_green = "#95e454",
  nord_blue = "#8dbdfb",
  blue = "#88B8F6",
  yellow = "#efdeab",
  sun = "#feedba",
  purple = "#dc8cff",
  dark_purple = "#c878f0",
  teal = "#7EB6BC",
  orange = "#FFCC66",
  cyan = "#90fdf8",
  statusline_bg = "#262626",
  lightbg = "#3c3c3c",
  pmenu_bg = "#95e454",
  folder_bg = "#7BB0C9",
}

M.base_16 = {
  base00 = "#202020",
  base01 = "#303030",
  base02 = "#373737",
  base03 = "#3e3e3e",
  base04 = "#484848",
  base05 = "#d6d2c9",
  base06 = "#ddd9d0",
  base07 = "#e4e0d7",
  base08 = "#FF8F7E",
  base09 = "#FFCC66",
  base0A = "#efdeab",
  base0B = "#AEE474",
  base0C = "#7EB6BC",
  base0D = "#88B8F6",
  base0E = "#dc8cff",
  base0F = "#dc8c64",
}

M.polish_hl = {
  ["@include"] = { fg = M.base_30.red },
  ["@constructor"] = { fg = M.base_30.orange },
  ["@variable"] = { link = "@constructor" },
  ["@conditional"] = { link = "@include" },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "wombat")

return M
