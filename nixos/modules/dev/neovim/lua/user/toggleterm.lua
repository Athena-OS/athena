local status_ok, toggleterm = pcall(require, "toggleterm")
if not status_ok then
  return
end

local function set_nvimtree_when_open_term(terminal)
  local nvimtree = require "nvim-tree"
  local nvimtree_view = require "nvim-tree.view"
  if nvimtree_view.is_visible() and terminal.direction == "horizontal" then
    local nvimtree_width = vim.fn.winwidth(nvimtree_view.get_winnr())
    nvimtree.toggle()
    nvimtree_view.View.width = nvimtree_width
    nvimtree.toggle(false, true)
  end
end

local opts = {
  size = 20,
  open_mapping = [[<c-\>]],
  shading_factor = 2,
  direction = "float",
  on_open = set_nvimtree_when_open_term,
  float_opts = {
    border = "curved",
    highlights = {
      border = "Normal",
      background = "Normal",
    },
  },
}

if (theme_name == 'rose-pine') then
  local highlights_ok, highlights = pcall(require, "rose-pine.plugins.toggleterm")
  if not highlights_ok then
    return
  end

  opts = vim.tbl_deep_extend("force", { highlights = highlights }, opts)
end

toggleterm.setup(opts)

local Terminal = require('toggleterm.terminal').Terminal
local lazygit = Terminal:new({
  cmd = "lazygit",
  hidden = true,
  direction = "float",
  float_opts = {
    border = "none",
    width = 100000,
    height = 100000,
  },
})

local floatTerminal = Terminal:new({
  hidden = true,
  direction = "float",
  float_opts = {
    border = "none",
    width = 100000,
    height = 100000,
  },
})

function LazygitToggle()
  lazygit:toggle()
end

function TerminalToggle()
  floatTerminal:toggle()
end
