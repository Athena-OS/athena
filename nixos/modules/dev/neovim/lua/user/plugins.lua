local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Install your plugins here
require('lazy').setup({
  -- Base plugins
  "nvim-lua/popup.nvim",   -- An implementation of the Popup API from vim in Neovim
  "nvim-lua/plenary.nvim", -- Useful lua functions used ny lots of plugins

  -- Editor UI
  { -- File tree navigation
    'nvim-tree/nvim-tree.lua',
    dependencies = {
      'nvim-tree/nvim-web-devicons', -- file icons on nvim-tree
    },
  },
  { "folke/which-key.nvim",             event = "VeryLazy" }, -- Keybindings information

  {
    "glepnir/dashboard-nvim",  -- Greeter
  },
  "nvim-lualine/lualine.nvim", -- Status bar
  -- "romgrk/barbar.nvim",      -- Tabs support
  {                            --Bookmarks
    "ThePrimeagen/harpoon",
    branch = "harpoon2",
    commit = "ac9b93984f222865c827e8677f362d0286b9d188",
    dependencies = { { "nvim-lua/plenary.nvim" } }
  },
  "akinsho/toggleterm.nvim", -- Terminal support
  {
    'nvim-telescope/telescope-fzf-native.nvim',
    build =
    'make'
  },
  {
    "nvim-telescope/telescope.nvim",
    dependencies = {
      'nvim-telescope/telescope-fzf-native.nvim', -- file icons on nvim-tree
    },
  },                                              -- Search functionality
  "lukas-reineke/indent-blankline.nvim",          -- Indentation guides
  "anuvyklack/pretty-fold.nvim",                  -- Folding code
  {
    -- Session management
    "folke/persistence.nvim",
    event = "BufReadPre",
    module = "persistence",
    config = function()
      require("persistence").setup()
    end,
  },

  -- Copilot
  {
    "zbirenbaum/copilot.lua",
    event = { "VimEnter" },
    config = function()
      vim.defer_fn(function()
        require "user.copilot"
      end, 100)
    end,
    dependencies = {
      {
        "zbirenbaum/copilot-cmp",
        config = function()
          require("copilot_cmp").setup()
        end
      }
    }
  },

  -- Colorscheme
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    opts = {}
  },
  {
    'rose-pine/neovim',
    as = 'rose-pine',
    lazy = false,
    priority = 1000
  },

  -- Completion
  "hrsh7th/nvim-cmp",         -- The completion plugin
  "hrsh7th/cmp-buffer",       -- buffer completions
  "hrsh7th/cmp-path",         -- path completions
  "hrsh7th/cmp-cmdline",      -- cmdline completions
  "saadparwaiz1/cmp_luasnip", -- snippet completions
  "hrsh7th/cmp-nvim-lua",
  "hrsh7th/cmp-nvim-lsp",

  -- Code Snippets
  "L3MON4D3/LuaSnip",             --snippet engine
  "rafamadriz/friendly-snippets", -- a bunch of snippets to use

  -- LSP
  { "williamboman/mason.nvim" },
  { "williamboman/mason-lspconfig.nvim" },
  "neovim/nvim-lspconfig",                   -- enable LSP
  { "nvimtools/none-ls.nvim", lazy = true }, -- Formatting and Linting per language support
  {
    "ray-x/lsp_signature.nvim",              -- See method signature on LSP suggestions
    config = function()
      require "lsp_signature".setup({
        bind = true, -- This is mandatory, otherwise border config won't get registered.
        handler_opts = {
          border = "rounded"
        }
      }
      )
    end
  },

  -- Syntax highlighting
  {
    'nvim-treesitter/nvim-treesitter',
    build = function()
      pcall(require('nvim-treesitter.install').update { with_sync = true })
    end,
    dependencies = {
      'nvim-treesitter/nvim-treesitter-textobjects',
    }
  },

  -- Debugging
  "mfussenegger/nvim-dap",
  "rcarriga/nvim-dap-ui",
  "theHamsta/nvim-dap-virtual-text",

  -- Testing
  {
    "nvim-neotest/neotest",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
      "antoinemadec/FixCursorHold.nvim",
      "haydenmeade/neotest-jest",
    },
  },

  -- Git
  "lewis6991/gitsigns.nvim",
  "f-person/git-blame.nvim",
  "sindrets/diffview.nvim",

  -- Extra quality of life improvements
  "windwp/nvim-autopairs",   -- Autopairs, integrates with both cmp and and treesitter
  {
    'numToStr/Comment.nvim', -- Allows for commenting code easily
    config = function()
      require('Comment').setup()
    end,
    lazy = true
  },
  { --Helps neovim figure out the correct indentation
    'nmac427/guess-indent.nvim',
    config = function() require('guess-indent').setup {} end,
  },
  {
    "kylechui/nvim-surround",
    version = "*", -- Use for stability; omit to use `main` branch for the latest features
    event = "VeryLazy",
    config = function()
      require("nvim-surround").setup({
        -- Configuration here, or leave empty to use defaults
      })
    end
  },
  {
    "norcalli/nvim-colorizer.lua",
    config = function()
      require("colorizer").setup()
    end,
  },

  -- Improve performance
  -- "nathom/filetype.nvim",
  "lewis6991/impatient.nvim",

  -- Extra language support, enable when needed
  -- ## PURESCRIPT ##
  -- "purescript-contrib/purescript-vim", -- Purescript syntax highlighting
  -- "FrigoEU/psc-ide-vim", -- Adds IDE error diagnostics
  -- "vmchale/dhall-vim", -- Adds dhall config fils highlighting
})
