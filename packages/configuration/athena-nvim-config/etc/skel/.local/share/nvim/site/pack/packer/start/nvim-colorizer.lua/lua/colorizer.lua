--- Requires Neovim >= 0.7.0 and `set termguicolors`
--
--Highlights terminal CSI ANSI color codes.
-- @module colorizer
-- @author Ashkan Kiani <from-nvim-colorizer.lua@kiani.io>
-- @usage Establish the autocmd to highlight all filetypes.
--
--       `lua require 'colorizer'.setup()`
--
-- Highlight using all css highlight modes in every filetype
--
--       `lua require 'colorizer'.setup(user_default_options = { css = true; })`
--
--==============================================================================
--USE WITH COMMANDS                                          *colorizer-commands*
--
--   *:ColorizerAttachToBuffer*
--
--       Attach to the current buffer and start highlighting with the settings as
--       specified in setup (or the defaults).
--
--       If the buffer was already attached(i.e. being highlighted), the
--       settings will be reloaded with the ones from setup.
--       This is useful for reloading settings for just one buffer.
--
--   *:ColorizerDetachFromBuffer*
--
--       Stop highlighting the current buffer (detach).
--
--   *:ColorizerReloadAllBuffers*
--
--       Reload all buffers that are being highlighted currently.
--       Shortcut for ColorizerAttachToBuffer on every buffer.
--
--   *:ColorizerToggle*
--       Toggle highlighting of the current buffer.
--
--USE WITH LUA
--
--       All options that can be passed to user_default_options in `setup`
--       can be passed here. Can be empty too.
--       `0` is the buffer number here
--
--       Attach to current buffer <pre>
--           require("colorizer").attach_to_buffer(0, {
--             mode = "background",
--             css = false,
--           })
--</pre>
--       Detach from buffer <pre>
--           require("colorizer").detach_from_buffer(0, {
--             mode = "background",
--             css = false,
--           })
--</pre>
-- @see colorizer.setup
-- @see colorizer.attach_to_buffer
-- @see colorizer.detach_from_buffer

local buffer_utils = require "colorizer.buffer"
local clear_hl_cache = buffer_utils.clear_hl_cache
local rehighlight_buffer = buffer_utils.rehighlight

local utils = require "colorizer.utils"
local merge = utils.merge

local api = vim.api
local augroup = api.nvim_create_augroup
local autocmd = api.nvim_create_autocmd
local buf_get_option = api.nvim_buf_get_option
local clear_namespace = api.nvim_buf_clear_namespace
local current_buf = api.nvim_get_current_buf

local colorizer = {}

---Default namespace used in `colorizer.buffer.highlight` and `attach_to_buffer`.
-- @see colorizer.buffer.highlight
-- @see attach_to_buffer
colorizer.DEFAULT_NAMESPACE = buffer_utils.default_namespace

---Highlight the buffer region
---@function highlight_buffer
-- @see colorizer.buffer.highlight
colorizer.highlight_buffer = buffer_utils.highlight

-- USER FACING FUNCTIONALITY --
local AUGROUP_ID
local AUGROUP_NAME = "ColorizerSetup"
-- buffer specific options given in setup
local BUFFER_OPTIONS = {}
-- buffer local options created after setup
local BUFFER_LOCAL = {}

