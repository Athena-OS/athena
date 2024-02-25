local colors = require("base46").get_theme_tb "base_30"

return {

  TelescopeBorder = {
    fg = colors.darker_black,
    bg = colors.darker_black,
  },

  TelescopePromptBorder = {
    fg = colors.black2,
    bg = colors.black2,
  },

  TelescopePromptNormal = {
    fg = colors.white,
    bg = colors.black2,
  },

  TelescopePromptPrefix = {
    fg = colors.red,
    bg = colors.black2,
  },

  TelescopeNormal = { bg = colors.darker_black },

  TelescopePreviewTitle = {
    fg = colors.black,
    bg = colors.green,
  },

  TelescopePromptTitle = {
    fg = colors.black,
    bg = colors.red,
  },

  TelescopeResultsTitle = {
    fg = colors.darker_black,
    bg = colors.darker_black,
  },

  TelescopeSelection = { bg = colors.black2, fg = colors.white },

  TelescopeResultsDiffAdd = {
    fg = colors.green,
  },

  TelescopeResultsDiffChange = {
    fg = colors.yellow,
  },

  TelescopeResultsDiffDelete = {
    fg = colors.red,
  },
}
