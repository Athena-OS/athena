if vim.g.loaded_colorizer then
  return
end

local command = vim.api.nvim_create_user_command

command("ColorizerAttachToBuffer", function()
  require("colorizer").attach_to_buffer(0)
end, {})

-- Stop highlighting the current buffer (detach).
command("ColorizerDetachFromBuffer", function()
  require("colorizer").detach_from_buffer(0)
end, {})

command("ColorizerReloadAllBuffers", function()
  require("colorizer").reload_all_buffers()
end, {})

command("ColorizerToggle", function()
  local c = require "colorizer"
  if c.is_buffer_attached(0) then
    c.detach_from_buffer(0)
  else
    c.attach_to_buffer(0)
  end
end, {})

vim.g.loaded_colorizer = true
