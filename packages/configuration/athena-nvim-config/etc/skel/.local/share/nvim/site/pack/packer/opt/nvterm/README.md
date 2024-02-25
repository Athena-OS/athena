# NvChad terminal Plugin

## Install

- Simply install the plugin with packer as you would for any other:

```lua
use {
  "NvChad/nvterm",
  config = function ()
    require("nvterm").setup()
  end,
}
```

### Configuration

- Pass a table of configuration options to the plugin's `.setup()` function above.
- Default configuration table

```lua
require("nvterm").setup({
  terminals = {
    shell = vim.o.shell,
    list = {},
    type_opts = {
      float = {
        relative = 'editor',
        row = 0.3,
        col = 0.25,
        width = 0.5,
        height = 0.4,
        border = "single",
      },
      horizontal = { location = "rightbelow", split_ratio = .3, },
      vertical = { location = "rightbelow", split_ratio = .5 },
    }
  },
  behavior = {
    autoclose_on_quit = {
      enabled = false,
      confirm = true,
    },
    close_on_exit = true,
    auto_insert = true,
  },
})
```

```lua
require("nvterm").setup({
  float = {
    relative = 'editor',
    row = 0.3,
    col = 0.25,
    width = 0.5,
    height = 0.4,
    border = "single",
  },
  horizontal = { location = "rightbelow", split_ratio = .3, },
  vertical = { location = "rightbelow", split_ratio = .5 },
})
```

is equivalent to:

```lua
require("nvterm").setup({
  terminals = {
    type_opts = {
      float = {
        relative = 'editor',
        row = 0.3,
        col = 0.25,
        width = 0.5,
        height = 0.4,
        border = "single",
      },
      horizontal = { location = "rightbelow", split_ratio = .3, },
      vertical = { location = "rightbelow", split_ratio = .5 },
    },
  },
  toggle {
    horizontal = "<A-s>",
  },
})
```

### Functions

Use the below functions to map them for keybindings

#### Toggle

```lua
require("nvterm.terminal").toggle "float"
require("nvterm.terminal").toggle "horizontal"
require("nvterm.terminal").toggle "vertical"
```

#### Spawn new terminals

```lua
require("nvterm.terminal").new "horizontal"
require("nvterm.terminal").new "vertical"
```

#### Send commands to the terminal

```lua
    require("nvterm.terminal").send(" your command ", "horizontal|vertical|float") -- the 2nd argument i.e direction is optional
```

- This function will first open a horizontal terminal and then run the `node test.js` command 
- Whenever you re-run this function, it'll just run that command in that horizontal terminal.
```lua
function()
      require("nvterm.terminal").send("node test.js", "horizontal")
end,
```

### Additional Functionality

NvTerm provides an api for you to send commands to the terminal. You can create different ones for different filetypes like so:

```lua
require("nvterm").setup()

local terminal = require("nvterm.terminal")

local ft_cmds = {
  python = "python3 " .. vim.fn.expand('%'),
  ...
  <your commands here>
}
local toggle_modes = {'n', 't'}
local mappings = {
  { 'n', '<C-l>', function () require("nvterm.terminal").send(ft_cmds[vim.bo.filetype]) end },
  { toggle_modes, '<A-h>', function () require("nvterm.terminal").toggle('horizontal') end },
  { toggle_modes, '<A-v>', function () require("nvterm.terminal").toggle('vertical') end },
  { toggle_modes, '<A-i>', function () require("nvterm.terminal").toggle('float') end },
}
local opts = { noremap = true, silent = true }
for _, mapping in ipairs(mappings) do
  vim.keymap.set(mapping[1], mapping[2], mapping[3], opts)
end
```

`terminal.send` also takes a 'type' parameter, so you can choose what type of terminal to send the command to.
By default, it runs the command in the last opened terminal, or a vertical one if none exist.
`terminal.send(ft_cmds[vim.bo.filetype], "float")` will run the command in a floating terminal
