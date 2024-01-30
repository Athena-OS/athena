local status_ok, lualine = pcall(require, "lualine")
if not status_ok then
  return
end

lualine.setup({
  extensions = { 'nvim-tree', 'toggleterm', 'nvim-dap-ui' },
  options = {
    theme = theme_name,
  },
})
