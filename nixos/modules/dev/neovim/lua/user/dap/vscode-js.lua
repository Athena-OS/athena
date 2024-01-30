local dap_status_ok, dap = pcall(require, "dap")
if not dap_status_ok then
  return
end

dap.adapters["pwa-node"] = {
    type = "server",
    host = "localhost",
    port = "${port}",
    executable = {
        command = vim.fn.exepath "js-debug-adapter",
        args = { "${port}" },
    },
}

for _, language in ipairs({ "typescript", "javascript" }) do
  dap.configurations[language] = {
    {
      name = "Debug watch:node",
      request = "launch",
      runtimeArgs = {
        "watch:node"
      },
      runtimeExecutable = "yarn",
      skipFiles = {
        "<node_internals>/**"
      },
      type = "pwa-node",
      envFile = "${workspaceFolder}/.env.local",
      rootPath = "${workspaceFolder}",
      cwd = "${workspaceFolder}",
      console = "integratedTerminal",
      internalConsoleOptions = "neverOpen",
    },
  }
end
