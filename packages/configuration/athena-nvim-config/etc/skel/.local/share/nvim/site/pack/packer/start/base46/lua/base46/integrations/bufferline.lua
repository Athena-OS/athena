local colors = require("base46").get_theme_tb "base_30"

return {

  BufferLineBackground = {
    fg = colors.light_grey,
    bg = colors.black2,
  },

  BufferlineIndicatorVisible = {
    fg = colors.black2,
    bg = colors.black2,
  },

  -- buffers
  BufferLineBufferSelected = {
    fg = colors.white,
    bg = colors.black,
  },

  BufferLineBufferVisible = {
    fg = colors.light_grey,
    bg = colors.black2,
  },

  -- for diagnostics = "nvim_lsp"
  BufferLineError = {
    fg = colors.light_grey,
    bg = colors.black2,
  },
  BufferLineErrorDiagnostic = {
    fg = colors.light_grey,
    bg = colors.black2,
  },

  -- close buttons
  BufferLineCloseButton = {
    fg = colors.light_grey,
    bg = colors.black2,
  },
  BufferLineCloseButtonVisible = {
    fg = colors.light_grey,
    bg = colors.black2,
  },
  BufferLineCloseButtonSelected = {
    fg = colors.red,
    bg = colors.black,
  },
  BufferLineFill = {
    fg = colors.grey_fg,
    bg = colors.black2,
  },
  BufferlineIndicatorSelected = {
    fg = colors.black,
    bg = colors.black,
  },

  -- modified
  BufferLineModified = {
    fg = colors.red,
    bg = colors.black2,
  },
  BufferLineModifiedVisible = {
    fg = colors.red,
    bg = colors.black2,
  },
  BufferLineModifiedSelected = {
    fg = colors.green,
    bg = colors.black,
  },

  -- separators
  BufferLineSeparator = {
    fg = colors.black2,
    bg = colors.black2,
  },
  BufferLineSeparatorVisible = {
    fg = colors.black2,
    bg = colors.black2,
  },
  BufferLineSeparatorSelected = {
    fg = colors.black2,
    bg = colors.black2,
  },

  -- tabs
  BufferLineTab = {
    fg = colors.light_grey,
    bg = colors.one_bg3,
  },
  BufferLineTabSelected = {
    fg = colors.black2,
    bg = colors.nord_blue,
  },
  BufferLineTabClose = {
    fg = colors.red,
    bg = colors.black,
  },

  BufferLineDevIconDefaultSelected = {
    bg = "none",
  },

  BufferLineDevIconDefaultInactive = {
    bg = "none",
  },

  BufferLineDuplicate = {
    fg = "NONE",
    bg = colors.black2,
  },
  BufferLineDuplicateSelected = {
    fg = colors.red,
    bg = colors.black,
  },
  BufferLineDuplicateVisible = {
    fg = colors.blue,
    bg = colors.black2,
  },

  -- custom area
  BufferLineRightCustomAreaText1 = {
    fg = colors.white,
  },

  BufferLineRightCustomAreaText2 = {
    fg = colors.red,
  },
}
