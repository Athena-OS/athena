---Helper utils
--@module colorizer.utils
local bit, ffi = require "bit", require "ffi"
local band, bor, rshift, lshift = bit.band, bit.bor, bit.rshift, bit.lshift

local uv = vim.loop

local utils = {}

-- -- TODO use rgb as the return value from the matcher functions
-- -- instead of the rgb_hex. Can be the highlight key as well
-- -- when you shift it left 8 bits. Use the lower 8 bits for
-- -- indicating which highlight mode to use.
-- ffi.cdef [[
-- typedef struct { uint8_t r, g, b; } colorizer_rgb;
-- ]]
-- local rgb_t = ffi.typeof 'colorizer_rgb'

-- Create a lookup table where the bottom 4 bits are used to indicate the
-- category and the top 4 bits are the hex value of the ASCII byte.
local BYTE_CATEGORY = ffi.new "uint8_t[256]"
local CATEGORY_DIGIT = lshift(1, 0)
local CATEGORY_ALPHA = lshift(1, 1)
local CATEGORY_HEX = lshift(1, 2)
local CATEGORY_ALPHANUM = bor(CATEGORY_ALPHA, CATEGORY_DIGIT)

do
  -- do not run the loop multiple times
  local b = string.byte
  local byte_values = { ["0"] = b "0", ["9"] = b "9", ["a"] = b "a", ["f"] = b "f", ["z"] = b "z" }

  for i = 0, 255 do
    local v = 0
    local lowercase = bor(i, 0x20)
    -- Digit is bit 1
    if i >= byte_values["0"] and i <= byte_values["9"] then
      v = bor(v, lshift(1, 0))
      v = bor(v, lshift(1, 2))
      v = bor(v, lshift(i - byte_values["0"], 4))
    elseif lowercase >= byte_values["a"] and lowercase <= byte_values["z"] then
      -- Alpha is bit 2
      v = bor(v, lshift(1, 1))
      if lowercase <= byte_values["f"] then
        v = bor(v, lshift(1, 2))
        v = bor(v, lshift(lowercase - byte_values["a"] + 10, 4))
      end
    end
    BYTE_CATEGORY[i] = v
  end
end

---Obvious.
---@param byte number
---@return boolean
function utils.byte_is_alphanumeric(byte)
  local category = BYTE_CATEGORY[byte]
  return band(category, CATEGORY_ALPHANUM) ~= 0
end

---Obvious.
---@param byte number
---@return boolean
function utils.byte_is_hex(byte)
  return band(BYTE_CATEGORY[byte], CATEGORY_HEX) ~= 0
end

---Valid colorchars are alphanumeric and - ( tailwind colors )
---@param byte number
---@return boolean
function utils.byte_is_valid_colorchar(byte)
  return utils.byte_is_alphanumeric(byte) or byte == ("-"):byte()
end

--- Get last modified time of a file
---@param path string: file path
---@return number|nil: modified time
function utils.get_last_modified(path)
  local fd = uv.fs_open(path, "r", 438)
  if not fd then
    return
  end

  local stat = uv.fs_fstat(fd)
  uv.fs_close(fd)
  if stat then
    return stat.mtime.nsec
  else
    return
  end
end

---Merge two tables.
--
-- todo: Remove this and use `vim.tbl_deep_extend`
---@return table
function utils.merge(...)
  local res = {}
  for i = 1, select("#", ...) do
    local o = select(i, ...)
    if type(o) ~= "table" then
      return {}
    end
    for k, v in pairs(o) do
      res[k] = v
    end
  end
  return res
end

--- Obvious.
---@param byte number
---@return number
function utils.parse_hex(byte)
  return rshift(BYTE_CATEGORY[byte], 4)
end

local b_percent = string.byte "%"
--- Obvious.
---@param v string
---@return number|nil
function utils.percent_or_hex(v)
  if v:byte(-1) == b_percent then
    return tonumber(v:sub(1, -2)) / 100 * 255
  end
  local x = tonumber(v)
  if x > 255 then
    return
  end
  return x
end

--- Watch a file for changes and execute callback
---@param path string: File path
---@param callback function: Callback to execute
---@param ... array: params for callback
---@return function|nil
function utils.watch_file(path, callback, ...)
  if not path or type(callback) ~= "function" then
    return
  end

  local fullpath = uv.fs_realpath(path)
  if not fullpath then
    return
  end

  local start
  local args = { ... }

  local handle = uv.new_fs_event()
  local function on_change(err, filename, _)
    -- Do work...
    callback(filename, unpack(args))
    -- Debounce: stop/start.
    handle:stop()
    if not err or not utils.get_last_modified(filename) then
      start()
    end
  end

  function start()
    uv.fs_event_start(
      handle,
      fullpath,
      {},
      vim.schedule_wrap(function(...)
        on_change(...)
      end)
    )
  end

  start()
  return handle
end

return utils
