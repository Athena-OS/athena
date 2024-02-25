local M = {}

M.base_30 = {
  white = "#ffffff", -- custom
  darker_black = "#232738",
  black = "#292D3E", --  nvim bg
  black2 = "#2f3344",
  one_bg = "#333748",
  one_bg2 = "#3c4051",
  one_bg3 = "#444859",
  grey = "#515566",
  grey_fg = "#5b5f70",
  grey_fg2 = "#65697a",
  light_grey = "#6d7182",
  red = "#f07178",
  baby_pink = "#606475",
  pink = "#ff5370", -- base16
  line = "#3f4354", -- for lines like vertsplit
  green = "#c3e88d", --base16
  vibrant_green = "#96e88d", -- custom
  nord_blue = "#8fb7ff",
  blue = "#82aaff", -- base16
  yellow = "#ffcb6b", -- base16
  sun = "#ffd373",
  purple = "#c792ea", -- base16
  dark_purple = "#b383d2", --custom
  teal = "#89ffe6", -- custom
  orange = "#ffa282", -- base16
  cyan = "#89ddff", -- base16
  statusline_bg = "#2d3142",
  lightbg = "#3c4051",
  pmenu_bg = "#82aaff", -- custom
  folder_bg = "#82aaff",
}

M.base_16 = {
  base00 = "#292d3e",
  base01 = "#444267",
  base02 = "#32374d",
  base03 = "#676e95",
  base04 = "#8796b0",
  base05 = "#d3d3d3",
  base06 = "#efefef",
  base07 = "#ffffff",
  base08 = "#f07178",
  base09 = "#ffa282",
  base0A = "#ffcb6b",
  base0B = "#c3e88d",
  base0C = "#89ddff",
  base0D = "#82aaff",
  base0E = "#c792ea",
  base0F = "#ff5370",
}

M.polish_hl = {
  ["@include"] = { fg = M.base_30.purple },
  ["@field.key"] = { fg = M.base_30.orange },
}

vim.opt.bg = "dark"

M = require("base46").override_theme(M, "palenight")

return M
