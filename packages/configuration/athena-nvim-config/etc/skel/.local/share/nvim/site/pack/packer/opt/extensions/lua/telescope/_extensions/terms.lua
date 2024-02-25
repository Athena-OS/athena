-- This file can be loaded as a telescope extension

-- Custom hidden terminal buffers picker
-- Most of the code is copied from telescope buffer builtin
-- Src: https://github.com/nvim-telescope/telescope.nvim/blob/master/lua/telescope/builtin/internal.lua
local function term_picker(opts)
  local pickers, finders, make_entry, actions, action_state, conf
  if pcall(require, "telescope") then
    pickers = require "telescope.pickers"
    finders = require "telescope.finders"

    make_entry = require "telescope.make_entry"
    actions = require "telescope.actions"
    action_state = require "telescope.actions.state"
    conf = require("telescope.config").values
  else
    error "Cannot find telescope!"
  end

  local filter = vim.tbl_filter

  local bufnrs = filter(function(b)
    local _, present_type = pcall(function()
      return vim.api.nvim_buf_call(b, function()
        return vim.bo.buftype == "terminal"
      end)
    end)

    if not present_type then
      -- let's only terms that we created
      return false
    end

    -- if 1 ~= vim.fn.buflisted(b) then
    --    return false
    -- end
    -- only hide unloaded buffers if opts.show_all_buffers is false, keep them listed if true or nil
    if opts.show_all_buffers == false and not vim.api.nvim_buf_is_loaded(b) then
      return false
    end
    if opts.ignore_current_buffer and b == vim.api.nvim_get_current_buf() then
      return false
    end
    return true
  end, vim.api.nvim_list_bufs())
  if not next(bufnrs) then
    vim.notify "No terminal buffer open."
    return
  end
  if opts.sort_mru then
    table.sort(bufnrs, function(a, b)
      return vim.fn.getbufinfo(a)[1].lastused > vim.fn.getbufinfo(b)[1].lastused
    end)
  end

  local buffers = {}
  local default_selection_idx = 1
  for _, bufnr in ipairs(bufnrs) do
    local flag = bufnr == vim.fn.bufnr "" and "%" or (bufnr == vim.fn.bufnr "#" and "#" or " ")

    if opts.sort_lastused and not opts.ignore_current_buffer and flag == "#" then
      default_selection_idx = 2
    end

    local element = {
      bufnr = bufnr,
      flag = flag,
      info = vim.fn.getbufinfo(bufnr)[1],
    }

    if opts.sort_lastused and (flag == "#" or flag == "%") then
      local idx = ((buffers[1] ~= nil and buffers[1].flag == "%") and 2 or 1)
      table.insert(buffers, idx, element)
    else
      table.insert(buffers, element)
    end
  end

  if not opts.bufnr_width then
    local max_bufnr = math.max(unpack(bufnrs))
    opts.bufnr_width = #tostring(max_bufnr)
  end

  pickers
    .new(opts, {
      prompt_title = "Terminal buffers",
      finder = finders.new_table {
        results = buffers,
        entry_maker = opts.entry_maker or make_entry.gen_from_buffer(opts),
      },
      previewer = conf.grep_previewer(opts),
      sorter = conf.generic_sorter(opts),
      default_selection_index = default_selection_idx,
      attach_mappings = function(prompt_bufnr)
        actions.select_default:replace(function()
          local entry = action_state.get_selected_entry()
          actions.close(prompt_bufnr)

          local buf = entry.bufnr
          local chad_term, type = pcall(function()
            return vim.api.nvim_buf_call(buf, function()
              return vim.bo.buftype == "terminal"
            end)
          end)

          -- TODO buffer checks/error detection (make sure we do get a buf)

          if chad_term then
            local term_plugin = require "nvterm.terminal"
            term_plugin.get_and_show("buf", buf)
          end
        end)

        return true
      end,
    })
    :find()
end

-- register term picker as terms to telescope
local present, telescope = pcall(require, "telescope")
if present then
  return telescope.register_extension {
    exports = {
      terms = term_picker,
    },
  }
else
  error "Cannot find telescope!"
end
