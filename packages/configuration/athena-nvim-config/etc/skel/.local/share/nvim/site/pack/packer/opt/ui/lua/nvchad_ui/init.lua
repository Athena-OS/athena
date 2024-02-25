local M = {}
local config = require "nvchad_ui.config"

M.statusline = function()
  return require("nvchad_ui.statusline").run(config.statusline)
end

M.tabufline = function()
  return require("nvchad_ui.tabufline").run(config.tabufline)
end

M.setup = function()
  vim.opt.statusline = "%!v:lua.require('nvchad_ui').statusline()"

  -- lazyload tabufline
  require "nvchad_ui.tabufline.lazyload"(config.tabufline)
end

return M
