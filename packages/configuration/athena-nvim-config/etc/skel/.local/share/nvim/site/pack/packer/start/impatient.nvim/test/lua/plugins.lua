
local init = {
  ['neovim/nvim-lspconfig']       = '2f026f21',
  ['nvim-lua/plenary.nvim']       = '06266e7b',
  ['nvim-lua/telescope.nvim']     = 'ac42f0c2',
  ['lewis6991/gitsigns.nvim']     = 'daa233aa',
  ['lewis6991/spellsitter.nvim']  = '7f9e8471',
  ['norcalli/nvim-colorizer.lua'] = '36c610a9',
  ['akinsho/bufferline.nvim']     = 'bede234e'
}

local testdir = 'scratch'

vim.fn.system{"mkdir", testdir}

for plugin, sha in pairs(init) do
  local plugin_dir = plugin:match('.*/(.*)')
  local plugin_dir2 = testdir..'/'..plugin_dir
  vim.fn.system{
    'git', '-C', testdir, 'clone',
    'https://github.com/'..plugin, plugin_dir
  }

  -- local rev = (vim.fn.system{
  --   'git', '-C', plugin_dir2,
  --   'rev-list', 'HEAD', '-n', '1', '--first-parent', '--before=2021-09-05'
  -- }):sub(1,-2)

  -- if sha then
  --   assert(vim.startswith(rev, sha), ('Plugin sha for %s does match %s != %s'):format(plugin, rev, sha))
  -- end

  vim.fn.system{'git', '-C', plugin_dir2, 'checkout', sha}

  vim.opt.rtp:prepend(vim.loop.fs_realpath("scratch/"..plugin_dir))
end

require'telescope'
require'gitsigns'
require'spellsitter'
require'colorizer'
require'lspconfig'
require'bufferline'
