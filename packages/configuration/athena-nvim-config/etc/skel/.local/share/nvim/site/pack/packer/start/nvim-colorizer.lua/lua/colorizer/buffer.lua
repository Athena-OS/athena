---Helper functions to highlight buffer smartly
--@module colorizer.buffer
local api = vim.api
local buf_set_virtual_text = api.nvim_buf_set_extmark
local buf_get_lines = api.nvim_buf_get_lines
local create_namespace = api.nvim_create_namespace
local clear_namespace = api.nvim_buf_clear_namespace
local set_highlight = api.nvim_set_hl

local color = require "colorizer.color"
local color_is_bright = color.is_bright

local make_matcher = require("colorizer.matcher").make

local sass = require "colorizer.sass"
local sass_update_variables = sass.update_variables
local sass_cleanup = sass.cleanup

local tailwind = require "colorizer.tailwind"
local tailwind_setup_lsp = tailwind.setup_lsp_colors
local tailwind_cleanup = tailwind.cleanup

local buffer = {}

local HIGHLIGHT_NAME_PREFIX = "colorizer"
local HIGHLIGHT_CACHE = {}

--- Default namespace used in `highlight` and `colorizer.attach_to_buffer`.
-- @see highlight
-- @see colorizer.attach_to_buffer
buffer.default_namespace = create_namespace "colorizer"

--- Highlight mode which will be use to render the colour
buffer.highlight_mode_names = {
  background = "mb",
  foreground = "mf",
  virtualtext = "mv",
}

--- Clean the highlight cache
function buffer.clear_hl_cache()
  HIGHLIGHT_CACHE = {}
end

--- Make a deterministic name for a highlight given these attributes
local function make_highlight_name(rgb, mode)
  return table.concat({ HIGHLIGHT_NAME_PREFIX, buffer.highlight_mode_names[mode], rgb }, "_")
end

local function create_highlight(rgb_hex, mode)
  mode = mode or "background"
  -- TODO validate rgb format?
  rgb_hex = rgb_hex:lower()
  local cache_key = table.concat({ buffer.highlight_mode_names[mode], rgb_hex }, "_")
  local highlight_name = HIGHLIGHT_CACHE[cache_key]

  -- Look up in our cache.
  if highlight_name then
    return highlight_name
  end

  -- convert from #fff to #ffffff
  if #rgb_hex == 3 then
    rgb_hex = table.concat {
      rgb_hex:sub(1, 1):rep(2),
      rgb_hex:sub(2, 2):rep(2),
      rgb_hex:sub(3, 3):rep(2),
    }
  end

  -- Create the highlight
  highlight_name = make_highlight_name(rgb_hex, mode)
  if mode == "foreground" then
    set_highlight(0, highlight_name, { fg = "#" .. rgb_hex })
  else
    local rr, gg, bb = rgb_hex:sub(1, 2), rgb_hex:sub(3, 4), rgb_hex:sub(5, 6)
    local r, g, b = tonumber(rr, 16), tonumber(gg, 16), tonumber(bb, 16)
    local fg_color
    if color_is_bright(r, g, b) then
      fg_color = "Black"
    else
      fg_color = "White"
    end
    set_highlight(0, highlight_name, { fg = fg_color, bg = "#" .. rgb_hex })
  end
  HIGHLIGHT_CACHE[cache_key] = highlight_name
  return highlight_name
end

--- Create highlight and set highlights
---@param buf number
---@param ns number
---@param line_start number
---@param line_end number
---@param data table: table output of `parse_lines`
---@param options table: Passed in setup, mainly for `user_default_options`
function buffer.add_highlight(buf, ns, line_start, line_end, data, options)
  clear_namespace(buf, ns, line_start, line_end)

  local mode = options.mode == "background" and "background" or "foreground"
  if vim.tbl_contains({ "foreground", "background" }, options.mode) then
    for linenr, hls in pairs(data) do
      for _, hl in ipairs(hls) do
        local hlname = create_highlight(hl.rgb_hex, mode)
        api.nvim_buf_add_highlight(buf, ns, hlname, linenr, hl.range[1], hl.range[2])
      end
    end
  elseif options.mode == "virtualtext" then
    for linenr, hls in pairs(data) do
      for _, hl in ipairs(hls) do
        local hlname = create_highlight(hl.rgb_hex, mode)
        buf_set_virtual_text(0, ns, linenr, hl.range[2], {
          end_col = hl.range[2],
          virt_text = { { options.virtualtext or "■", hlname } },
          hl_mode = "combine",
        })
      end
    end
  end
end