---defaults options.
--<pre>
--  user_default_options = {
--      RGB = true, -- #RGB hex codes
--      RRGGBB = true, -- #RRGGBB hex codes
--      names = true, -- "Name" codes like Blue or blue
--      RRGGBBAA = false, -- #RRGGBBAA hex codes
--      AARRGGBB = false, -- 0xAARRGGBB hex codes
--      rgb_fn = false, -- CSS rgb() and rgba() functions
--      hsl_fn = false, -- CSS hsl() and hsla() functions
--      css = false, -- Enable all CSS features: rgb_fn, hsl_fn, names, RGB, RRGGBB
--      css_fn = false, -- Enable all CSS *functions*: rgb_fn, hsl_fn
--      -- Available modes for `mode`: foreground, background,  virtualtext
--      mode = "background", -- Set the display mode.
--      -- Available methods are false / true / "normal" / "lsp" / "both"
--      -- True is same as normal
--      tailwind = false, -- Enable tailwind colors
--      -- parsers can contain values used in |user_default_options|
--      sass = { enable = false, parsers = { css }, }, -- Enable sass colors
--      virtualtext = "■",
--  }
--</pre>
---@table user_default_options
--@field RGB boolean
--@field RRGGBB boolean
--@field names boolean
--@field RRGGBBAA boolean
--@field AARRGGBB boolean
--@field rgb_fn boolean
--@field hsl_fn boolean
--@field css boolean
--@field css_fn boolean
--@field mode string
--@field tailwind boolean|string
--@field sass table
--@field virtualtext string
local USER_DEFAULT_OPTIONS = {
  RGB = true,
  RRGGBB = true,
  names = true,
  RRGGBBAA = false,
  AARRGGBB = false,
  rgb_fn = false,
  hsl_fn = false,
  css = false,
  css_fn = false,
  mode = "background",
  tailwind = false,
  sass = { enable = false, parsers = { css = true } },
  virtualtext = "■",
}

local OPTIONS = { buf = {}, file = {} }
local SETUP_SETTINGS = {
  exclusions = { buf = {}, file = {} },
  all = { file = false, buf = false },
  default_options = USER_DEFAULT_OPTIONS,
}

--- Make new buffer Configuration
---@param buf number: buffer number
---@param typ string|nil: "buf" or "file" - The type of buffer option
---@return table
local function new_buffer_options(buf, typ)
  local value
  if typ == "buf" then
    value = buf_get_option(buf, "buftype")
  else
    value = buf_get_option(buf, "filetype")
  end
  return OPTIONS.file[value] or SETUP_SETTINGS.default_options
end

--- Check if attached to a buffer.
---@param buf number|nil: A value of 0 implies the current buffer.
---@return number|nil: if attached to the buffer, false otherwise.
---@see colorizer.buffer.highlight
function colorizer.is_buffer_attached(buf)
  if buf == 0 or buf == nil then
    buf = current_buf()
  else
    if not api.nvim_buf_is_valid(buf) then
      BUFFER_LOCAL[buf], BUFFER_OPTIONS[buf] = nil, nil
      return
    end
  end

  local au = api.nvim_get_autocmds {
    group = AUGROUP_ID,
    event = { "WinScrolled", "TextChanged", "TextChangedI", "TextChangedP" },
    buffer = buf,
  }
  if not BUFFER_OPTIONS[buf] or vim.tbl_isempty(au) then
    return
  end

  return buf
end

--- Stop highlighting the current buffer.
---@param buf number|nil: buf A value of 0 or nil implies the current buffer.
---@param ns number|nil: ns the namespace id, if not given DEFAULT_NAMESPACE is used
function colorizer.detach_from_buffer(buf, ns)
  buf = colorizer.is_buffer_attached(buf)
  if not buf then
    return
  end

  clear_namespace(buf, ns or colorizer.DEFAULT_NAMESPACE, 0, -1)
  if BUFFER_LOCAL[buf] then
    for _, namespace in pairs(BUFFER_LOCAL[buf].__detach.ns) do
      clear_namespace(buf, namespace, 0, -1)
    end

    for _, f in pairs(BUFFER_LOCAL[buf].__detach.functions) do
      if type(f) == "function" then
        f(buf)
      end
    end

    for _, id in ipairs(BUFFER_LOCAL[buf].__autocmds or {}) do
      pcall(api.nvim_del_autocmd, id)
    end

    BUFFER_LOCAL[buf].__autocmds = nil
    BUFFER_LOCAL[buf].__detach = nil
  end
  -- because now the buffer is not visible, so delete its information
  BUFFER_OPTIONS[buf] = nil
end

