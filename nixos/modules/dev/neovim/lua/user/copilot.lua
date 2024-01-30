local status_ok, copilot = pcall(require, "copilot")
if not status_ok then
  return
end

copilot.setup {
  method = "getCompletionsCycling",
  cmp = { enabled = true },
  suggestion = { enabled = false },
  panel = { enabled = false },
  ft_disable = { "markdown" },
}