--- Highlight the buffer region.
-- Highlight starting from `line_start` (0-indexed) for each line described by `lines` in the
-- buffer `buf` and attach it to the namespace `ns`.
---@param buf number: buffer id
---@param ns number: The namespace id. Default is DEFAULT_NAMESPACE. Create it with `vim.api.nvim_create_namespace`
---@param line_start number: line_start should be 0-indexed
---@param line_end number: Last line to highlight
---@param options table: Configuration options as described in `setup`
---@param options_local table: Buffer local variables
---@return nil|boolean|number,table
function buffer.highlight(buf, ns, line_start, line_end, options, options_local)
  local returns = { detach = { ns = {}, functions = {} } }
  if buf == 0 or buf == nil then
    buf = api.nvim_get_current_buf()
  end

  local lines = buf_get_lines(buf, line_start, line_end, false)

  ns = ns or buffer.default_namespace

  -- only update sass varibles when text is changed
  if options_local.__event ~= "WinScrolled" and options.sass and options.sass.enable then
    table.insert(returns.detach.functions, sass_cleanup)
    sass_update_variables(buf, 0, -1, nil, make_matcher(options.sass.parsers or { css = true }), options, options_local)
  end

  local data = buffer.parse_lines(buf, lines, line_start, options) or {}
  buffer.add_highlight(buf, ns, line_start, line_end, data, options)

  if options.tailwind == "lsp" or options.tailwind == "both" then
    tailwind_setup_lsp(buf, options, options_local, buffer.add_highlight)
    table.insert(returns.detach.functions, tailwind_cleanup)
  end

  return true, returns
end

--- Parse the given lines for colors and return a table containing
-- rgb_hex and range per line
---@param buf number
---@param lines table
---@param line_start number: This is the buffer line number, from where to start highlighting
---@param options table: Passed in `colorizer.setup`, Only uses `user_default_options`
---@return table|nil
function buffer.parse_lines(buf, lines, line_start, options)
  local loop_parse_fn = make_matcher(options)
  if not loop_parse_fn then
    return
  end

  local data = {}
  for current_linenum, line in ipairs(lines) do
    current_linenum = current_linenum - 1 + line_start
    data[current_linenum] = data[current_linenum] or {}

    -- Upvalues are options and current_linenum
    local i = 1
    while i < #line do
      local length, rgb_hex = loop_parse_fn(line, i, buf)
      if length and rgb_hex then
        table.insert(data[current_linenum], { rgb_hex = rgb_hex, range = { i - 1, i + length - 1 } })
        i = i + length
      else
        i = i + 1
      end
    end
  end

  return data
end

-- gets used in rehighlight function only
local BUFFER_LINES = {}
-- get the amount lines to highlight
local function getrow(buf)
  if not BUFFER_LINES[buf] then
    BUFFER_LINES[buf] = {}
  end

  local a = api.nvim_buf_call(buf, function()
    return {
      vim.fn.line "w0",
      vim.fn.line "w$",
    }
  end)
  local min, max
  local new_min, new_max = a[1] - 1, a[2]
  local old_min, old_max = BUFFER_LINES[buf]["min"], BUFFER_LINES[buf]["max"]

  if old_min and old_max then
    -- Triggered for TextChanged autocmds
    -- TODO: Find a way to just apply highlight to changed text lines
    if (old_max == new_max) or (old_min == new_min) then
      min, max = new_min, new_max
    -- Triggered for WinScrolled autocmd - Scroll Down
    elseif old_max < new_max then
      min = old_max
      max = new_max
    -- Triggered for WinScrolled autocmd - Scroll Up
    elseif old_max > new_max then
      min = new_min
      max = new_min + (old_max - new_max)
    end
    -- just in case a long jump was made
    if max - min > new_max - new_min then
      min = new_min
      max = new_max
    end
  end
  min = min or new_min
  max = max or new_max
  -- store current window position to be used later to incremently highlight
  BUFFER_LINES[buf]["max"] = new_max
  BUFFER_LINES[buf]["min"] = new_min
  return min, max
end

--- Rehighlight the buffer if colorizer is active
---@param buf number: Buffer number
---@param options table: Buffer options
---@param options_local table|nil: Buffer local variables
---@param use_local_lines boolean|nil Whether to use lines num range from options_local
---@return nil|boolean|number,table
function buffer.rehighlight(buf, options, options_local, use_local_lines)
  if buf == 0 or buf == nil then
    buf = api.nvim_get_current_buf()
  end

  local ns = buffer.default_namespace

  local min, max
  if use_local_lines and options_local then
    min, max = options_local.__startline or 0, options_local.__endline or -1
  else
    min, max = getrow(buf)
  end

  local bool, returns = buffer.highlight(buf, ns, min, max, options, options_local or {})
  table.insert(returns.detach.functions, function()
    BUFFER_LINES[buf] = nil
  end)

  return bool, returns
end

return buffer
