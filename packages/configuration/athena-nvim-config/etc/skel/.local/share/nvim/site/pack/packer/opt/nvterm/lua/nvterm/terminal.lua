local util = require "nvterm.termutil"
local a = vim.api
local nvterm = {}
local terminals = {}

local function get_last(list)
  if list then
    return not vim.tbl_isempty(list) and list[#list] or nil
  end
  return terminals[#terminals] or nil
end

local function get_type(type, list)
  list = list or terminals.list
  return vim.tbl_filter(function(t)
    return t.type == type
  end, list)
end

local function get_still_open()
  if not terminals.list then
    return {}
  end
  return #terminals.list > 0 and vim.tbl_filter(function(t)
    return t.open == true
  end, terminals.list) or {}
end

local function get_last_still_open()
  return get_last(get_still_open())
end

local function get_type_last(type)
  return get_last(get_type(type))
end

local function get_term(key, value)
  -- assumed to be unique, will only return 1 term regardless
  return vim.tbl_filter(function(t)
    return t[key] == value
  end, terminals.list)[1]
end

local create_term_window = function(type)
  local existing = terminals.list and #get_type(type, get_still_open()) > 0
  util.execute_type_cmd(type, terminals, existing)
  vim.wo.relativenumber = false
  vim.wo.number = false
  return a.nvim_get_current_win()
end

local ensure_and_send = function(cmd, type)
  terminals = util.verify_terminals(terminals)
  local function select_term()
    if not type then
      return get_last_still_open() or nvterm.new "horizontal"
    else
      return get_type_last(type) or nvterm.new(type)
    end
  end
  local term = select_term()
  a.nvim_chan_send(term.job_id, cmd .. "\n")
end

local call_and_restore = function(fn, opts)
  local current_win = a.nvim_get_current_win()
  local mode = a.nvim_get_mode().mode == "i" and "startinsert" or "stopinsert"

  fn(unpack(opts))
  a.nvim_set_current_win(current_win)

  vim.cmd(mode)
end

nvterm.send = function(cmd, type)
  if not cmd then
    return
  end
  call_and_restore(ensure_and_send, { cmd, type })
end

nvterm.hide_term = function(term)
  terminals.list[term.id].open = false
  a.nvim_win_close(term.win, false)
end

nvterm.show_term = function(term)
  term.win = create_term_window(term.type)
  a.nvim_win_set_buf(term.win, term.buf)
  terminals.list[term.id].open = true
  vim.cmd "startinsert"
end

nvterm.get_and_show = function(key, value)
  local term = get_term(key, value)
  nvterm.show_term(term)
end

nvterm.get_and_hide = function(key, value)
  local term = get_term(key, value)
  nvterm.hide_term(term)
end

nvterm.hide = function(type)
  local term = type and get_type_last(type) or get_last()
  nvterm.hide_term(term)
end

nvterm.show = function(type)
  terminals = util.verify_terminals(terminals)
  local term = type and get_type_last(type) or terminals.last
  nvterm.show_term(term)
end

nvterm.new = function(type, shell_override)
  local win = create_term_window(type)
  local buf = a.nvim_create_buf(false, true)
  a.nvim_buf_set_option(buf, "filetype", "terminal")
  a.nvim_buf_set_option(buf, "buflisted", false)
  a.nvim_win_set_buf(win, buf)

  local job_id = vim.fn.termopen(terminals.shell or shell_override or vim.o.shell)
  local id = #terminals.list + 1
  local term = { id = id, win = win, buf = buf, open = true, type = type, job_id = job_id }
  terminals.list[id] = term
  vim.cmd "startinsert"
  return term
end

nvterm.toggle = function(type)
  terminals = util.verify_terminals(terminals)
  local term = get_type_last(type)

  if not term then
    term = nvterm.new(type)
  elseif term.open then
    nvterm.hide_term(term)
  else
    nvterm.show_term(term)
  end
end

nvterm.toggle_all_terms = function()
  terminals = util.verify_terminals(terminals)

  for _, term in ipairs(terminals.list) do
    if term.open then
      nvterm.hide_term(term)
    else
      nvterm.show_term(term)
    end
  end
end


nvterm.close_all_terms = function()
  for _, buf in ipairs(nvterm.list_active_terms "buf") do
    vim.cmd("bd! " .. tostring(buf))
  end
end

nvterm.list_active_terms = function(property)
  local terms = get_still_open()
  if property then
    return vim.tbl_map(function(t)
      return t[property]
    end, terms)
  end
  return terms
end

nvterm.list_terms = function()
  return terminals.list
end

nvterm.init = function(term_config)
  terminals = term_config
end

return nvterm
