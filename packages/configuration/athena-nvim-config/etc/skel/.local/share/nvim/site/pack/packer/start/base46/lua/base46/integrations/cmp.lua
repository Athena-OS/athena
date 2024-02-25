local base16 = require("base46").get_theme_tb "base_16"
local colors = require("base46").get_theme_tb "base_30"

return {
  -- nvim cmp
  CmpItemAbbr = { fg = colors.white },
  CmpItemAbbrMatch = { fg = colors.blue, bold = true },
  CmpBorder = { fg = colors.grey },
  CmpDocBorder = { fg = colors.darker_black, bg = colors.darker_black },
  CmPmenu = { bg = colors.darker_black },

  -- cmp item kinds
  CmpItemKindConstant = { fg = base16.base09 },
  CmpItemKindFunction = { fg = base16.base0D },
  CmpItemKindIdentifier = { fg = base16.base08 },
  CmpItemKindField = { fg = base16.base08 },
  CmpItemKindVariable = { fg = base16.base0E },
  CmpItemKindSnippet = { fg = colors.red },
  CmpItemKindText = { fg = base16.base0B },
  CmpItemKindStructure = { fg = base16.base0E },
  CmpItemKindType = { fg = base16.base0A },
  CmpItemKindKeyword = { fg = base16.base07 },
  CmpItemKindMethod = { fg = base16.base0D },
  CmpItemKindConstructor = { fg = colors.blue },
  CmpItemKindFolder = { fg = base16.base07 },
  CmpItemKindModule = { fg = base16.base0A },
  CmpItemKindProperty = { fg = base16.base08 },
  -- CmpItemKindEnum = { fg = "" },
  CmpItemKindUnit = { fg = base16.base0E },
  -- CmpItemKindClass = { fg = "" },
  CmpItemKindFile = { fg = base16.base07 },
  -- CmpItemKindInterface = { fg = "" },
  CmpItemKindColor = { fg = colors.red },
  CmpItemKindReference = { fg = base16.base05 },
  -- CmpItemKindEnumMember = { fg = "" },
  CmpItemKindStruct = { fg = base16.base0E },
  -- CmpItemKindValue = { fg = "" },
  -- CmpItemKindEvent = { fg = "" },
  CmpItemKindOperator = { fg = base16.base05 },
  CmpItemKindTypeParameter = { fg = base16.base08 },
  CmpItemKindCopilot = { fg = colors.green },
}
