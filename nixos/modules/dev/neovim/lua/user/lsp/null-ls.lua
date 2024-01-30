local null_ls_status_ok, null_ls = pcall(require, "null-ls")
if not null_ls_status_ok then
  return
end

local formatting = null_ls.builtins.formatting
local organize_import_action = {
  method = null_ls.methods.CODE_ACTION,
  filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
  generator = {
    fn = function(_)
      return {
        {
          title = "Organize imports",
          action = function()
            vim.cmd [[OrganizeImports]]
          end
        }
      }
    end
  }
}

null_ls.register(organize_import_action)

null_ls.setup({
  debug = false,
  sources = {
    formatting.prettier,
  },
})
