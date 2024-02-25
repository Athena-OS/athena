return {
  run = function(config)
    vim.g.statusline_sep_style = config.separator_style

    local modules = require "nvchad_ui.statusline.modules"

    if config.overriden_modules then
      modules = vim.tbl_deep_extend("force", modules, config.overriden_modules())
    end

    return table.concat {
      modules.mode(),
      modules.fileInfo(),
      modules.git(),

      "%=",
      modules.LSP_progress(),
      "%=",

      modules.LSP_Diagnostics(),
      modules.LSP_status() or "",
      modules.cwd(),
      modules.cursor_position(),
    }
  end,
}
