theme_name = "tokyonight"

local colorscheme_ok, colorscheme = pcall(require, theme_name)
if not colorscheme_ok then
  return
end

function CreateDAPHighlights()
  if (theme_name == "tokyonight") then
    vim.api.nvim_set_hl(0, 'DapBreakpoint', { ctermbg = 0, fg = '#f7768e', bg = '#1a1b26' })
    vim.api.nvim_set_hl(0, 'DapLogPoint', { ctermbg = 0, fg = '#449dab', bg = '#1a1b26' })
    vim.api.nvim_set_hl(0, 'DapStopped', { ctermbg = 0, fg = '#e0af68', bg = '#1a1b26' })
  elseif (theme_name == "rose-pine") then
    vim.api.nvim_set_hl(0, 'DapBreakpoint', { ctermbg = 0, fg = '#eb6f92', bg = '#191724' })
    vim.api.nvim_set_hl(0, 'DapLogPoint', { ctermbg = 0, fg = '#9ccfd8', bg = '#191724' })
    vim.api.nvim_set_hl(0, 'DapStopped', { ctermbg = 0, fg = '#f6c177', bg = '#191724' })
  end
end

local function setupTheme()
  local opts = {}
  if theme_name == "tokyonight" then
    opts = {
      style = "night",
      on_highlights = function(hl, c)
        hl.TelescopeBorder = {
          bg = c.bg_dark,
          fg = c.bg_dark
        }

        vim.api.nvim_set_hl(0, 'HarpoonBorder', { fg = c.bg_dark, bg = c.bg_dark })
        vim.api.nvim_set_hl(0, 'HarpoonWindow', { fg = c.fg, bg = c.bg_dark })
        vim.api.nvim_set_hl(0, 'HarpoonTitle', { fg = c.purple, bg = c.bg_dark })
      end
    }
    vim.g.tokyonight_style = "night"
  elseif theme_name == "rose-pine" then
    local rose_pine_palette_ok, palette = pcall(require, 'rose-pine.palette')
    if rose_pine_palette_ok then
      opts = {
        disable_float_background = true,
        highlight_groups = {
          TelescopeBorder = { bg = palette.base, fg = palette.muted },
          TelescopeTitle = { bg = palette.base, fg = palette.gold },
          TelescopeResultsNormal = { bg = palette.base, fg = palette.text },
        }
      }
      vim.api.nvim_set_hl(0, 'HarpoonBorder', { fg = palette.muted, bg = palette.base })
      vim.api.nvim_set_hl(0, 'HarpoonWindow', { fg = palette.text, bg = palette.base })
      vim.api.nvim_set_hl(0, 'HarpoonTitle', { fg = palette.gold, bg = palette.base })
    end
  end

  colorscheme.setup(opts)

  ---@diagnostic disable-next-line: param-type-mismatch
  local status_ok, _ = pcall(vim.cmd, "colorscheme " .. theme_name)
  if not status_ok then
    vim.notify("colorscheme " .. theme_name .. " not found!")
    return
  end
end

setupTheme()
