local status_ok, nvim_tree = pcall(require, "nvim-tree")
if not status_ok then
  return
end

local function on_attach(bufnr)
  local api = require('nvim-tree.api')

  local function opts(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, noremap = true, silent = true, nowait = true }
  end

  api.config.mappings.default_on_attach(bufnr);

  vim.keymap.set('n', 'e', '', { buffer = bufnr })
  vim.keymap.del('n', 'e', { buffer = bufnr })
  vim.keymap.set('n', '<S-r>', api.fs.rename_basename, opts('Rename: Basename'))
end

nvim_tree.setup {
  disable_netrw = true,
  hijack_netrw = true,
  update_cwd = true,
  update_focused_file = {
    enable = true,
    update_cwd = true,
    ignore_list = {}
  },
  trash = {
    cmd = "trash",
    require_confirm = true,
  },
  actions = {
    open_file = {
      resize_window = false,
    }
  },
  on_attach = on_attach,
  view = {
    adaptive_size = true,
  }
}

vim.api.nvim_create_autocmd('BufEnter', {
  command = "if winnr('$') == 1 && bufname() == 'NvimTree_' . tabpagenr() | quit | endif",
  nested = true,
})

local events, nvim_tree_events = pcall(require, "nvim-tree.events")
if not events then
  return
end

local bufferapi, bufferline_api = pcall(require, "bufferline.api")
if not bufferapi then
  return
end

local function get_tree_size()
  return require 'nvim-tree.view'.View.width
end

nvim_tree_events.subscribe('TreeOpen', function()
  bufferline_api.set_offset(get_tree_size() + 1)
end)

nvim_tree_events.subscribe('Resize', function()
  bufferline_api.set_offset(get_tree_size() + 1)
end)

nvim_tree_events.subscribe('TreeClose', function()
    -- if require("dap").session() then
    --     require("dapui").open({ reset = true })
    -- end
  bufferline_api.set_offset(0)
end)
