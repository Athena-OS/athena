local colors = require("base46").get_theme_tb "base_30"

return {
  NotifyERRORBorder = { fg = colors.red },
  NotifyERRORIcon = { fg = colors.red },
  NotifyERRORTitle = { fg = colors.red },
  NotifyWARNBorder = { fg = colors.orange },
  NotifyWARNIcon = { fg = colors.orange },
  NotifyWARNTitle = { fg = colors.orange },
  NotifyINFOBorder = { fg = colors.green },
  NotifyINFOIcon = { fg = colors.green },
  NotifyINFOTitle = { fg = colors.green },
  NotifyDEBUGBorder = { fg = colors.grey },
  NotifyDEBUGIcon = { fg = colors.grey },
  NotifyDEBUGTitle = { fg = colors.grey },
  NotifyTRACEBorder = { fg = colors.purple },
  NotifyTRACEIcon = { fg = colors.purple },
  NotifyTRACETitle = { fg = colors.purple },
}
