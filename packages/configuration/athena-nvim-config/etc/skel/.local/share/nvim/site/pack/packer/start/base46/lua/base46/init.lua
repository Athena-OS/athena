local M = {}
local g = vim.g
local config = require("core.utils").load_config()

M.get_theme_tb = function(type)
  local default_path = "base46.themes." .. g.nvchad_theme
  local user_path = "custom.themes." .. g.nvchad_theme

  local present1, default_theme = pcall(require, default_path)
  local present2, user_theme = pcall(require, user_path)

  if present1 then
    return default_theme[type]
  elseif present2 then
    return user_theme[type]
  else
    error "No such theme bruh >_< "
  end
end

M.merge_tb = function(table1, table2)
  return vim.tbl_deep_extend("force", table1, table2)
end

M.load_all_highlights = function()
  vim.opt.bg = require("base46").get_theme_tb "type" -- dark/light

  -- reload highlights for theme switcher
  local reload = require("plenary.reload").reload_module

  reload "base46.integrations"
  reload "base46.chadlights"

  local hl_groups = require "base46.chadlights"

  for hl, col in pairs(hl_groups) do
    vim.api.nvim_set_hl(0, hl, col)
  end
end

M.turn_str_to_color = function(tb_in)
  local tb = vim.deepcopy(tb_in)
  local colors = M.get_theme_tb "base_30"

  for _, groups in pairs(tb) do
    for k, v in pairs(groups) do
      if k == "fg" or k == "bg" then
        if v:sub(1, 1) == "#" or v == "none" or v == "NONE" then
        else
          groups[k] = colors[v]
        end
      end
    end
  end

  return tb
end

M.extend_default_hl = function(highlights)
  local glassy = require "base46.glassy"
  local polish_hl = M.get_theme_tb "polish_hl"

  -- polish themes
  if polish_hl then
    for key, value in pairs(polish_hl) do
      if highlights[key] then
        highlights[key] = M.merge_tb(highlights[key], value)
      end
    end
  end

  -- transparency
  if vim.g.transparency then
    for key, value in pairs(glassy) do
      if highlights[key] then
        highlights[key] = M.merge_tb(highlights[key], value)
      end
    end
  end

  local overriden_hl = M.turn_str_to_color(config.ui.hl_override)

  for key, value in pairs(overriden_hl) do
    if highlights[key] then
      highlights[key] = M.merge_tb(highlights[key], value)
    end
  end
end

M.load_highlight = function(group)
  if type(group) == "string" then
    group = require("base46.integrations." .. group)
    M.extend_default_hl(group)
  end

  for hl, col in pairs(group) do
    vim.api.nvim_set_hl(0, hl, col)
  end
end

M.load_theme = function()
  M.load_highlight "defaults"
  M.load_highlight "statusline"
  M.load_highlight "syntax"
  M.load_highlight(M.turn_str_to_color(config.ui.hl_add))
end

M.override_theme = function(default_theme, theme_name)
  local changed_themes = config.ui.changed_themes

  if changed_themes[theme_name] then
    return M.merge_tb(default_theme, changed_themes[theme_name])
  else
    return default_theme
  end
end

M.toggle_theme = function()
  local themes = config.ui.theme_toggle

  local theme1 = themes[1]
  local theme2 = themes[2]

  if g.nvchad_theme == theme1 or g.nvchad_theme == theme2 then
    if g.toggle_theme_icon == "   " then
      g.toggle_theme_icon = "   "
    else
      g.toggle_theme_icon = "   "
    end
  end

  if g.nvchad_theme == theme1 then
    g.nvchad_theme = theme2

    require("nvchad").reload_theme()
    require("nvchad").change_theme(theme1, theme2)
  elseif g.nvchad_theme == theme2 then
    g.nvchad_theme = theme1

    require("nvchad").reload_theme()
    require("nvchad").change_theme(theme2, theme1)
  else
    vim.notify "Set your current theme to one of those mentioned in the theme_toggle table (chadrc)"
  end
end

M.toggle_transparency = function()
  local transparency_status = config.ui.transparency
  local write_data = require("nvchad").write_data

  local function save_chadrc_data()
    local old_data = "transparency = " .. tostring(transparency_status)
    local new_data = "transparency = " .. tostring(g.transparency)

    write_data(old_data, new_data)
  end

  if g.transparency then
    g.transparency = false
    M.load_all_highlights()
    save_chadrc_data()
  else
    g.transparency = true
    M.load_all_highlights()
    save_chadrc_data()
  end
end

return M
