local status_ok, indent_blankline = pcall(require, "ibl")
if not status_ok then
  return
end

indent_blankline.setup {
  indent = { char = "▏" },
  scope = { show_start = false, show_end = false },
  exclude = {
    buftypes = {
      "nofile",
      "terminal",
    },
    filetypes = {
      "help",
      "dashboard",
      "NvimTree",
      "packer",
    },
  }
}
