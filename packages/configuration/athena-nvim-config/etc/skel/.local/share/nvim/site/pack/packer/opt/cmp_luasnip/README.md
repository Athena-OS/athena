# cmp_luasnip

[luasnip](https://github.com/L3MON4D3/LuaSnip) completion source for [nvim-cmp](https://github.com/hrsh7th/nvim-cmp)

```lua
-- Installation
use { 'L3MON4D3/LuaSnip' }
use {
  'hrsh7th/nvim-cmp',
  config = function ()
    require'cmp'.setup {
    snippet = {
      expand = function(args)
        require'luasnip'.lsp_expand(args.body)
      end
    },

    sources = {
      { name = 'luasnip' },
      -- more sources
    },
  }
  end
}
use { 'saadparwaiz1/cmp_luasnip' }
```

To disable filtering completion candidates by snippet's `show_condition`
use the following options in `sources`:

```lua
sources = {
  { name = 'luasnip', option = { use_show_condition = false } },
  -- more sources
},
```

This can also be configured on per-buffer basis as described in cmp's README
[here](https://github.com/hrsh7th/nvim-cmp#how-to-disable-nvim-cmp-on-the-specific-buffer)
and [here](https://github.com/hrsh7th/nvim-cmp#sources-type-tablecmpsourceconfig).

The same way you can de-/activate whether autosnippets should be included in the
completion list or not (including them can be a bit problematic since when you
select the entry, the text gets inserted and the snippet automatically
triggers). This option defaults to `false` to be backwards compatible. Example:

```lua
sources = {
  { name = 'luasnip', option = { show_autosnippets = true } },
  -- more sources
},
```

Hint: If you want to just hide some autosnippets consider the `hidden` option of
luaSnip
