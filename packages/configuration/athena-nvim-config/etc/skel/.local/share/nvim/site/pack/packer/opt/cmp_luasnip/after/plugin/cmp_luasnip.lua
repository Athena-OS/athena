require("cmp").register_source("luasnip", require("cmp_luasnip").new())

local cmp_luasnip = vim.api.nvim_create_augroup("cmp_luasnip", {})

vim.api.nvim_create_autocmd("User", {
  pattern = "LuasnipCleanup",
  callback = function ()
    require("cmp_luasnip").clear_cache()
  end,
  group = cmp_luasnip
})

vim.api.nvim_create_autocmd("User", {
  pattern = "LuasnipSnippetsAdded",
  callback = function ()
    require("cmp_luasnip").refresh()
  end,
  group = cmp_luasnip
})
