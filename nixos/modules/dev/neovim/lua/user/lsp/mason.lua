local status_ok, mason = pcall(require, "mason")
if not status_ok then
  return
end

local mason_lspconfig_status_ok, mason_lspconfig = pcall(require, "mason-lspconfig")
if not mason_lspconfig_status_ok then
  return
end

local settings = {
  ui = {
    border = "rounded",
    icons = {
      package_installed = "◍",
      package_pending = "◍",
      package_uninstalled = "◍",
    },
  },
  log_level = vim.log.levels.INFO,
  max_concurrent_installers = 4,
  PATH = "append",
}

mason.setup(settings)
mason_lspconfig.setup {
  ensure_installed = { "lua_ls" }
}

local lspconfig_status_ok, lspconfig = pcall(require, "lspconfig")
if not lspconfig_status_ok then
  return
end

local opts = {
  on_attach = require("user.lsp.handlers").on_attach,
  capabilities = require("user.lsp.handlers").capabilities,
}

mason_lspconfig.setup_handlers({
  function(server_name) -- default handler (optional)
    lspconfig[server_name].setup(opts)
  end,
  ["lua_ls"] = function()
    local lua_ls = require("user.lsp.settings.lua_ls")
    opts = vim.tbl_deep_extend("force", lua_ls, opts)
    lspconfig.lua_ls.setup(opts)
  end,
  ["jsonls"] = function()
    local jsonls_opts = require("user.lsp.settings.jsonls")
    opts = vim.tbl_deep_extend("force", jsonls_opts, opts)
    lspconfig.jsonls.setup(opts)
  end,
  ["tsserver"] = function()
    local tsserver_opts = require("user.lsp.settings.tsserver")
    opts = vim.tbl_deep_extend("force",tsserver_opts, opts)
    lspconfig.tsserver.setup(opts)
  end,
  ["eslint"] = function()
    local eslint_opts = require("user.lsp.settings.eslint")
    opts = vim.tbl_deep_extend("force",eslint_opts, opts)
    lspconfig.eslint.setup(opts)
  end,
})
