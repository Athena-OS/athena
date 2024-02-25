local M = {}

M.base_30 = {
  white = "#d6deeb",
  darker_black = "#010f20",
  black = "#011627",
  black2 = "#091e2f",
  one_bg = "#112637", -- real bg of onedark
  one_bg2 = "#1b3041",
  one_bg3 = "#253a4b",
  grey = "#2c4152",
  grey_fg = "#34495a",
  grey_fg2 = "#3c5162",
  light_grey = "#495e6f",
  red = "#f78c6c",
  baby_pink = "#ff6cca",
  pink = "#fa58b6",
  line = "#182d3e",
  green = "#29E68E",
  vibrant_green = "#22da6e",
  blue = "#82aaff",
  nord_blue = "#78a0f5",
  yellow = "#ffcb8b",
  sun = "#ffe9a9",
  purple = "#c792ea",
  dark_purple = "#a974cc",
  teal = "#96CEB4",
  orange = "#FFAD60",
  cyan = "#aad2ff",
  statusline_bg = "#051a2b",
  lightbg = "#1a2f40",
  pmenu_bg = "#82aaff",
  folder_bg = "#82aaff",
}

M.base_16 = {
  base00 = "#011627",
  base01 = "#0c2132",
  base02 = "#172c3d",
  base03 = "#223748",
  base04 = "#2c4152",
  base05 = "#ced6e3",
  base06 = "#d6deeb",
  base07 = "#feffff",
  base08 = "#ecc48d",
  base09 = "#f78c6c",
  base0A = "#c792ea",
  base0B = "#29E68E",
  base0C = "#aad2ff",
  base0D = "#82aaff",
  base0E = "#c792ea",
  base0F = "#f78c6c",
}

M.polish_hl = {
  ["@parameter"] = { fg = M.base_30.orange },
  ["@keyword.return"] = { fg = M.base_30.cyan },
  ["@conditional"] = { fg = M.base_30.cyan },
  PmenuSel = { bg = M.base_30.blue },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "nightowl")

return M