---Attach to a buffer and continuously highlight changes.
---@param buf integer: A value of 0 implies the current buffer.
---@param options table|nil: Configuration options as described in `setup`
---@param typ string|nil: "buf" or "file" - The type of buffer option
function colorizer.attach_to_buffer(buf, options, typ)
  if buf == 0 or buf == nil then
    buf = current_buf()
  else
    if not api.nvim_buf_is_valid(buf) then
      BUFFER_LOCAL[buf], BUFFER_OPTIONS[buf] = nil, nil
      return
    end
  end

  -- if the buffer is already attached then grab those options
  if not options then
    options = colorizer.get_buffer_options(buf)
  end

  -- if not make new options
  if not options then
    options = new_buffer_options(buf, typ)
  end

  if not buffer_utils.highlight_mode_names[options.mode] then
    if options.mode ~= nil then
      local mode = options.mode
      vim.defer_fn(function()
        -- just notify the user once
        vim.notify_once(string.format("Warning: Invalid mode given to colorizer setup [ %s ]", mode))
      end, 0)
    end
    options.mode = "background"
  end

  BUFFER_OPTIONS[buf] = options

  BUFFER_LOCAL[buf] = BUFFER_LOCAL[buf] or {}
  local highlighted, returns = rehighlight_buffer(buf, options)

  if not highlighted then
    return
  end

  BUFFER_LOCAL[buf].__detach = BUFFER_LOCAL[buf].__detach or returns.detach

  BUFFER_LOCAL[buf].__init = true

  if BUFFER_LOCAL[buf].__autocmds then
    return
  end

  local autocmds = {}
  local au_group_id = AUGROUP_ID

  local text_changed_au = { "TextChanged", "TextChangedI", "TextChangedP" }
  -- only enable InsertLeave in sass, rest don't require it
  if options.sass and options.sass.enable then
    table.insert(text_changed_au, "InsertLeave")
  end

  autocmds[#autocmds + 1] = autocmd(text_changed_au, {
    group = au_group_id,
    buffer = buf,
    callback = function(args)
      -- only reload if it was not disabled using detach_from_buffer
      if BUFFER_OPTIONS[buf] then
        BUFFER_LOCAL[buf].__event = args.event
        if args.event == "TextChanged" or args.event == "InsertLeave" then
          rehighlight_buffer(buf, options, BUFFER_LOCAL[buf])
        else
          local pos = vim.fn.getpos "."
          BUFFER_LOCAL[buf].__startline = pos[2] - 1
          BUFFER_LOCAL[buf].__endline = pos[2]
          rehighlight_buffer(buf, options, BUFFER_LOCAL[buf], true)
        end
      end
    end,
  })

  autocmds[#autocmds + 1] = autocmd({ "WinScrolled" }, {
    group = au_group_id,
    buffer = buf,
    callback = function(args)
      -- only reload if it was not disabled using detach_from_buffer
      if BUFFER_OPTIONS[buf] then
        BUFFER_LOCAL[buf].__event = args.event
        rehighlight_buffer(buf, options, BUFFER_LOCAL[buf])
      end
    end,
  })

  autocmd({ "BufUnload", "BufDelete" }, {
    group = au_group_id,
    buffer = buf,
    callback = function()
      if BUFFER_OPTIONS[buf] then
        colorizer.detach_from_buffer(buf)
      end
      BUFFER_LOCAL[buf].__init = nil
    end,
  })

  BUFFER_LOCAL[buf].__autocmds = autocmds
  BUFFER_LOCAL[buf].__augroup_id = au_group_id
end

