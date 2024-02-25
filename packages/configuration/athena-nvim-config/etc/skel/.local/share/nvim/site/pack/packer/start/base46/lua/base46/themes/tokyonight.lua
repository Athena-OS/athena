local M = {}

M.base_30 = {
  white = "#c0caf5",
  darker_black = "#16161e",
  black = "#1a1b26", --  nvim bg
  black2 = "#1f2336",
  one_bg = "#24283b",
  one_bg2 = "#414868",
  one_bg3 = "#353b45",
  grey = "#40486a",
  grey_fg = "#565f89",
  grey_fg2 = "#4f5779",
  light_grey = "#545c7e",
  red = "#f7768e",
  baby_pink = "#DE8C92",
  pink = "#ff75a0",
  line = "#32333e", -- for lines like vertsplit
  green = "#9ece6a",
  vibrant_green = "#73daca",
  nord_blue = "#80a8fd",
  blue = "#7aa2f7",
  yellow = "#e0af68",
  sun = "#EBCB8B",
  purple = "#bb9af7",
  dark_purple = "#9d7cd8",
  teal = "#1abc9c",
  orange = "#ff9e64",
  cyan = "#7dcfff",
  statusline_bg = "#1d1e29",
  lightbg = "#32333e",
  pmenu_bg = "#7aa2f7",
  folder_bg = "#7aa2f7",
}

M.base_16 = {
  base00 = "#1A1B26",
  base01 = "#3b4261",
  base02 = "#3b4261",
  base03 = "#545c7e",
  base04 = "#565c64",
  base05 = "#a9b1d6",
  base06 = "#bbc5f0",
  base07 = "#c0caf5",
  base08 = "#f7768e",
  base09 = "#ff9e64",
  base0A = "#ffd089",
  base0B = "#9ece6a",
  base0C = "#2ac3de",
  base0D = "#7aa2f7",
  base0E = "#bb9af7",
  base0F = "#c0caf5",
}

M.polish_hl = {
  ["@variable"] = { fg = M.base_30.red },
  ["@function.builtin"] = { fg = M.base_30.cyan },
  ["@parameter"] = { fg = M.base_30.white },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "tokyonight")

return M
