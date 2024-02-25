local theme = require("base46").get_theme_tb "base_16"

-- Standard syntax highlighting

return {
  Boolean = {
    fg = theme.base09,
  },

  Character = {
    fg = theme.base08,
  },

  Conditional = {
    fg = theme.base0E,
  },

  Constant = {
    fg = theme.base08,
  },

  Define = {
    fg = theme.base0E,
    sp = "none",
  },

  Delimiter = {
    fg = theme.base0F,
  },

  Float = {
    fg = theme.base09,
  },

  Variable = {
    fg = theme.base05,
  },

  Function = {
    fg = theme.base0D,
  },

  Identifier = {
    fg = theme.base08,
    sp = "none",
  },

  Include = {
    fg = theme.base0D,
  },

  Keyword = {
    fg = theme.base0E,
  },

  Label = {
    fg = theme.base0A,
  },

  Number = {
    fg = theme.base09,
  },

  Operator = {
    fg = theme.base05,
    sp = "none",
  },

  PreProc = {
    fg = theme.base0A,
  },

  Repeat = {
    fg = theme.base0A,
  },

  Special = {
    fg = theme.base0C,
  },

  SpecialChar = {
    fg = theme.base0F,
  },

  Statement = {
    fg = theme.base08,
  },

  StorageClass = {
    fg = theme.base0A,
  },

  String = {
    fg = theme.base0B,
  },

  Structure = {
    fg = theme.base0E,
  },

  Tag = {
    fg = theme.base0A,
  },

  Todo = {
    fg = theme.base0A,
    bg = theme.base01,
  },

  Type = {
    fg = theme.base0A,
    sp = "none",
  },

  Typedef = {
    fg = theme.base0A,
  },
}
