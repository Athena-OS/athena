# NvChad's UI plugins
Lightweight &amp; performant ui plugin for nvchad

# Default config 

- Refer [NvChad docs](https://nvchad.github.io/config/nvchad_ui#statusline--tabufline) for detailed info
- You dont have to write the whole table, this is just the default config
- In  your override section : 

```lua
["NvChad/ui"] = {
     statusline = {
       separator_style = "default", -- default/round/block/arrow
       overriden_modules = nil,
     },

     -- lazyload it when there are 1+ buffers
     tabufline = {
       enabled = true,
       lazyload = true,
       overriden_modules = nil,
     },
   },
```