---Easy to use function if you want the full setup without fine grained control.
--Setup an autocmd which enables colorizing for the filetypes and options specified.
--
--By default highlights all FileTypes.
--
--Example config:~
--<pre>
--  { filetypes = { "css", "html" }, user_default_options = { names = true } }
--</pre>
--Setup with all the default options:~
--<pre>
--    require("colorizer").setup {
--      filetypes = { "*" },
--      user_default_options,
--      -- all the sub-options of filetypes apply to buftypes
--      buftypes = {},
--    }
--</pre>
--For all user_default_options, see |user_default_options|
---@param config table: Config containing above parameters.
---@usage `require'colorizer'.setup()`
function colorizer.setup(config)
  if not vim.opt.termguicolors then
    vim.schedule(function()
      vim.notify("Colorizer: Error: &termguicolors must be set", "Error")
    end)
    return
  end

  local conf = vim.deepcopy(config) or {}

  -- if nothing given the enable for all filetypes
  local filetypes = conf.filetypes or conf[1] or { "*" }
  local user_default_options = conf.user_default_options or conf[2] or {}
  local buftypes = conf.buftypes or conf[3] or nil

  OPTIONS = { buf = {}, file = {} }
  SETUP_SETTINGS = {
    exclusions = { buf = {}, file = {} },
    all = { file = false, buf = false },
    default_options = merge(USER_DEFAULT_OPTIONS, user_default_options),
  }
  BUFFER_OPTIONS, BUFFER_LOCAL = {}, {}

  local function COLORIZER_SETUP_HOOK(typ)
    local filetype = vim.bo.filetype
    local buftype = vim.bo.buftype
    local buf = current_buf()
    BUFFER_LOCAL[buf] = BUFFER_LOCAL[buf] or {}

    if SETUP_SETTINGS.exclusions.file[filetype] or SETUP_SETTINGS.exclusions.buf[buftype] then
      -- when a filetype is disabled but buftype is enabled, it can Attach in
      -- some cases, so manually detach
      if BUFFER_OPTIONS[buf] then
        colorizer.detach_from_buffer(buf)
      end
      BUFFER_LOCAL[buf].__init = nil
      return
    end

    local fopts, bopts, options = OPTIONS[typ][filetype], OPTIONS[typ][buftype], nil
    if typ == "file" then
      options = fopts
      -- if buffer and filetype options both are given, then prefer fileoptions
    elseif fopts and bopts then
      options = fopts
    else
      options = bopts
    end

    if not options and not SETUP_SETTINGS.all[typ] then
      return
    end

    options = options or SETUP_SETTINGS.default_options

    -- this should ideally be triggered one time per buffer
    -- but BufWinEnter also triggers for split formation
    -- but we don't want that so add a check using local buffer variable
    if not BUFFER_LOCAL[buf].__init then
      colorizer.attach_to_buffer(buf, options, typ)
    end
  end

  AUGROUP_ID = augroup(AUGROUP_NAME, {})

  local aucmd = { buf = "BufWinEnter", file = "FileType" }
  local function parse_opts(typ, tbl)
    if type(tbl) == "table" then
      local list = {}

      for k, v in pairs(tbl) do
        local value
        local options = SETUP_SETTINGS.default_options
        if type(k) == "string" then
          value = k
          if type(v) ~= "table" then
            vim.notify("colorizer: Invalid option type for " .. typ .. "type" .. value, "ErrorMsg")
          else
            options = merge(SETUP_SETTINGS.default_options, v)
          end
        else
          value = v
        end
        -- Exclude
        if value:sub(1, 1) == "!" then
          SETUP_SETTINGS.exclusions[typ][value:sub(2)] = true
        else
          OPTIONS[typ][value] = options
          if value == "*" then
            SETUP_SETTINGS.all[typ] = true
          else
            table.insert(list, value)
          end
        end
      end
      autocmd({ aucmd[typ] }, {
        group = AUGROUP_ID,
        pattern = typ == "file" and (SETUP_SETTINGS.all[typ] and "*" or list) or nil,
        callback = function()
          COLORIZER_SETUP_HOOK(typ)
        end,
      })
    elseif tbl then
      vim.notify_once(string.format("colorizer: Invalid type for %stypes %s", typ, vim.inspect(tbl)), "ErrorMsg")
    end
  end

  parse_opts("file", filetypes)
  parse_opts("buf", buftypes)

  autocmd("ColorScheme", {
    group = AUGROUP_ID,
    callback = function()
      require("colorizer").clear_highlight_cache()
    end,
  })
end

--- Return the currently active buffer options.
---@param buf number|nil: Buffer number
---@return table|nil
function colorizer.get_buffer_options(buf)
  local buffer = colorizer.is_buffer_attached(buf)
  if buffer then
    return BUFFER_OPTIONS[buffer]
  end
end

--- Reload all of the currently active highlighted buffers.
function colorizer.reload_all_buffers()
  for buf, _ in pairs(BUFFER_OPTIONS) do
    colorizer.attach_to_buffer(buf, colorizer.get_buffer_options(buf))
  end
end

--- Clear the highlight cache and reload all buffers.
function colorizer.clear_highlight_cache()
  clear_hl_cache()
  vim.schedule(colorizer.reload_all_buffers)
end

return colorizer
