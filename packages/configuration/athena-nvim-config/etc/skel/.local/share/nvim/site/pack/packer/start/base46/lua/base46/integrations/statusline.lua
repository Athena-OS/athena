local colors = require("base46").get_theme_tb "base_30"

return {

  StatusLine = {
    bg = colors.statusline_bg,
  },

  St_gitIcons = {
    fg = colors.light_grey,
    bg = colors.statusline_bg,
    bold = true,
  },

  -- LSP

  St_lspError = {
    fg = colors.red,
    bg = colors.statusline_bg,
  },

  St_lspWarning = {
    fg = colors.yellow,
    bg = colors.statusline_bg,
  },

  St_LspHints = {
    fg = colors.purple,
    bg = colors.statusline_bg,
  },

  St_LspInfo = {
    fg = colors.green,
    bg = colors.statusline_bg,
  },

  St_LspStatus = {
    fg = colors.nord_blue,
    bg = colors.statusline_bg,
  },

  St_LspProgress = {
    fg = colors.green,
    bg = colors.statusline_bg,
  },

  St_LspStatus_Icon = {
    fg = colors.black,
    bg = colors.nord_blue,
  },

  -- MODES

  St_NormalMode = {
    bg = colors.nord_blue,
    fg = colors.black,
    bold = true,
  },

  St_InsertMode = {
    bg = colors.dark_purple,
    fg = colors.black,

    bold = true,
  },

  St_TerminalMode = {
    bg = colors.green,
    fg = colors.black,
    bold = true,
  },

  St_NTerminalMode = {
    bg = colors.yellow,
    fg = colors.black,
    bold = true,
  },

  St_VisualMode = {
    bg = colors.cyan,
    fg = colors.black,
    bold = true,
  },

  St_ReplaceMode = {
    bg = colors.orange,
    fg = colors.black,

    bold = true,
  },

  St_ConfirmMode = {
    bg = colors.teal,
    fg = colors.black,

    bold = true,
  },

  St_CommandMode = {
    bg = colors.green,
    fg = colors.black,

    bold = true,
  },

  St_SelectMode = {
    bg = colors.nord_blue,
    fg = colors.black,

    bold = true,
  },

  -- Separators for mode
  St_NormalModeSep = {
    fg = colors.nord_blue,
    bg = colors.grey,
  },

  St_InsertModeSep = {
    fg = colors.dark_purple,
    bg = colors.grey,
  },

  St_TerminalModeSep = {
    fg = colors.green,
    bg = colors.grey,
  },

  St_NTerminalModeSep = {
    fg = colors.yellow,
    bg = colors.grey,
  },

  St_VisualModeSep = {
    fg = colors.cyan,
    bg = colors.grey,
  },

  St_ReplaceModeSep = {
    fg = colors.orange,
    bg = colors.grey,
  },

  St_ConfirmModeSep = {
    fg = colors.teal,
    bg = colors.grey,
  },

  St_CommandModeSep = {
    fg = colors.green,
    bg = colors.grey,
  },

  St_SelectModeSep = {
    fg = colors.nord_blue,
    bg = colors.grey,
  },

  St_EmptySpace = {
    fg = colors.grey,
    bg = colors.lightbg,
  },

  St_EmptySpace2 = {
    fg = colors.grey,
    bg = colors.statusline_bg,
  },

  St_file_info = {
    bg = colors.lightbg,
    fg = colors.white,
  },

  St_file_sep = {
    bg = colors.statusline_bg,
    fg = colors.lightbg,
  },

  St_cwd_icon = {
    fg = colors.one_bg,
    bg = colors.red,
  },

  St_cwd_text = {
    fg = colors.white,
    bg = colors.lightbg,
  },

  St_cwd_sep = {
    fg = colors.red,
    bg = colors.statusline_bg,
  },

  St_pos_sep = {
    fg = colors.green,
    bg = colors.lightbg,
  },

  St_pos_icon = {
    fg = colors.black,
    bg = colors.green,
  },

  St_pos_text = {
    fg = colors.green,
    bg = colors.lightbg,
  },
}
