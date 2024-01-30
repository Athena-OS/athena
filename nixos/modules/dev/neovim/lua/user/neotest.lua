local status_ok, neotest = pcall(require, "neotest")
if not status_ok then
  return
end

neotest.setup({
  discovery = {
    enabled = false,
  },
  quickfix = {
    enabled = true,
    open = false,
  },
  adapters = {
    require('neotest-jest')({}),
  },
  summary = {
    open = "topleft vsplit | vertical resize 50"
  }
})
