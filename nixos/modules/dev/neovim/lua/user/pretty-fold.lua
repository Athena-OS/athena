local status_ok, prettyfold = pcall(require, "pretty-fold")
if not status_ok then
  return
end

prettyfold.setup {
  keep_indentation = true,
  fill_char = ' ',
  sections = {
    left = {
      '+', function() return string.rep('-', vim.v.foldlevel) end,
      ' ', 'number_of_folded_lines', ':', 'content',
    }
  }
}
