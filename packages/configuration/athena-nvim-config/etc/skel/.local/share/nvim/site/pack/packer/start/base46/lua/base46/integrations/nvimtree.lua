local colors = require("base46").get_theme_tb "base_30"

return {
  NvimTreeEmptyFolderName = { fg = colors.folder_bg },
  NvimTreeEndOfBuffer = { fg = colors.darker_black },
  NvimTreeFolderIcon = { fg = colors.folder_bg },
  NvimTreeFolderName = { fg = colors.folder_bg },
  NvimTreeGitDirty = { fg = colors.red },
  NvimTreeIndentMarker = { fg = colors.grey_fg },
  NvimTreeNormal = { bg = colors.darker_black },
  NvimTreeNormalNC = { bg = colors.darker_black },
  NvimTreeOpenedFolderName = { fg = colors.folder_bg },
  NvimTreeGitIgnored = { fg = colors.light_grey },

  NvimTreeWinSeparator = {
    fg = colors.darker_black,
    bg = colors.darker_black,
  },

  NvimTreeWindowPicker = {
    fg = colors.red,
    bg = colors.black2,
  },

  NvimTreeCursorLine = {
    bg = colors.black2,
  },

  NvimTreeGitNew = {
    fg = colors.yellow,
  },

  NvimTreeGitDeleted = {
    fg = colors.red,
  },

  NvimTreeSpecialFile = {
    fg = colors.yellow,
    bold = true,
  },

  NvimTreeRootFolder = {
    fg = colors.red,
    bold = true,
  },
}
