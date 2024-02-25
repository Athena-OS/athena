local M = {}

M.base_30 = {
  white = "#695d57",
  darker_black = "#dfd8d5",
  black = "#e6dfdc", --  nvim bg
  black2 = "#d9d2cf",
  one_bg = "#d0c9c6",
  one_bg2 = "#c7c0bd",
  one_bg3 = "#c0b9b6",
  grey = "#b9b2af",
  grey_fg = "#b2aba8",
  grey_fg2 = "#aaa3a0",
  light_grey = "#a09996",
  red = "#b28069",
  baby_pink = "#b7856e",
  pink = "#c18f78",
  line = "#d3ccc9", -- for lines like vertsplit
  green = "#6c805c",
  vibrant_green = "#899d79",
  blue = "#5f7d9b",
  nord_blue = "#5e5f65",
  yellow = "#a9a29f",
  sun = "#d38a73",
  purple = "#a685a6",
  dark_purple = "#9c7b9c",
  teal = "#4b6987",
  orange = "#cc836c",
  cyan = "#75998e",
  statusline_bg = "#dcd5d2",
  lightbg = "#cdc6c3",
  pmenu_bg = "#857e7b",
  folder_bg = "#746d6a",
}

M.base_16 = {
  base00 = "#e6dfdc",
  base01 = "#ded7d4",
  base02 = "#d7d0cd",
  base03 = "#d1cac7",
  base04 = "#cac3c0",
  base05 = "#746862",
  base06 = "#5e524c",
  base07 = "#695d57",
  base08 = "#8779a8",
  base09 = "#a87678",
  base0A = "#738199",
  base0B = "#6c805c",
  base0C = "#5e908e",
  base0D = "#b3816a",
  base0E = "#7e8e8e",
  base0F = "#976153",
}

M.polish_hl = {
  WhichKeyDesc = { fg = M.base_30.white },
  WhichKey = { fg = M.base_30.white },

  TbLineThemeToggleBtn = {
    fg = M.base_30.black,
    bg = M.base_30.white,
  },

  IndentBlanklineContextStart = { bg = M.base_30.black2 },
  St_pos_text = { fg = M.base_30.white },
}

vim.opt.bg = "light"

M = require("base46").override_theme(M, "blossom")

return M
