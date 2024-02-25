local Trie = require "colorizer.trie"
local color_map = vim.api.nvim_get_color_map

local function print_color_trie()
  local tohex = bit.tohex
  local min, max = math.min, math.max

  local COLOR_NAME_SETTINGS = {
    lowercase = false,
    strip_digits = true,
  }
  local COLOR_MAP = {}
  local COLOR_TRIE = Trie()
  for k, v in pairs(color_map()) do
    if not (COLOR_NAME_SETTINGS.strip_digits and k:match "%d+$") then
      COLOR_NAME_MINLEN = COLOR_NAME_MINLEN and min(#k, COLOR_NAME_MINLEN) or #k
      COLOR_NAME_MAXLEN = COLOR_NAME_MAXLEN and max(#k, COLOR_NAME_MAXLEN) or #k
      COLOR_MAP[k] = tohex(v, 6)
      COLOR_TRIE:insert(k)
      if COLOR_NAME_SETTINGS.lowercase then
        local lowercase = k:lower()
        COLOR_MAP[lowercase] = tohex(v, 6)
        COLOR_TRIE:insert(lowercase)
      end
    end
  end
  print(COLOR_TRIE)
end

local trie = Trie {
  "cat",
  "car",
  "celtic",
  "carb",
  "carb0",
  "CART0",
  "CaRT0",
  "Cart0",
  "931",
  "191",
  "121",
  "cardio",
  "call",
  "calcium",
  "calciur",
  "carry",
  "dog",
  "catdog",
}

print(trie)
print("catdo", trie:longest_prefix "catdo")
print("catastrophic", trie:longest_prefix "catastrophic")
