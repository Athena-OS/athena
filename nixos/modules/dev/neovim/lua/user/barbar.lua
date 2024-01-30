local status_ok, barbar = pcall(require, 'barbar')
if not status_ok then
  return
end

vim.g.barbar_auto_setup = false -- disable auto-setup
barbar.setup {
  exclude_ft = {'qf'}
}
