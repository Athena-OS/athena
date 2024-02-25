local M = {}

M.base_30 = {
  white = "#4C4F69",
  darker_black = "#e6e8ec",
  black = "#EFF1F5", --  nvim bg
  black2 = "#e0e2e6",
  one_bg = "#e4e6ea", -- real bg of onedark
  one_bg2 = "#d9dbdf",
  one_bg3 = "#ced0d4",
  grey = "#c3c5c9",
  grey_fg = "#b9bbbf",
  grey_fg2 = "#b0b2b6",
  light_grey = "#a6a8ac",
  red = "#D20F39",
  baby_pink = "#DD7878",
  pink = "#ea76cb",
  line = "#d9dbdf", -- for lines like vertsplit
  green = "#40A02B",
  vibrant_green = "#7eca9c",
  nord_blue = "#7287FD",
  blue = "#1e66f5",
  yellow = "#df8e1d",
  sun = "#dea95f",
  purple = "#8839EF",
  dark_purple = "#7c2de3",
  teal = "#179299",
  orange = "#FE640B",
  cyan = "#04A5E5",
  statusline_bg = "#e4e6ea",
  lightbg = "#d9dbdf",
  pmenu_bg = "#7287FD",
  folder_bg = "#6C6C6C",
}

M.base_16 = {
  base00 = "#EFF1F5",
  base01 = "#e4e6ea",
  base02 = "#d9dbdf",
  base03 = "#ced0d4",
  base04 = "#c3c5c9",
  base05 = "#4C4F69",
  base06 = "#474a64",
  base07 = "#41445e",
  base08 = "#D20F39",
  base09 = "#7c2de3",
  base0A = "#df8e1d",
  base0B = "#40A02B",
  base0C = "#179299",
  base0D = "#1e66f5",
  base0E = "#8839EF",
  base0F = "#62657f",
}

vim.opt.bg = "light"

M.polish_hl = {
  TelescopePromptPrefix = { fg = M.base_30.white },
  TelescopeSelection = { bg = M.base_30.one_bg, fg = M.base_30.white },
  FloatBorder = { fg = M.base_16.base05 },
  DiffAdd = { fg = M.base_16.base05 },
  TbLineThemeToggleBtn = { bg = M.base_30.one_bg3 },
  WhichKeyDesc = { fg = M.base_30.white },
  Pmenu = { bg = M.base_30.black2 },
  St_pos_text = { fg = M.base_30.white },
  ["@variable.builtin"] = { fg = M.base_30.red },
  ["@property"] = { fg = M.base_30.teal },
}

M = require("base46").override_theme(M, "catppuccin_latte")

return M
