local M = {}

M.base_30 = {
  white = "#dee1e6",
  darker_black = "#1a1a1a",
  black = "#1E1E1E", --  nvim bg
  black2 = "#252525",
  one_bg = "#282828",
  one_bg2 = "#313131",
  one_bg3 = "#3a3a3a",
  grey = "#444444",
  grey_fg = "#4e4e4e",
  grey_fg2 = "#585858",
  light_grey = "#626262",
  red = "#D16969",
  baby_pink = "#ea696f",
  pink = "#bb7cb6",
  line = "#2e2e2e", -- for lines like vertsplit
  green = "#B5CEA8",
  green1 = "#4EC994",
  vibrant_green = "#bfd8b2",
  blue = "#569CD6",
  nord_blue = "#60a6e0",
  yellow = "#D7BA7D",
  sun = "#e1c487",
  purple = "#c68aee",
  dark_purple = "#b77bdf",
  teal = "#4294D6",
  orange = "#d3967d",
  cyan = "#9CDCFE",
  statusline_bg = "#242424",
  lightbg = "#303030",
  pmenu_bg = "#60a6e0",
  folder_bg = "#7A8A92",
}

M.base_16 = {
  --author of this template Tomas Iser, @tomasiser on github,
  base00 = "#1E1E1E",
  base01 = "#262626",
  base02 = "#303030",
  base03 = "#3C3C3C",
  base04 = "#464646",
  base05 = "#D4D4D4",
  base06 = "#E9E9E9",
  base07 = "#FFFFFF",
  base08 = "#9CDCFE",
  base09 = "#B5CEA8",
  base0A = "#60a6e0",
  base0B = "#c79782",
  base0C = "#9CDCFE",
  base0D = "#DCDCAA",
  base0E = "#C586C0",
  base0F = "#E9E9E9",
}

M.polish_hl = {
  ["@field"] = { fg = M.base_30.green1 },
  ["@parameter"] = { fg = M.base_30.cyan },
  ["@keyword"] = { fg = M.base_30.blue },
  ["@variable"] = { fg = M.base_30.cyan },
  ["@field.key"] = { fg = M.base_30.cyan },
  ["@keywordreturn"] = { fg = M.base_16.base0E },
  ["@keywordfunction"] = { fg = M.base_30.teal },
  ["@type.builtin"] = { fg = M.base_30.green1 },
  ["@constant.builtin"] = { fg = M.base_30.blue },

  Include = { fg = M.base_30.purple },
  Constant = { fg = M.base_30.cyan },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "vscode_dark")

return M
