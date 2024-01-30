local status_ok, harpoon = pcall(require, "harpoon")
if not status_ok then
  return
end

harpoon:setup({
  settings = {
    ui_width_ratio = 0.3,
    save_on_toggle = true,
  }
})

vim.keymap.set("n", "<A-1>", function() harpoon:list():select(1) end)
vim.keymap.set("n", "<A-2>", function() harpoon:list():select(2) end)
vim.keymap.set("n", "<A-3>", function() harpoon:list():select(3) end)
vim.keymap.set("n", "<A-4>", function() harpoon:list():select(4) end)
vim.keymap.set("n", "<A-P>", function() harpoon:list():prev() end)
vim.keymap.set("n", "<A-p>", function() harpoon:list():next() end)
