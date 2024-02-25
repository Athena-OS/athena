---Helper functions for colorizer to enable required parsers
--@module colorizer.matcher
local Trie = require "colorizer.trie"
local min, max = math.min, math.max

local color = require "colorizer.color"
local color_name_parser = color.name_parser
local rgba_hex_parser = color.rgba_hex_parser

local sass = require "colorizer.sass"
local sass_name_parser = sass.name_parser

local B_HASH, DOLLAR_HASH = ("#"):byte(), ("$"):byte()

local parser = {
  ["_0x"] = color.argb_hex_parser,
  ["_rgb"] = color.rgb_function_parser,
  ["_rgba"] = color.rgba_function_parser,
  ["_hsl"] = color.hsl_function_parser,
  ["_hsla"] = color.hsla_function_parser,
}

local matcher = {}

---Form a trie stuct with the given prefixes
---@param matchers table: List of prefixes, {"rgb", "hsl"}
---@param matchers_trie table: Table containing information regarding non-trie based parsers
---@return function: function which will just parse the line for enabled parsers
function matcher.compile(matchers, matchers_trie)
  local trie = Trie(matchers_trie)

  local function parse_fn(line, i, buf)
    -- prefix #
    if matchers.rgba_hex_parser then
      if line:byte(i) == B_HASH then
        return rgba_hex_parser(line, i, matchers.rgba_hex_parser)
      end
    end

    -- prefix $, SASS Colour names
    if matchers.sass_name_parser then
      if line:byte(i) == DOLLAR_HASH then
        return sass_name_parser(line, i, buf)
      end
    end

    -- Prefix 0x, rgba, rgb, hsla, hsl
    local prefix = trie:longest_prefix(line, i)
    if prefix then
      local fn = "_" .. prefix
      if parser[fn] then
        return parser[fn](line, i, matchers[fn])
      end
    end

    -- Colour names
    if matchers.color_name_parser then
      return color_name_parser(line, i, matchers.color_name_parser)
    end
  end
  return parse_fn
end

local MATCHER_CACHE = {}
---Parse the given options and return a function with enabled parsers.
--if no parsers enabled then return false
--Do not try make the function again if it is present in the cache
---@param options table: options created in `colorizer.setup`
---@return function|boolean: function which will just parse the line for enabled parsers
function matcher.make(options)
  local enable_names = options.css or options.names
  local enable_sass = options.sass and options.sass.enable
  local enable_tailwind = options.tailwind
  local enable_RGB = options.css or options.RGB
  local enable_RRGGBB = options.css or options.RRGGBB
  local enable_RRGGBBAA = options.css or options.RRGGBBAA
  local enable_AARRGGBB = options.AARRGGBB
  local enable_rgb = options.css or options.css_fns or options.rgb_fn
  local enable_hsl = options.css or options.css_fns or options.hsl_fn

  local matcher_key = 0
    + (enable_names and 1 or 0)
    + (enable_RGB and 1 or 1)
    + (enable_RRGGBB and 1 or 2)
    + (enable_RRGGBBAA and 1 or 3)
    + (enable_AARRGGBB and 1 or 4)
    + (enable_rgb and 1 or 5)
    + (enable_hsl and 1 or 6)
    + ((enable_tailwind == true or enable_tailwind == "normal") and 1 or 7)
    + (enable_tailwind == "lsp" and 1 or 8)
    + (enable_tailwind == "both" and 1 or 9)
    + (enable_sass and 1 or 10)

  if matcher_key == 0 then
    return false
  end

  local loop_parse_fn = MATCHER_CACHE[matcher_key]
  if loop_parse_fn then
    return loop_parse_fn
  end

  local matchers = {}
  local matchers_prefix = {}
  matchers.max_prefix_length = 0

  if enable_names then
    matchers.color_name_parser = { tailwind = options.tailwind }
  end

  if enable_sass then
    matchers.sass_name_parser = true
  end

  local valid_lengths = { [3] = enable_RGB, [6] = enable_RRGGBB, [8] = enable_RRGGBBAA }
  local minlen, maxlen
  for k, v in pairs(valid_lengths) do
    if v then
      minlen = minlen and min(k, minlen) or k
      maxlen = maxlen and max(k, maxlen) or k
    end
  end

  if minlen then
    matchers.rgba_hex_parser = {}
    matchers.rgba_hex_parser.valid_lengths = valid_lengths
    matchers.rgba_hex_parser.maxlen = maxlen
    matchers.rgba_hex_parser.minlen = minlen
  end

  if enable_AARRGGBB then
    table.insert(matchers_prefix, "0x")
  end

  if enable_rgb and enable_hsl then
    table.insert(matchers_prefix, "hsla")
    table.insert(matchers_prefix, "rgba")
    table.insert(matchers_prefix, "rgb")
    table.insert(matchers_prefix, "hsl")
  elseif enable_rgb then
    table.insert(matchers_prefix, "rgba")
    table.insert(matchers_prefix, "rgb")
  elseif enable_hsl then
    table.insert(matchers_prefix, "hsla")
    table.insert(matchers_prefix, "hsl")
  end

  loop_parse_fn = matcher.compile(matchers, matchers_prefix)
  MATCHER_CACHE[matcher_key] = loop_parse_fn

  return loop_parse_fn
end

return matcher
