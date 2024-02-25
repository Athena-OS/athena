local theme = require("base46").get_theme_tb "base_16"

return {
  -- `@annotation` is not one of the default capture group, should we keep it
  ["@annotation"] = {
    fg = theme.base0F,
  },

  ["@attribute"] = {
    fg = theme.base0A,
  },

  ["@character"] = {
    fg = theme.base08,
  },

  ["@constructor"] = {
    fg = theme.base0C,
  },

  ["@constant.builtin"] = {
    fg = theme.base09,
  },

  ["@constant.macro"] = {
    fg = theme.base08,
  },

  ["@error"] = {
    fg = theme.base08,
  },

  ["@exception"] = {
    fg = theme.base08,
  },

  ["@float"] = {
    fg = theme.base09,
  },

  ["@keyword"] = {
    fg = theme.base0E,
  },

  ["@keyword.function"] = {
    fg = theme.base0E,
  },

  ["@keyword.return"] = {
    fg = theme.base0E,
  },

  ["@function"] = {
    fg = theme.base0D,
  },

  ["@function.builtin"] = {
    fg = theme.base0D,
  },

  ["@function.macro"] = {
    fg = theme.base08,
  },

  ["@keyword.operator"] = {
    fg = theme.base0E,
  },

  ["@method"] = {
    fg = theme.base0D,
  },

  ["@namespace"] = {
    fg = theme.base08,
  },

  ["@none"] = {
    fg = theme.base05,
  },

  ["@parameter"] = {
    fg = theme.base08,
  },

  ["@reference"] = {
    fg = theme.base05,
  },

  ["@punctuation.bracket"] = {
    fg = theme.base0F,
  },

  ["@punctuation.delimiter"] = {
    fg = theme.base0F,
  },

  ["@punctuation.special"] = {
    fg = theme.base08,
  },

  ["@string.regex"] = {
    fg = theme.base0C,
  },

  ["@string.escape"] = {
    fg = theme.base0C,
  },

  ["@symbol"] = {
    fg = theme.base0B,
  },

  ["@tag"] = {
    link = "Tag",
  },

  ["@tag.attribute"] = {
    link = "@property",
  },

  ["@tag.delimiter"] = {
    fg = theme.base0F,
  },

  ["@text"] = {
    fg = theme.base05,
  },

  ["@text.strong"] = {
    bold = true,
  },

  ["@text.emphasis"] = {
    fg = theme.base09,
  },

  ["@text.strike"] = {
    fg = theme.base00,
    strikethrough = true,
  },

  ["@text.literal"] = {
    fg = theme.base09,
  },

  ["@text.uri"] = {
    fg = theme.base09,
    underline = true,
  },

  ["@type.builtin"] = {
    fg = theme.base0A,
  },

  ["@variable"] = {
    fg = theme.base05,
  },

  ["@variable.builtin"] = {
    fg = theme.base09,
  },

  -- variable.global

  ["@definition"] = {
    sp = theme.base04,
    underline = true,
  },

  TSDefinitionUsage = {
    sp = theme.base04,
    underline = true,
  },

  ["@scope"] = {
    bold = true,
  },

  ["@field"] = {
    fg = theme.base08,
  },
  --
  -- ["@field.key"] = {
  --   fg = theme.base0D,
  -- },

  ["@property"] = {
    fg = theme.base08,
  },

  ["@include"] = {
    link = "Include",
  },

  ["@conditional"] = {
    link = "Conditional",
  },
}
