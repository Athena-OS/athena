# impatient.nvim

[![CI](https://github.com/lewis6991/impatient.nvim/workflows/CI/badge.svg?branch=main)](https://github.com/lewis6991/impatient.nvim/actions?query=workflow%3ACI)

Speed up loading Lua modules in Neovim to improve startup time.

## Optimisations

This plugin does several things to speed loading Lua modules and files.

### Implements a chunk cache

This is done by using `loadstring` to compile the Lua modules to bytecode and stores them in a cache file. The cache is invalidated using as hash consisting of:

- The modified time (`sec` and `nsec`) of the file path.
- The file size.

The cache file is located in `$XDG_CACHE_HOME/nvim/luacache_chunks`.

### Implements a module resolution cache

This is done by maintaining a table of module name to path. The cache is invalidated only if a path no longer exists.

The cache file is located in `$XDG_CACHE_HOME/nvim/luacache_modpaths`.

**Note**: This optimization breaks the loading order guarantee of the paths in `'runtimepath'`.
If you rely on this ordering then you can disable this cache (`_G.__luacache_config = { modpaths = { enable = false } }`.
See configuration below for more details.

## Requirements

- Neovim v0.7

## Installation

[packer.nvim](https://github.com/wbthomason/packer.nvim):
```lua
-- Is using a standard Neovim install, i.e. built from source or using a
-- provided appimage.
use 'lewis6991/impatient.nvim'
```

## Setup

To use impatient, you need only to include it near the top of your `init.lua` or `init.vim`.

init.lua:

```lua
require('impatient')
```

init.vim:

```viml
lua require('impatient')
```

## Commands

`:LuaCacheClear`:

Remove the loaded cache and delete the cache file. A new cache file will be created the next time you load Neovim.

`:LuaCacheLog`:

View log of impatient.

`:LuaCacheProfile`:

View profiling data. To enable, Impatient must be setup with:

```viml
lua require'impatient'.enable_profile()
```

## Configuration

Unlike most plugins which provide a `setup()` function, Impatient uses a configuration table stored in the global state, `_G.__luacache_config`.
If you modify the default configuration, it must be done before `require('impatient')` is run.

Default config:

```lua
_G.__luacache_config = {
  chunks = {
    enable = true,
    path = vim.fn.stdpath('cache')..'/luacache_chunks',
  },
  modpaths = {
    enable = true,
    path = vim.fn.stdpath('cache')..'/luacache_modpaths',
  }
}
require('impatient')
```

## Performance Example

Measured on a M1 MacBook Air.

<details>
<summary>Standard</summary>

```
────────────┬────────────┐
 Resolve    │ Load       │
────────────┼────────────┼─────────────────────────────────────────────────────────────────
 Time       │ Time       │ Module
────────────┼────────────┼─────────────────────────────────────────────────────────────────
   54.337ms │   34.257ms │ Total
────────────┼────────────┼─────────────────────────────────────────────────────────────────
    7.264ms │    0.470ms │ octo.colors
    3.154ms │    0.128ms │ diffview.bootstrap
    2.086ms │    0.231ms │ gitsigns
    0.320ms │    0.982ms │ octo.date
    0.296ms │    1.004ms │ octo.writers
    0.322ms │    0.893ms │ octo.utils
    0.293ms │    0.854ms │ vim.diagnostic
    0.188ms │    0.819ms │ vim.lsp.util
    0.261ms │    0.739ms │ vim.lsp
    0.330ms │    0.620ms │ octo.model.octo-buffer
    0.392ms │    0.422ms │ packer.load
    0.287ms │    0.436ms │ octo.reviews
    0.367ms │    0.325ms │ octo
    0.309ms │    0.381ms │ octo.graphql
    0.454ms │    0.221ms │ octo.base64
    0.295ms │    0.338ms │ octo.reviews.file-panel
    0.305ms │    0.306ms │ octo.reviews.file-entry
    0.183ms │    0.386ms │ vim.treesitter.query
    0.418ms │    0.149ms │ vim.uri
    0.342ms │    0.213ms │ octo.config
    0.110ms │    0.430ms │ nvim-lsp-installer.ui.status-win
    0.296ms │    0.209ms │ octo.window
    0.202ms │    0.288ms │ vim.lsp.rpc
    0.352ms │    0.120ms │ octo.gh
    0.287ms │    0.184ms │ octo.reviews.layout
    0.209ms │    0.260ms │ vim.lsp.handlers
    0.108ms │    0.360ms │ luasnip.nodes.snippet
    0.243ms │    0.212ms │ dirvish
    0.289ms │    0.159ms │ octo.mappings
    0.228ms │    0.220ms │ trouble.view
    0.145ms │    0.293ms │ plenary.job
    0.188ms │    0.244ms │ vim.lsp.diagnostic
    0.032ms │    0.391ms │ packer_compiled
    0.188ms │    0.228ms │ vim.lsp.buf
    0.186ms │    0.227ms │ vim.lsp.protocol
    0.141ms │    0.264ms │ nvim-treesitter.install
    0.205ms │    0.190ms │ vim.lsp._snippet
    0.114ms │    0.281ms │ colorizer
    0.124ms │    0.262ms │ nvim-treesitter.parsers
    0.331ms │    0.052ms │ octo.model.body-metadata
    0.325ms │    0.054ms │ octo.constants
    0.296ms │    0.081ms │ octo.reviews.renderer
    0.326ms │    0.050ms │ octo.model.thread-metadata
    0.258ms │    0.117ms │ trouble
    0.106ms │    0.267ms │ cmp.core
    0.286ms │    0.085ms │ octo.completion
    0.120ms │    0.250ms │ luasnip
    0.286ms │    0.084ms │ octo.ui.bubbles
    0.068ms │    0.298ms │ diffview.utils
    0.325ms │    0.039ms │ octo.model.title-metadata
    0.126ms │    0.234ms │ treesitter-context
    0.282ms │    0.073ms │ octo.signs
    0.299ms │    0.043ms │ octo.folds
    0.112ms │    0.228ms │ luasnip.util.util
    0.181ms │    0.156ms │ vim.treesitter.languagetree
    0.260ms │    0.073ms │ vim.keymap
    0.101ms │    0.231ms │ cmp.entry
    0.182ms │    0.145ms │ vim.treesitter.highlighter
    0.191ms │    0.121ms │ trouble.util
    0.190ms │    0.119ms │ vim.lsp.codelens
    0.190ms │    0.117ms │ vim.lsp.sync
    0.197ms │    0.105ms │ vim.highlight
    0.170ms │    0.132ms │ spellsitter
    0.086ms │    0.213ms │ github_dark
    0.200ms │    0.099ms │ persistence
    0.100ms │    0.196ms │ cmp.view.custom_entries_view
    0.118ms │    0.176ms │ nvim-treesitter.configs
    0.090ms │    0.201ms │ gitsigns.git
    0.114ms │    0.170ms │ nvim-lsp-installer.ui.display
    0.217ms │    0.064ms │ plenary.async.async
    0.195ms │    0.078ms │ vim.lsp.log
    0.191ms │    0.081ms │ trouble.renderer
    0.122ms │    0.150ms │ nvim-treesitter.ts_utils
    0.235ms │    0.035ms │ plenary
    0.100ms │    0.168ms │ cmp.source
    0.191ms │    0.076ms │ vim.treesitter
    0.106ms │    0.160ms │ lspconfig.util
    0.118ms │    0.147ms │ nvim-treesitter.query
    0.088ms │    0.176ms │ gitsigns.config
    0.108ms │    0.150ms │ cmp
    0.193ms │    0.063ms │ trouble.providers
    0.206ms │    0.050ms │ tmux.version.parse
    0.103ms │    0.151ms │ cmp.view.wildmenu_entries_view
    0.070ms │    0.178ms │ diffview.path
    0.189ms │    0.058ms │ trouble.providers.lsp
    0.096ms │    0.147ms │ luasnip.util.parser
    0.093ms │    0.150ms │ gitsigns.manager
    0.097ms │    0.145ms │ null-ls.utils
    0.155ms │    0.087ms │ plenary.async.control
    0.105ms │    0.135ms │ nvim-lsp-installer.installers.std
    0.107ms │    0.130ms │ lspconfig.configs
    0.097ms │    0.140ms │ null-ls.helpers.generator_factory
    0.188ms │    0.047ms │ trouble.providers.telescope
    0.191ms │    0.040ms │ trouble.config
    0.099ms │    0.131ms │ cmp.utils.window
    0.096ms │    0.133ms │ luasnip.nodes.choiceNode
    0.192ms │    0.036ms │ trouble.providers.qf
    0.104ms │    0.124ms │ cmp.utils.keymap
    0.089ms │    0.139ms │ gitsigns.hunks
    0.104ms │    0.122ms │ nvim-lsp-installer.process
    0.096ms │    0.129ms │ null-ls.sources
    0.116ms │    0.108ms │ nvim-lsp-installer
    0.096ms │    0.128ms │ luasnip.nodes.dynamicNode
    0.162ms │    0.062ms │ tmux.copy
    0.197ms │    0.025ms │ trouble.folds
    0.156ms │    0.066ms │ plenary.async.util
    0.150ms │    0.071ms │ cmp.utils.highlight
    0.105ms │    0.116ms │ nvim-lsp-installer.server
    0.118ms │    0.100ms │ nvim-treesitter.utils
    0.182ms │    0.035ms │ trouble.providers.diagnostic
    0.103ms │    0.114ms │ luasnip.nodes.node
    0.185ms │    0.031ms │ trouble.colors
    0.180ms │    0.035ms │ vim.ui
    0.162ms │    0.053ms │ spaceless
    0.118ms │    0.097ms │ nvim-treesitter.shell_command_selectors
    0.160ms │    0.053ms │ tmux.wrapper.tmux
    0.182ms │    0.031ms │ vim.treesitter.language
    0.178ms │    0.035ms │ trouble.text
    0.157ms │    0.054ms │ plenary.vararg.rotate
    0.106ms │    0.104ms │ nvim-lsp-installer.installers.context
    0.181ms │    0.028ms │ tmux
    0.158ms │    0.050ms │ nvim-treesitter-playground
    0.067ms │    0.140ms │ diffview.oop
    0.158ms │    0.047ms │ tmux.resize
    0.166ms │    0.039ms │ tmux.log.convert
    0.161ms │    0.044ms │ tmux.layout
    0.155ms │    0.048ms │ plenary.async.structs
    0.101ms │    0.102ms │ cmp.view
    0.096ms │    0.105ms │ luasnip.util.environ
    0.145ms │    0.055ms │ plenary.async
    0.163ms │    0.037ms │ tmux.navigation.navigate
    0.179ms │    0.020ms │ tmux.keymaps
    0.155ms │    0.044ms │ plenary.functional
    0.102ms │    0.097ms │ cmp.matcher
    0.103ms │    0.095ms │ cmp.view.ghost_text_view
    0.106ms │    0.091ms │ colorizer.nvim
    0.168ms │    0.029ms │ tmux.log
    0.106ms │    0.090ms │ nvim-lsp-installer._generated.filetype_map
    0.122ms │    0.073ms │ nvim-treesitter.info
    0.098ms │    0.097ms │ null-ls.client
    0.105ms │    0.089ms │ nvim-lsp-installer.log
    0.170ms │    0.024ms │ tmux.navigation
    0.109ms │    0.084ms │ nvim-lsp-installer.servers
    0.098ms │    0.095ms │ null-ls.helpers.diagnostics
    0.160ms │    0.033ms │ tmux.configuration.options
    0.100ms │    0.091ms │ cmp.utils.misc
    0.044ms │    0.148ms │ lewis6991
    0.104ms │    0.088ms │ colorizer.trie
    0.163ms │    0.028ms │ ts_context_commentstring
    0.054ms │    0.136ms │ cmp-rg
    0.130ms │    0.060ms │ nvim-treesitter.query_predicates
    0.151ms │    0.039ms │ plenary.reload
    0.096ms │    0.094ms │ luasnip.nodes.insertNode
    0.160ms │    0.028ms │ tmux.layout.parse
    0.096ms │    0.093ms │ luasnip.nodes.restoreNode
    0.166ms │    0.022ms │ tmux.configuration.validate
    0.100ms │    0.088ms │ cmp.view.native_entries_view
    0.155ms │    0.033ms │ plenary.tbl
    0.126ms │    0.062ms │ lspconfig.server_configurations.sumneko_lua
    0.029ms │    0.160ms │ cmp_buffer.buffer
    0.105ms │    0.083ms │ cmp.utils.str
    0.162ms │    0.025ms │ tmux.log.severity
    0.164ms │    0.024ms │ tmux.wrapper.nvim
    0.107ms │    0.081ms │ nvim-lsp-installer.ui.status-win.components.settings-schema
    0.021ms │    0.167ms │ lewis6991.null-ls
    0.163ms │    0.024ms │ tmux.configuration
    0.116ms │    0.071ms │ nvim-treesitter.tsrange
    0.161ms │    0.026ms │ tmux.log.channels
    0.094ms │    0.091ms │ gitsigns.debug
    0.163ms │    0.021ms │ plenary.vararg
    0.166ms │    0.018ms │ tmux.version
    0.160ms │    0.022ms │ tmux.configuration.logging
    0.155ms │    0.026ms │ plenary.errors
    0.127ms │    0.053ms │ nvim-treesitter
    0.094ms │    0.085ms │ null-ls.info
    0.100ms │    0.079ms │ cmp.config
    0.095ms │    0.084ms │ null-ls.diagnostics
    0.055ms │    0.123ms │ cmp_path
    0.139ms │    0.038ms │ plenary.async.tests
    0.098ms │    0.078ms │ null-ls.config
    0.100ms │    0.076ms │ cmp.view.docs_view
    0.102ms │    0.074ms │ cmp.utils.feedkeys
    0.089ms │    0.085ms │ gitsigns.current_line_blame
    0.127ms │    0.047ms │ null-ls
    0.107ms │    0.066ms │ nvim-lsp-installer.installers
    0.095ms │    0.078ms │ luasnip.util.mark
    0.106ms │    0.066ms │ nvim-lsp-installer.fs
    0.142ms │    0.030ms │ persistence.config
    0.100ms │    0.070ms │ cmp.config.default
    0.078ms │    0.091ms │ foldsigns
    0.120ms │    0.048ms │ lua-dev
    0.113ms │    0.053ms │ nvim-lsp-installer.ui
    0.029ms │    0.138ms │ lewis6991.status
    0.118ms │    0.047ms │ lspconfig
    0.113ms │    0.051ms │ nvim-lsp-installer.jobs.outdated-servers
    0.105ms │    0.058ms │ nvim-lsp-installer.installers.npm
    0.106ms │    0.057ms │ nvim-lsp-installer.core.receipt
    0.101ms │    0.061ms │ cmp.utils.char
    0.091ms │    0.071ms │ gitsigns.signs
    0.097ms │    0.065ms │ luasnip.nodes.util
    0.126ms │    0.034ms │ treesitter-context.utils
    0.096ms │    0.065ms │ lua-dev.config
    0.109ms │    0.052ms │ nvim-lsp-installer.core.fetch
    0.103ms │    0.055ms │ cmp.types.lsp
    0.099ms │    0.059ms │ luasnip.nodes.functionNode
    0.090ms │    0.067ms │ gitsigns.util
    0.110ms │    0.047ms │ nvim-lsp-installer.jobs.outdated-servers.cargo
    0.096ms │    0.061ms │ luasnip.config
    0.100ms │    0.057ms │ cmp.utils.async
    0.101ms │    0.055ms │ cmp.context
    0.091ms │    0.064ms │ gitsigns.highlight
    0.094ms │    0.061ms │ lua-dev.sumneko
    0.094ms │    0.061ms │ gitsigns.subprocess
    0.067ms │    0.088ms │ cmp_luasnip
    0.105ms │    0.050ms │ nvim-lsp-installer.data
    0.105ms │    0.049ms │ nvim-lsp-installer.installers.pip3
    0.120ms │    0.034ms │ lspconfig.server_configurations.bashls
    0.107ms │    0.046ms │ nvim-lsp-installer.core.clients.github
    0.107ms │    0.045ms │ nvim-lsp-installer.installers.shell
    0.099ms │    0.053ms │ cmp.config.compare
    0.109ms │    0.043ms │ lspconfig.server_configurations.clangd
    0.115ms │    0.036ms │ lspconfig.server_configurations.vimls
    0.097ms │    0.054ms │ luasnip.util.pattern_tokenizer
    0.097ms │    0.053ms │ null-ls.helpers.make_builtin
    0.101ms │    0.049ms │ cmp.utils.api
    0.118ms │    0.032ms │ lspconfig.server_configurations.jedi_language_server
    0.106ms │    0.043ms │ nvim-lsp-installer.jobs.outdated-servers.pip3
    0.106ms │    0.043ms │ nvim-lsp-installer.jobs.outdated-servers.gem
    0.108ms │    0.040ms │ nvim-lsp-installer._generated.language_autocomplete_map
    0.104ms │    0.043ms │ nvim-lsp-installer.installers.composer
    0.101ms │    0.046ms │ cmp.config.mapping
    0.047ms │    0.100ms │ cmp_nvim_lsp_signature_help
    0.109ms │    0.037ms │ nvim-lsp-installer.servers.sumneko_lua
    0.115ms │    0.028ms │ nvim-treesitter.caching
    0.096ms │    0.047ms │ null-ls.state
    0.090ms │    0.053ms │ gitsigns.debounce
    0.059ms │    0.084ms │ cmp_tmux.tmux
    0.096ms │    0.045ms │ null-ls.builtins.diagnostics.flake8
    0.106ms │    0.034ms │ nvim-lsp-installer.jobs.pool
    0.106ms │    0.033ms │ nvim-lsp-installer.ui.status-win.server_hints
    0.105ms │    0.034ms │ nvim-lsp-installer.installers.gem
    0.107ms │    0.032ms │ nvim-lsp-installer.jobs.outdated-servers.npm
    0.106ms │    0.031ms │ nvim-lsp-installer.jobs.outdated-servers.git
    0.114ms │    0.022ms │ nvim-lsp-installer.servers.jedi_language_server
    0.105ms │    0.031ms │ nvim-lsp-installer.jobs.outdated-servers.composer
    0.098ms │    0.038ms │ null-ls.methods
    0.109ms │    0.026ms │ nvim-lsp-installer.jobs.outdated-servers.version-check-result
    0.106ms │    0.029ms │ nvim-lsp-installer.settings
    0.107ms │    0.027ms │ cmp.utils.debug
    0.103ms │    0.031ms │ cmp.types.cmp
    0.070ms │    0.064ms │ diffview.events
    0.108ms │    0.026ms │ nvim-lsp-installer.platform
    0.097ms │    0.037ms │ null-ls.helpers.command_resolver
    0.104ms │    0.029ms │ cmp.config.sources
    0.107ms │    0.026ms │ nvim-lsp-installer.jobs.outdated-servers.github_release_file
    0.099ms │    0.033ms │ cmp.utils.cache
    0.107ms │    0.025ms │ nvim-lsp-installer.path
    0.101ms │    0.030ms │ cmp.utils.autocmd
    0.097ms │    0.034ms │ null-ls.logger
    0.100ms │    0.031ms │ cmp.utils.event
    0.088ms │    0.042ms │ gitsigns.cache
    0.103ms │    0.027ms │ cmp.utils.pattern
    0.108ms │    0.022ms │ nvim-lsp-installer.jobs.outdated-servers.jdtls
    0.103ms │    0.027ms │ cmp.utils.buffer
    0.095ms │    0.034ms │ luasnip.nodes.textNode
    0.096ms │    0.033ms │ luasnip.util.dict
    0.108ms │    0.021ms │ nvim-lsp-installer.servers.bashls
    0.108ms │    0.021ms │ nvim-lsp-installer.ui.state
    0.110ms │    0.018ms │ nvim-lsp-installer.servers.vimls
    0.101ms │    0.027ms │ null-ls.helpers.range_formatting_args_factory
    0.057ms │    0.071ms │ cmp_treesitter.lru
    0.105ms │    0.022ms │ nvim-lsp-installer.dispatcher
    0.097ms │    0.030ms │ luasnip.extras.filetype_functions
    0.103ms │    0.024ms │ luasnip.session
    0.105ms │    0.021ms │ nvim-lsp-installer.core.clients.crates
    0.105ms │    0.021ms │ nvim-lsp-installer.jobs.outdated-servers.github_tag
    0.110ms │    0.016ms │ cmp.types
    0.105ms │    0.021ms │ nvim-lsp-installer.core.clients.eclipse
    0.105ms │    0.021ms │ nvim-lsp-installer.notify
    0.089ms │    0.036ms │ gitsigns.status
    0.096ms │    0.029ms │ null-ls.builtins.diagnostics.teal
    0.097ms │    0.027ms │ null-ls.builtins
    0.103ms │    0.021ms │ cmp.types.vim
    0.060ms │    0.062ms │ cmp_tmux.source
    0.100ms │    0.022ms │ null-ls.helpers
    0.098ms │    0.024ms │ null-ls.builtins.diagnostics.gitlint
    0.065ms │    0.056ms │ cmp_treesitter
    0.024ms │    0.097ms │ buftabline.buftab
    0.095ms │    0.026ms │ null-ls.builtins.diagnostics.shellcheck
    0.095ms │    0.026ms │ null-ls.builtins.diagnostics.luacheck
    0.097ms │    0.021ms │ null-ls.helpers.formatter_factory
    0.097ms │    0.022ms │ luasnip.util.events
    0.097ms │    0.021ms │ luasnip.util.types
    0.096ms │    0.022ms │ luasnip.util.functions
    0.037ms │    0.078ms │ cmp_cmdline
    0.032ms │    0.083ms │ cmp_buffer.source
    0.040ms │    0.074ms │ lewis6991.cmp
    0.060ms │    0.054ms │ cmp_treesitter.treesitter
    0.089ms │    0.025ms │ gitsigns.message
    0.039ms │    0.073ms │ cmp_nvim_lsp.source
    0.055ms │    0.054ms │ buftabline.build
    0.026ms │    0.083ms │ lewis6991.lsp
    0.051ms │    0.055ms │ cmp_nvim_lua
    0.033ms │    0.065ms │ cleanfold
    0.071ms │    0.025ms │ cmp_tmux
    0.043ms │    0.053ms │ cmp_nvim_lsp
    0.058ms │    0.033ms │ cmp-spell
    0.043ms │    0.037ms │ cmp_emoji
    0.029ms │    0.049ms │ lewis6991.floating_man
    0.032ms │    0.042ms │ cmp_buffer.timer
    0.024ms │    0.050ms │ lewis6991.treesitter
    0.019ms │    0.054ms │ lewis6991.cmp_gh
    0.025ms │    0.046ms │ buftabline.buffers
    0.021ms │    0.048ms │ lewis6991.telescope
    0.024ms │    0.031ms │ buftabline
    0.035ms │    0.019ms │ cmp_buffer
    0.019ms │    0.035ms │ buftabline.utils
    0.021ms │    0.030ms │ buftabline.highlights
    0.020ms │    0.032ms │ buftabline.tabpage-tab
    0.019ms │    0.030ms │ buftabline.options
    0.020ms │    0.026ms │ buftabline.tabpages
────────────┴────────────┴─────────────────────────────────────────────────────────────────
```
</details>

Total resolve: 54.337ms, total load: 34.257ms

<details>
<summary>With cache</summary>

```
────────────┬────────────┐
 Resolve    │ Load       │
────────────┼────────────┼─────────────────────────────────────────────────────────────────
 Time       │ Time       │ Module
────────────┼────────────┼─────────────────────────────────────────────────────────────────
    6.357ms │    6.796ms │ Total
────────────┼────────────┼─────────────────────────────────────────────────────────────────
    0.041ms │    2.021ms │ octo.writers
    0.118ms │    0.160ms │ lewis6991.plugins
    0.050ms │    0.144ms │ octo.date
    0.035ms │    0.153ms │ octo.utils
    0.057ms │    0.099ms │ octo.model.octo-buffer
    0.047ms │    0.105ms │ packer
    0.058ms │    0.080ms │ octo.colors
    0.121ms │    0.015ms │ gitsigns.cache
    0.082ms │    0.037ms │ packer.load
    0.107ms │    0.008ms │ gitsigns.debounce
    0.048ms │    0.064ms │ octo.config
    0.048ms │    0.061ms │ octo.graphql
    0.049ms │    0.051ms │ octo
    0.043ms │    0.057ms │ vim.diagnostic
    0.085ms │    0.013ms │ gitsigns.highlight
    0.065ms │    0.032ms │ octo.base64
    0.035ms │    0.060ms │ vim.lsp
    0.056ms │    0.035ms │ octo.gh
    0.045ms │    0.045ms │ octo.mappings
    0.026ms │    0.060ms │ octo.reviews
    0.037ms │    0.045ms │ packer.plugin_utils
    0.030ms │    0.049ms │ octo.reviews.file-panel
    0.018ms │    0.056ms │ vim.lsp.util
    0.043ms │    0.030ms │ packer.log
    0.036ms │    0.032ms │ packer.util
    0.032ms │    0.035ms │ octo.reviews.file-entry
    0.021ms │    0.045ms │ packer_compiled
    0.052ms │    0.014ms │ octo.model.body-metadata
    0.033ms │    0.027ms │ octo.reviews.layout
    0.014ms │    0.047ms │ nvim-treesitter.parsers
    0.035ms │    0.024ms │ vim.lsp.handlers
    0.014ms │    0.044ms │ nvim-lsp-installer.ui.status-win
    0.046ms │    0.012ms │ octo.completion
    0.037ms │    0.021ms │ octo.constants
    0.032ms │    0.025ms │ lewis6991
    0.040ms │    0.017ms │ persistence
    0.030ms │    0.026ms │ diffview.utils
    0.035ms │    0.020ms │ packer.result
    0.015ms │    0.040ms │ gitsigns.config
    0.031ms │    0.024ms │ packer.async
    0.041ms │    0.013ms │ vim.uri
    0.044ms │    0.010ms │ octo.model.thread-metadata
    0.018ms │    0.035ms │ gitsigns.debug
    0.023ms │    0.030ms │ github_dark
    0.030ms │    0.023ms │ packer.jobs
    0.039ms │    0.013ms │ buftabline.build
    0.037ms │    0.014ms │ octo.model.title-metadata
    0.025ms │    0.025ms │ vim.lsp.buf
    0.022ms │    0.027ms │ gitsigns
    0.027ms │    0.022ms │ lewis6991.status
    0.016ms │    0.032ms │ gitsigns.git
    0.026ms │    0.020ms │ octo.window
    0.033ms │    0.012ms │ octo.folds
    0.037ms │    0.008ms │ trouble.providers.lsp
    0.016ms │    0.028ms │ vim.lsp.protocol
    0.028ms │    0.016ms │ octo.signs
    0.028ms │    0.014ms │ null-ls
    0.027ms │    0.014ms │ octo.reviews.renderer
    0.018ms │    0.024ms │ trouble.view
    0.017ms │    0.025ms │ luasnip.nodes.snippet
    0.023ms │    0.018ms │ colorizer.nvim
    0.017ms │    0.024ms │ vim.lsp._snippet
    0.015ms │    0.025ms │ nvim-treesitter.install
    0.018ms │    0.022ms │ plenary.async.structs
    0.018ms │    0.021ms │ dirvish
    0.027ms │    0.012ms │ octo.ui.bubbles
    0.019ms │    0.020ms │ treesitter-context
    0.015ms │    0.024ms │ vim.lsp.diagnostic
    0.016ms │    0.023ms │ vim.lsp.rpc
    0.022ms │    0.016ms │ trouble
    0.022ms │    0.016ms │ null-ls.helpers.generator_factory
    0.020ms │    0.017ms │ luasnip
    0.014ms │    0.023ms │ plenary.job
    0.026ms │    0.011ms │ lewis6991.cmp
    0.027ms │    0.010ms │ trouble.providers
    0.022ms │    0.014ms │ nvim-treesitter.query
    0.018ms │    0.018ms │ vim.treesitter.highlighter
    0.017ms │    0.018ms │ nvim-treesitter.shell_command_selectors
    0.014ms │    0.021ms │ nvim-treesitter.configs
    0.025ms │    0.010ms │ lewis6991.floating_man
    0.022ms │    0.012ms │ vim.keymap
    0.013ms │    0.021ms │ cmp.entry
    0.024ms │    0.010ms │ lspconfig.server_configurations.bashls
    0.018ms │    0.016ms │ gitsigns.hunks
    0.017ms │    0.017ms │ gitsigns.status
    0.014ms │    0.019ms │ cmp.core
    0.018ms │    0.015ms │ spellsitter
    0.014ms │    0.019ms │ colorizer
    0.024ms │    0.009ms │ diffview.bootstrap
    0.016ms │    0.016ms │ null-ls.utils
    0.021ms │    0.011ms │ nvim-treesitter.info
    0.022ms │    0.010ms │ vim.highlight
    0.016ms │    0.016ms │ null-ls.info
    0.019ms │    0.013ms │ cmp_path
    0.026ms │    0.006ms │ cmp.utils.autocmd
    0.021ms │    0.011ms │ foldsigns
    0.014ms │    0.018ms │ lewis6991.null-ls
    0.018ms │    0.013ms │ cmp.view
    0.017ms │    0.014ms │ null-ls.client
    0.016ms │    0.015ms │ gitsigns.manager
    0.013ms │    0.018ms │ cmp.view.custom_entries_view
    0.015ms │    0.015ms │ nvim-lsp-installer.ui.display
    0.020ms │    0.010ms │ null-ls.methods
    0.016ms │    0.014ms │ plenary.async.control
    0.019ms │    0.011ms │ null-ls.diagnostics
    0.014ms │    0.015ms │ luasnip.util.util
    0.017ms │    0.013ms │ gitsigns.current_line_blame
    0.013ms │    0.016ms │ buftabline.buftab
    0.015ms │    0.015ms │ trouble.util
    0.015ms │    0.015ms │ luasnip.config
    0.019ms │    0.010ms │ plenary.async.async
    0.018ms │    0.012ms │ nvim-treesitter.tsrange
    0.021ms │    0.007ms │ cmp_nvim_lua
    0.014ms │    0.015ms │ vim.treesitter.query
    0.015ms │    0.014ms │ cmp.source
    0.014ms │    0.015ms │ vim.treesitter.languagetree
    0.012ms │    0.016ms │ nvim-lsp-installer._generated.filetype_map
    0.015ms │    0.014ms │ nvim-lsp-installer.servers
    0.014ms │    0.014ms │ lspconfig.util
    0.011ms │    0.017ms │ cmp
    0.015ms │    0.013ms │ cmp.view.wildmenu_entries_view
    0.021ms │    0.007ms │ lspconfig.server_configurations.jedi_language_server
    0.015ms │    0.013ms │ lua-dev
    0.018ms │    0.010ms │ gitsigns.util
    0.014ms │    0.014ms │ vim.lsp.codelens
    0.017ms │    0.011ms │ plenary.async.util
    0.013ms │    0.014ms │ null-ls.sources
    0.015ms │    0.012ms │ nvim-treesitter.query_predicates
    0.013ms │    0.015ms │ luasnip.nodes.choiceNode
    0.015ms │    0.013ms │ null-ls.helpers.diagnostics
    0.017ms │    0.011ms │ trouble.renderer
    0.015ms │    0.013ms │ luasnip.nodes.node
    0.014ms │    0.013ms │ lua-dev.sumneko
    0.013ms │    0.014ms │ cmp.utils.window
    0.021ms │    0.006ms │ treesitter-context.utils
    0.018ms │    0.009ms │ cleanfold
    0.015ms │    0.012ms │ nvim-treesitter.ts_utils
    0.012ms │    0.015ms │ nvim-lsp-installer.installers.std
    0.015ms │    0.012ms │ nvim-lsp-installer.server
    0.014ms │    0.012ms │ lewis6991.lsp
    0.016ms │    0.011ms │ gitsigns.signs
    0.020ms │    0.006ms │ buftabline
    0.019ms │    0.007ms │ plenary.tbl
    0.013ms │    0.013ms │ nvim-lsp-installer
    0.018ms │    0.008ms │ plenary
    0.015ms │    0.010ms │ cmp_luasnip
    0.019ms │    0.007ms │ null-ls.logger
    0.016ms │    0.010ms │ vim.lsp.sync
    0.016ms │    0.010ms │ spaceless
    0.017ms │    0.009ms │ gitsigns.subprocess
    0.016ms │    0.009ms │ plenary.functional
    0.016ms │    0.010ms │ buftabline.buffers
    0.016ms │    0.009ms │ vim.lsp.log
    0.019ms │    0.006ms │ cmp_tmux
    0.013ms │    0.012ms │ luasnip.nodes.dynamicNode
    0.017ms │    0.008ms │ vim.treesitter
    0.013ms │    0.013ms │ nvim-lsp-installer.process
    0.013ms │    0.012ms │ luasnip.util.environ
    0.015ms │    0.009ms │ lewis6991.treesitter
    0.015ms │    0.010ms │ null-ls.config
    0.019ms │    0.006ms │ ts_context_commentstring
    0.013ms │    0.012ms │ cmp_buffer.buffer
    0.018ms │    0.007ms │ null-ls.builtins.diagnostics.shellcheck
    0.015ms │    0.010ms │ null-ls.helpers.make_builtin
    0.012ms │    0.012ms │ diffview.path
    0.016ms │    0.008ms │ null-ls.builtins.diagnostics.gitlint
    0.017ms │    0.007ms │ trouble.providers.telescope
    0.013ms │    0.011ms │ diffview.oop
    0.015ms │    0.010ms │ cmp-rg
    0.013ms │    0.011ms │ cmp.utils.keymap
    0.014ms │    0.011ms │ nvim-treesitter
    0.018ms │    0.007ms │ cmp.utils.highlight
    0.016ms │    0.008ms │ lspconfig.server_configurations.sumneko_lua
    0.015ms │    0.009ms │ colorizer.trie
    0.016ms │    0.007ms │ plenary.vararg.rotate
    0.015ms │    0.009ms │ trouble.config
    0.011ms │    0.012ms │ lspconfig.configs
    0.014ms │    0.009ms │ null-ls.helpers.command_resolver
    0.016ms │    0.007ms │ cmp_tmux.source
    0.016ms │    0.007ms │ lspconfig
    0.017ms │    0.006ms │ plenary.vararg
    0.012ms │    0.011ms │ nvim-lsp-installer.installers.context
    0.014ms │    0.009ms │ cmp.view.native_entries_view
    0.014ms │    0.009ms │ cmp.config.default
    0.017ms │    0.006ms │ tmux.version.parse
    0.016ms │    0.007ms │ gitsigns.message
    0.017ms │    0.006ms │ persistence.config
    0.013ms │    0.010ms │ cmp_nvim_lsp_signature_help
    0.012ms │    0.010ms │ cmp.view.docs_view
    0.017ms │    0.006ms │ cmp.config.sources
    0.013ms │    0.009ms │ luasnip.nodes.restoreNode
    0.014ms │    0.009ms │ vim.ui
    0.013ms │    0.010ms │ luasnip.nodes.insertNode
    0.013ms │    0.010ms │ null-ls.state
    0.014ms │    0.008ms │ lspconfig.server_configurations.vimls
    0.016ms │    0.006ms │ plenary.errors
    0.014ms │    0.008ms │ null-ls.builtins.diagnostics.flake8
    0.016ms │    0.006ms │ null-ls.helpers
    0.015ms │    0.008ms │ null-ls.builtins.diagnostics.luacheck
    0.014ms │    0.008ms │ luasnip.util.mark
    0.015ms │    0.008ms │ cmp.utils.buffer
    0.012ms │    0.010ms │ nvim-lsp-installer.log
    0.015ms │    0.007ms │ luasnip.nodes.util
    0.015ms │    0.007ms │ null-ls.builtins.diagnostics.teal
    0.016ms │    0.006ms │ null-ls.helpers.range_formatting_args_factory
    0.012ms │    0.010ms │ nvim-treesitter.utils
    0.015ms │    0.007ms │ cmp.utils.event
    0.013ms │    0.009ms │ tmux.wrapper.tmux
    0.015ms │    0.007ms │ nvim-treesitter-playground
    0.012ms │    0.010ms │ cmp_buffer.source
    0.015ms │    0.007ms │ cmp_treesitter
    0.013ms │    0.009ms │ luasnip.util.parser
    0.015ms │    0.006ms │ trouble.providers.qf
    0.014ms │    0.008ms │ lewis6991.telescope
    0.014ms │    0.007ms │ cmp_tmux.tmux
    0.014ms │    0.007ms │ cmp_nvim_lsp.source
    0.015ms │    0.006ms │ plenary.reload
    0.014ms │    0.008ms │ buftabline.highlights
    0.015ms │    0.006ms │ trouble.providers.diagnostic
    0.015ms │    0.007ms │ nvim-lsp-installer.core.clients.github
    0.014ms │    0.007ms │ nvim-lsp-installer.installers.shell
    0.016ms │    0.005ms │ cmp-spell
    0.014ms │    0.007ms │ null-ls.builtins
    0.013ms │    0.008ms │ cmp_treesitter.lru
    0.016ms │    0.005ms │ buftabline.tabpages
    0.015ms │    0.006ms │ buftabline.options
    0.016ms │    0.005ms │ lua-dev.config
    0.015ms │    0.006ms │ nvim-lsp-installer.jobs.outdated-servers.cargo
    0.014ms │    0.007ms │ diffview.events
    0.013ms │    0.008ms │ nvim-lsp-installer.fs
    0.013ms │    0.008ms │ cmp.utils.feedkeys
    0.013ms │    0.007ms │ nvim-treesitter.caching
    0.013ms │    0.008ms │ nvim-lsp-installer._generated.language_autocomplete_map
    0.013ms │    0.007ms │ cmp.view.ghost_text_view
    0.013ms │    0.008ms │ cmp_nvim_lsp
    0.013ms │    0.007ms │ luasnip.nodes.functionNode
    0.013ms │    0.007ms │ nvim-lsp-installer.jobs.outdated-servers
    0.012ms │    0.008ms │ nvim-lsp-installer.ui.status-win.components.settings-schema
    0.012ms │    0.009ms │ lewis6991.cmp_gh
    0.015ms │    0.006ms │ luasnip.util.dict
    0.013ms │    0.007ms │ plenary.async
    0.014ms │    0.006ms │ nvim-lsp-installer.installers.composer
    0.013ms │    0.007ms │ cmp_treesitter.treesitter
    0.014ms │    0.006ms │ nvim-lsp-installer.jobs.outdated-servers.gem
    0.015ms │    0.005ms │ nvim-lsp-installer.platform
    0.014ms │    0.006ms │ buftabline.utils
    0.013ms │    0.007ms │ trouble.text
    0.011ms │    0.008ms │ cmp.config
    0.013ms │    0.006ms │ trouble.colors
    0.012ms │    0.007ms │ cmp.utils.misc
    0.012ms │    0.008ms │ nvim-lsp-installer.installers.npm
    0.013ms │    0.007ms │ lspconfig.server_configurations.clangd
    0.012ms │    0.007ms │ cmp_cmdline
    0.011ms │    0.008ms │ cmp.types.lsp
    0.014ms │    0.006ms │ vim.treesitter.language
    0.014ms │    0.006ms │ cmp.config.mapping
    0.015ms │    0.004ms │ luasnip.util.events
    0.014ms │    0.005ms │ luasnip.extras.filetype_functions
    0.012ms │    0.007ms │ cmp.utils.async
    0.012ms │    0.007ms │ cmp.config.compare
    0.013ms │    0.005ms │ cmp_emoji
    0.015ms │    0.004ms │ cmp_buffer
    0.011ms │    0.007ms │ nvim-lsp-installer.core.receipt
    0.012ms │    0.007ms │ nvim-lsp-installer.ui
    0.013ms │    0.006ms │ cmp.utils.api
    0.012ms │    0.007ms │ nvim-lsp-installer.core.fetch
    0.013ms │    0.005ms │ nvim-lsp-installer.jobs.pool
    0.011ms │    0.007ms │ nvim-lsp-installer.installers
    0.012ms │    0.007ms │ nvim-lsp-installer.data
    0.013ms │    0.006ms │ cmp.matcher
    0.014ms │    0.005ms │ tmux
    0.011ms │    0.008ms │ tmux.copy
    0.013ms │    0.005ms │ luasnip.util.types
    0.014ms │    0.004ms │ nvim-lsp-installer.servers.jedi_language_server
    0.014ms │    0.004ms │ nvim-lsp-installer.servers.vimls
    0.014ms │    0.004ms │ cmp.utils.cache
    0.013ms │    0.006ms │ luasnip.util.pattern_tokenizer
    0.012ms │    0.006ms │ luasnip.nodes.textNode
    0.013ms │    0.005ms │ null-ls.helpers.formatter_factory
    0.013ms │    0.006ms │ plenary.async.tests
    0.013ms │    0.005ms │ nvim-lsp-installer.jobs.outdated-servers.version-check-result
    0.012ms │    0.005ms │ nvim-lsp-installer.settings
    0.011ms │    0.006ms │ cmp.context
    0.011ms │    0.006ms │ cmp.utils.str
    0.013ms │    0.004ms │ luasnip.session
    0.013ms │    0.005ms │ nvim-lsp-installer.jobs.outdated-servers.composer
    0.012ms │    0.006ms │ nvim-lsp-installer.servers.sumneko_lua
    0.012ms │    0.005ms │ cmp_buffer.timer
    0.011ms │    0.006ms │ cmp.utils.char
    0.013ms │    0.004ms │ cmp.utils.pattern
    0.011ms │    0.006ms │ nvim-lsp-installer.installers.pip3
    0.013ms │    0.004ms │ luasnip.util.functions
    0.013ms │    0.005ms │ tmux.log.channels
    0.012ms │    0.005ms │ tmux.navigation
    0.013ms │    0.005ms │ trouble.folds
    0.012ms │    0.005ms │ nvim-lsp-installer.ui.status-win.server_hints
    0.012ms │    0.005ms │ nvim-lsp-installer.jobs.outdated-servers.pip3
    0.012ms │    0.005ms │ nvim-lsp-installer.jobs.outdated-servers.npm
    0.011ms │    0.006ms │ cmp.utils.debug
    0.013ms │    0.004ms │ nvim-lsp-installer.notify
    0.011ms │    0.006ms │ tmux.layout
    0.013ms │    0.004ms │ nvim-lsp-installer.servers.bashls
    0.012ms │    0.004ms │ nvim-lsp-installer.dispatcher
    0.012ms │    0.005ms │ buftabline.tabpage-tab
    0.012ms │    0.005ms │ nvim-lsp-installer.path
    0.010ms │    0.006ms │ tmux.resize
    0.013ms │    0.004ms │ cmp.types.vim
    0.012ms │    0.004ms │ nvim-lsp-installer.ui.state
    0.011ms │    0.005ms │ nvim-lsp-installer.installers.gem
    0.012ms │    0.005ms │ tmux.configuration.options
    0.012ms │    0.005ms │ nvim-lsp-installer.jobs.outdated-servers.git
    0.012ms │    0.004ms │ nvim-lsp-installer.jobs.outdated-servers.github_release_file
    0.012ms │    0.005ms │ cmp.types.cmp
    0.013ms │    0.004ms │ cmp.types
    0.011ms │    0.005ms │ tmux.log
    0.011ms │    0.005ms │ tmux.navigation.navigate
    0.012ms │    0.005ms │ tmux.configuration
    0.012ms │    0.004ms │ nvim-lsp-installer.jobs.outdated-servers.github_tag
    0.011ms │    0.005ms │ tmux.layout.parse
    0.012ms │    0.004ms │ nvim-lsp-installer.jobs.outdated-servers.jdtls
    0.011ms │    0.005ms │ tmux.log.convert
    0.011ms │    0.005ms │ tmux.log.severity
    0.011ms │    0.004ms │ tmux.version
    0.012ms │    0.004ms │ nvim-lsp-installer.core.clients.eclipse
    0.011ms │    0.004ms │ nvim-lsp-installer.core.clients.crates
    0.011ms │    0.004ms │ tmux.configuration.logging
    0.011ms │    0.004ms │ tmux.wrapper.nvim
    0.011ms │    0.004ms │ tmux.configuration.validate
    0.011ms │    0.004ms │ tmux.keymaps
────────────┴────────────┴─────────────────────────────────────────────────────────────────
```

</details>

Total resolve: 6.357ms, total load: 6.796ms

## Relevant Neovim PR's

[libs: vendor libmpack and libmpack-lua](https://github.com/neovim/neovim/pull/15566) [merged]

[fix(vim.mpack): rename pack/unpack => encode/decode](https://github.com/neovim/neovim/pull/16175) [merged]

[fix(runtime): add compressed representation to &rtp](https://github.com/neovim/neovim/pull/15867) [merged]

[fix(runtime): don't use regexes inside lua require'mod'](https://github.com/neovim/neovim/pull/15973) [merged]

[fix(lua): restore priority of the preloader](https://github.com/neovim/neovim/pull/17302) [merged]

[refactor(lua): call loadfile internally instead of luaL_loadfile](https://github.com/neovim/neovim/pull/17200) [merged]

[feat(lua): startup profiling](https://github.com/neovim/neovim/pull/15436)

## Credit

All credit goes to @bfredl who implemented the majority of this plugin in https://github.com/neovim/neovim/pull/15436.
