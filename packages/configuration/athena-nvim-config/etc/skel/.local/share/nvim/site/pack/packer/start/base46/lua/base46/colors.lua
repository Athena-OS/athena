local M = {}

-- Convert a hex color value to RGB
-- @param hex: The hex color value
-- @return r: Red (0-255)
-- @return g: Green (0-255)
-- @return b: Blue (0-255)
M.hex2rgb = function(hex)
  local hash = string.sub(hex, 1, 1) == "#"
  if string.len(hex) ~= (7 - (hash and 0 or 1)) then
    return nil
  end

  local r = tonumber(hex:sub(2 - (hash and 0 or 1), 3 - (hash and 0 or 1)), 16)
  local g = tonumber(hex:sub(4 - (hash and 0 or 1), 5 - (hash and 0 or 1)), 16)
  local b = tonumber(hex:sub(6 - (hash and 0 or 1), 7 - (hash and 0 or 1)), 16)
  return r, g, b
end

-- Convert an RGB color value to hex
-- @param r: Red (0-255)
-- @param g: Green (0-255)
-- @param b: Blue (0-255)
-- @return The hexadecimal string representation of the color
M.rgb2hex = function(r, g, b)
  return string.format("#%02x%02x%02x", math.floor(r), math.floor(g), math.floor(b))
end

-- Helper function to convert a HSL color value to RGB
-- Not to be used directly, use M.hsl2rgb instead
M.hsl2rgb_helper = function(p, q, a)
  if a < 0 then
    a = a + 6
  end
  if a >= 6 then
    a = a - 6
  end
  if a < 1 then
    return (q - p) * a + p
  elseif a < 3 then
    return q
  elseif a < 4 then
    return (q - p) * (4 - a) + p
  else
    return p
  end
end

-- Convert a HSL color value to RGB
-- @param h: Hue (0-360)
-- @param s: Saturation (0-1)
-- @param l: Lightness (0-1)
-- @return r: Red (0-255)
-- @return g: Green (0-255)
-- @return b: Blue (0-255)
M.hsl2rgb = function(h, s, l)
  local t1, t2, r, g, b

  h = h / 60
  if l <= 0.5 then
    t2 = l * (s + 1)
  else
    t2 = l + s - (l * s)
  end

  t1 = l * 2 - t2
  r = M.hsl2rgb_helper(t1, t2, h + 2) * 255
  g = M.hsl2rgb_helper(t1, t2, h) * 255
  b = M.hsl2rgb_helper(t1, t2, h - 2) * 255

  return r, g, b
end

-- Convert an RGB color value to HSL
-- @param r Red (0-255)
-- @param g Green (0-255)
-- @param b Blue (0-255)
-- @return h Hue (0-360)
-- @return s Saturation (0-1)
-- @return l Lightness (0-1)
M.rgb2hsl = function(r, g, b)
  local min, max, l, s, maxcolor, h
  r, g, b = r / 255, g / 255, b / 255

  min = math.min(r, g, b)
  max = math.max(r, g, b)
  maxcolor = 1 + (max == b and 2 or (max == g and 1 or 0))

  if maxcolor == 1 then
    h = (g - b) / (max - min)
  elseif maxcolor == 2 then
    h = 2 + (b - r) / (max - min)
  elseif maxcolor == 3 then
    h = 4 + (r - g) / (max - min)
  end

  if not rawequal(type(h), "number") then
    h = 0
  end

  h = h * 60

  if h < 0 then
    h = h + 360
  end

  l = (min + max) / 2

  if min == max then
    s = 0
  else
    if l < 0.5 then
      s = (max - min) / (max + min)
    else
      s = (max - min) / (2 - max - min)
    end
  end

  return h, s, l
end

-- Convert a hex color value to HSL
-- @param hex: The hex color value
-- @param h: Hue (0-360)
-- @param s: Saturation (0-1)
-- @param l: Lightness (0-1)
M.hex2hsl = function(hex)
  local r, g, b = M.hex2rgb(hex)
  return M.rgb2hsl(r, g, b)
end

-- Convert a HSL color value to hex
-- @param h: Hue (0-360)
-- @param s: Saturation (0-1)
-- @param l: Lightness (0-1)
-- @returns hex color value
M.hsl2hex = function(h, s, l)
  local r, g, b = M.hsl2rgb(h, s, l)
  return M.rgb2hex(r, g, b)
end

-- Change the hue of a color by a given amount
-- @param hex The hex color value
-- @param amount The amount to change the hue.
--               Negative values decrease the hue, positive values increase it.
-- @return The hex color value
M.change_hex_hue = function(hex, percent)
  local h, s, l = M.hex2hsl(hex)
  h = h + (percent / 100)
  if h > 360 then
    h = 360
  end
  if h < 0 then
    h = 0
  end
  return M.hsl2hex(h, s, l)
end

-- Desaturate or saturate a color by a given percentage
-- @param hex The hex color value
-- @param percent The percentage to desaturate or saturate the color.
--                Negative values desaturate the color, positive values saturate it
-- @return The hex color value
M.change_hex_saturation = function(hex, percent)
  local h, s, l = M.hex2hsl(hex)
  s = s + (percent / 100)
  if s > 1 then
    s = 1
  end
  if s < 0 then
    s = 0
  end
  return M.hsl2hex(h, s, l)
end

-- Lighten or darken a color by a given percentage
-- @param hex The hex color value
-- @param percent The percentage to lighten or darken the color.
--                Negative values darken the color, positive values lighten it
-- @return The hex color value
M.change_hex_lightness = function(hex, percent)
  local h, s, l = M.hex2hsl(hex)
  l = l + (percent / 100)
  if l > 1 then
    l = 1
  end
  if l < 0 then
    l = 0
  end
  return M.hsl2hex(h, s, l)
end

-- Compute a gradient between two colors
-- @param hex1 The first hex color value
-- @param hex2 The second hex color value
-- @param steps The number of steps to compute
-- @return A table of hex color values
M.compute_gradient = function(hex1, hex2, steps)
  local h1, s1, l1 = M.hex2hsl(hex1)
  local h2, s2, l2 = M.hex2hsl(hex2)
  local h, s, l
  local h_step = (h2 - h1) / (steps - 1)
  local s_step = (s2 - s1) / (steps - 1)
  local l_step = (l2 - l1) / (steps - 1)
  local gradient = {}

  for i = 0, steps - 1 do
    h = h1 + (h_step * i)
    s = s1 + (s_step * i)
    l = l1 + (l_step * i)
    gradient[i + 1] = M.hsl2hex(h, s, l)
  end

  return gradient
end

return M
