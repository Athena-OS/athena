local helpers = require('test.functional.helpers')()

local clear    = helpers.clear
local exec_lua = helpers.exec_lua
local eq       = helpers.eq
local cmd      = helpers.command

local nvim07

local function gen_exp(exp)
  local neovim_dir = nvim07 and 'neovim-v0.7.0' or 'neovim-master'
  local cwd = exec_lua('return vim.loop.cwd()')

  local exp1 = {}
  for _, v in pairs(exp) do
    if type(v) == 'string' then
      v = v:gsub('{CWD}', cwd)
      v = v:gsub('{NVIM}', neovim_dir)
      exp1[#exp1+1] = v
    end
  end

  return exp1
end

local gen_exp_cold = function()
  return gen_exp{
    'Creating cache for module plugins',
    'No cache for path ./test/lua/plugins.lua',
    'Creating cache for path ./test/lua/plugins.lua',
    'Creating cache for module telescope',
    'No cache for path {CWD}/scratch/telescope.nvim/lua/telescope/init.lua',
    'Creating cache for path {CWD}/scratch/telescope.nvim/lua/telescope/init.lua',
    'Creating cache for module telescope/_extensions',
    'No cache for path {CWD}/scratch/telescope.nvim/lua/telescope/_extensions/init.lua',
    'Creating cache for path {CWD}/scratch/telescope.nvim/lua/telescope/_extensions/init.lua',
    'Creating cache for module gitsigns',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns.lua',
    'Creating cache for module plenary/async/async',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/async.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/async.lua',
    'Creating cache for module plenary/vararg',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/vararg/init.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/vararg/init.lua',
    'Creating cache for module plenary/vararg/rotate',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/vararg/rotate.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/vararg/rotate.lua',
    'Creating cache for module plenary/tbl',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/tbl.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/tbl.lua',
    'Creating cache for module plenary/errors',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/errors.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/errors.lua',
    'Creating cache for module plenary/functional',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/functional.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/functional.lua',
    'Creating cache for module plenary/async/util',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/util.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/util.lua',
    'Creating cache for module plenary/async/control',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/control.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/control.lua',
    'Creating cache for module plenary/async/structs',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/structs.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/structs.lua',
    'Creating cache for module gitsigns/status',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/status.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/status.lua',
    'Creating cache for module gitsigns/git',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/git.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/git.lua',
    'Creating cache for module plenary/job',
    'No cache for path {CWD}/scratch/plenary.nvim/lua/plenary/job.lua',
    'Creating cache for path {CWD}/scratch/plenary.nvim/lua/plenary/job.lua',
    'Creating cache for module gitsigns/debug',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/debug.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/debug.lua',
    'Creating cache for module gitsigns/util',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/util.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/util.lua',
    'Creating cache for module gitsigns/hunks',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/hunks.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/hunks.lua',
    'Creating cache for module gitsigns/signs',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/signs.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/signs.lua',
    'Creating cache for module gitsigns/config',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/config.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/config.lua',
    'Creating cache for module gitsigns/manager',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/manager.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/manager.lua',
    'Creating cache for module gitsigns/cache',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/cache.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/cache.lua',
    'Creating cache for module gitsigns/debounce',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/debounce.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/debounce.lua',
    'Creating cache for module gitsigns/highlight',
    'No cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/highlight.lua',
    'Creating cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/highlight.lua',
    'Creating cache for module spellsitter',
    'No cache for path {CWD}/scratch/spellsitter.nvim/lua/spellsitter.lua',
    'Creating cache for path {CWD}/scratch/spellsitter.nvim/lua/spellsitter.lua',
    'Creating cache for module vim/treesitter/query',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/query.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/query.lua',
    'Creating cache for module vim/treesitter/language',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/language.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/language.lua',
    'Creating cache for module vim/treesitter',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter.lua',
    'Creating cache for module vim/treesitter/languagetree',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/languagetree.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/languagetree.lua',
    'Creating cache for module colorizer',
    'No cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer.lua',
    'Creating cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer.lua',
    'Creating cache for module colorizer/nvim',
    'No cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer/nvim.lua',
    'Creating cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer/nvim.lua',
    'Creating cache for module colorizer/trie',
    'No cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer/trie.lua',
    'Creating cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer/trie.lua',
    'Creating cache for module lspconfig',
    'No cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig.lua',
    'Creating cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig.lua',
    'Creating cache for module lspconfig/configs',
    'No cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig/configs.lua',
    'Creating cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig/configs.lua',
    'Creating cache for module lspconfig/util',
    'No cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig/util.lua',
    'Creating cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig/util.lua',
    'Creating cache for module vim/lsp',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp.lua',
    'Creating cache for module vim/lsp/handlers',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/handlers.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/handlers.lua',
    'Creating cache for module vim/lsp/log',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/log.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/log.lua',
    'Creating cache for module vim/lsp/protocol',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/protocol.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/protocol.lua',
    'Creating cache for module vim/lsp/util',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/util.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/util.lua',
    'Creating cache for module vim/lsp/_snippet',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/_snippet.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/_snippet.lua',
    'Creating cache for module vim/highlight',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/highlight.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/highlight.lua',
    'Creating cache for module vim/lsp/rpc',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/rpc.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/rpc.lua',
    'Creating cache for module vim/lsp/sync',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/sync.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/sync.lua',
    'Creating cache for module vim/lsp/buf',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/buf.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/buf.lua',
    'Creating cache for module vim/lsp/diagnostic',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/diagnostic.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/diagnostic.lua',
    'Creating cache for module vim/lsp/codelens',
    'No cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/codelens.lua',
    'Creating cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/codelens.lua',
    'Creating cache for module bufferline',
    'No cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline.lua',
    'Creating cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline.lua',
    'Creating cache for module bufferline/constants',
    'No cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline/constants.lua',
    'Creating cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline/constants.lua',
    'Creating cache for module bufferline/utils',
    'No cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline/utils.lua',
    'Creating cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline/utils.lua',
    'Updating chunk cache file: scratch/cache/nvim/luacache_chunks',
    'Updating chunk cache file: scratch/cache/nvim/luacache_modpaths'
  }
end

local gen_exp_hot = function()
  return gen_exp{
    'Loading cache file scratch/cache/nvim/luacache_chunks',
    'Loading cache file scratch/cache/nvim/luacache_modpaths',
    'Loaded cache for path ./test/lua/plugins.lua',
    'Loaded cache for path {CWD}/scratch/telescope.nvim/lua/telescope/init.lua',
    'Loaded cache for path {CWD}/scratch/telescope.nvim/lua/telescope/_extensions/init.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/async.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/vararg/init.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/vararg/rotate.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/tbl.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/errors.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/functional.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/util.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/control.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/async/structs.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/status.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/git.lua',
    'Loaded cache for path {CWD}/scratch/plenary.nvim/lua/plenary/job.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/debug.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/util.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/hunks.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/signs.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/config.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/manager.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/cache.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/debounce.lua',
    'Loaded cache for path {CWD}/scratch/gitsigns.nvim/lua/gitsigns/highlight.lua',
    'Loaded cache for path {CWD}/scratch/spellsitter.nvim/lua/spellsitter.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/query.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/language.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/treesitter/languagetree.lua',
    'Loaded cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer.lua',
    'Loaded cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer/nvim.lua',
    'Loaded cache for path {CWD}/scratch/nvim-colorizer.lua/lua/colorizer/trie.lua',
    'Loaded cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig.lua',
    'Loaded cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig/configs.lua',
    'Loaded cache for path {CWD}/scratch/nvim-lspconfig/lua/lspconfig/util.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/handlers.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/log.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/protocol.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/util.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/_snippet.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/highlight.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/rpc.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/sync.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/buf.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/diagnostic.lua',
    'Loaded cache for path {CWD}/{NVIM}/runtime/lua/vim/lsp/codelens.lua',
    'Loaded cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline.lua',
    'Loaded cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline/constants.lua',
    'Loaded cache for path {CWD}/scratch/bufferline.nvim/lua/bufferline/utils.lua'
  }
end

describe('impatient', function()
  local function reset()
    clear()
    nvim07 = exec_lua('return vim.version().minor') == 7
    cmd [[set runtimepath=$VIMRUNTIME,.,./test]]
    cmd [[let $XDG_CACHE_HOME='scratch/cache']]
    cmd [[set packpath=]]
  end

  before_each(function()
    reset()
  end)

  it('load plugins without impatient', function()
    exec_lua([[require('plugins')]])
  end)

  local function run()
    exec_lua[[
      require('impatient')
      require('plugins')
      _G.__luacache.save_cache()
    ]]
  end

  it('creates cache', function()
    os.execute[[rm -rf scratch/cache]]
    run()
    eq(gen_exp_cold(), exec_lua("return _G.__luacache.log"))
  end)

  it('loads cache', function()
    run()
    eq(gen_exp_hot(), exec_lua("return _G.__luacache.log"))
  end)

end)
