local cmp = require('cmp')

local source = {}

source.new = function()
  local self = setmetatable({}, { __index = source })
  self.regex = vim.regex([[\%(\.\|\w\)\+\ze\.\w*$]])
  return self
end

source.is_available = function()
  return vim.bo.filetype == 'lua'
end

source.get_keyword_pattern = function()
  return [[\w\+]]
end

source.get_trigger_characters = function()
  return { '.' }
end

source.complete = function(self, request, callback)
  local s, e = self.regex:match_str(request.context.cursor_before_line)
  if not s then
    return callback()
  end
  callback({
    items = self:items(string.sub(request.context.cursor_before_line, s + 1, e)),
  })
end

source.items = function(self, path)
  local target = _G
  local target_keys = vim.tbl_keys(_G)
  for _, name in ipairs(vim.split(path, '.', true)) do
    if vim.tbl_contains(target_keys, name) and type(target[name]) == 'table' then
      target = target[name]
      target_keys = vim.tbl_keys(target)
    elseif name ~= '' then
      return {}
    end
  end

  local candidates = {}
  for _, key in ipairs(target_keys) do
    if string.match(key, '^%a[%a_]*$') then
      table.insert(candidates, self:item(key, target[key]))
    end
  end
  for _, key in ipairs(target_keys) do
    if not string.match(key, '^%a[%a_]*$') then
      table.insert(candidates, self:item(key, target[key]))
    end
  end

  return candidates
end

source.item = function(_, key, value)
  key = tostring(key)

  local kind = cmp.lsp.CompletionItemKind.Field
  local t = type(value)
  if t == 'function' then
    kind = cmp.lsp.CompletionItemKind.Function
  elseif t == 'table' then
    kind = cmp.lsp.CompletionItemKind.Struct
  elseif t == 'string' then
    kind = cmp.lsp.CompletionItemKind.Value
  elseif t == 'boolean' then
    kind = cmp.lsp.CompletionItemKind.Value
  elseif t == 'number' then
    kind = cmp.lsp.CompletionItemKind.Value
  elseif t == 'nil' then
    kind = cmp.lsp.CompletionItemKind.Value
  end
  return {
    label = key,
    kind = kind,
    detail = t,
  }
end

return source
