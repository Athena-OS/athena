-- credit to original theme for existing https://github.com/ayu-theme/ayu-vim
-- NOTE : This is a modified version of it

local M = {}

M.base_30 = {
  white = "#26292f",
  darker_black = "#ededed",
  black = "#fafafa", --  nvim bg
  black2 = "#e3e3e3",
  one_bg = "#ebebeb",
  one_bg2 = "#e1e1e1", -- Highlight of context
  one_bg3 = "#d7d7d7",
  grey = "#cdcdcd",
  grey_fg = "#b9b9b9",
  grey_fg2 = "#acacac", -- Highlight background
  light_grey = "#a0a0a0", -- Line numbers
  red = "#E65050",
  baby_pink = "#ff8282",
  pink = "#ffa5a5",
  line = "#e1e1e1", -- for lines like vertsplit
  green = "#6CBF43",
  vibrant_green = "#94e76b",
  blue = "#399EE6",
  nord_blue = "#2c91d9",
  yellow = "#E6BA7E",
  sun = "#f3c78b",
  purple = "#9F40FF",
  dark_purple = "#8627e6",
  teal = "#74c5aa",
  orange = "#FA8D3E",
  cyan = "#95E6CB",
  statusline_bg = "#f0f0f0",
  lightbg = "#e6e6e6",
  pmenu_bg = "#95E6CB",
  folder_bg = "#5C6166",
}

M.base_16 = {
  base00 = "#fafafa",
  base01 = "#f0f0f0",
  base02 = "#e6e6e6",
  base03 = "#dcdcdc",
  base04 = "#d2d2d2",
  base05 = "#5C6166",
  base06 = "#52575c",
  base07 = "#484d52",
  base08 = "#F07171",
  base09 = "#A37ACC",
  base0A = "#399EE6",
  base0B = "#86B300",
  base0C = "#4CBF99",
  base0D = "#55B4D4",
  base0E = "#FA8D3E",
  base0F = "#F2AE49",
}

M.polish_hl = {
  luaTSField = { fg = M.base_16.base0E },
  PmenuSel = { fg = M.base_30.white, bg = M.base_30.pmenu_bg },
  ["@tag.delimiter"] = { fg = M.base_30.base0D },
  ["@parameter"] = { fg = M.base_16.base09 },
  ["@constructor"] = { fg = M.base_16.base0C },
  ["@tag.attribute"] = { fg = M.base_30.base0F },
}

M = require("base46").override_theme(M, "ayu-light")

vim.opt.bg = "light"

return M
