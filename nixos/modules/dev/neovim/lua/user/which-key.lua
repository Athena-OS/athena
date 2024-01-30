local status_ok, which_key = pcall(require, "which-key")
if not status_ok then
  return
end

local setup = {
  layout = {
    height = { min = 4, max = 25 }, -- min and max height of the columns
    width = { min = 20, max = 50 }, -- min and max width of the columns
    spacing = 3,                    -- spacing between columns
    align = "center",               -- align columns left, center or right
  },
  ignore_missing = true,            -- enable this to hide mappings for which you didn't specify a label
  show_help = false,                -- show help message on the command line when the popup is visible
}

local opts = {
  mode = "n",     -- NORMAL mode
  prefix = "<leader>",
  buffer = nil,   -- Global mappings. Specify a buffer number for buffer local mappings
  silent = true,  -- use `silent` when creating keymaps
  noremap = true, -- use `noremap` when creating keymaps
  nowait = true,  -- use `nowait` when creating keymaps
}

local mappings = {
  ["e"] = { "<cmd>NvimTreeToggle<cr>", "Explorer" },
  ["Q"] = { "<cmd>qa!<CR>", "Quit Neovim" },
  ["w"] = { "<cmd>w!<CR>", "Save" },
  ["/"] = { '<cmd>lua require("Comment.api").toggle.linewise.current()<CR>', "Comment" },
  b = {
    name = "Buffer",
    a = {
      "<cmd>lua require('telescope.builtin').buffers(require('telescope.themes').get_dropdown{previewer = false})<cr>",
      "Active",
    },
    c = { "<cmd>BufferClose<CR>", "Close" },
    d = { "<cmd>q!<CR>", "Delete" },
    n = { "<cmd>enew<CR>", "New" },
  },
  d = {
    name = "Debug",
    t = { "<cmd>lua require'dap'.toggle_breakpoint()<cr>", "Toggle Breakpoint" },
    c = { "<cmd>lua require'dap'.run_to_cursor()<cr>", "Run To Cursor" },
    d = { "<cmd>lua require'dap'.disconnect()<cr>", "Disconnect" },
    g = { "<cmd>lua require'dap'.session()<cr>", "Get Session" },
    h = { "<cmd>lua require'dap.ui.widgets'.hover()<cr>", "Hover" },
    p = { "<cmd>lua require'dap'.pause()<cr>", "Pause" },
    r = { "<cmd>lua require'dap'.repl.toggle()<cr>", "Toggle Repl" },
    q = { "<cmd>lua require'dap'.close()<cr>", "Quit" },
    u = { "<cmd>lua require'dapui'.toggle({reset = true})<cr>", "Toggle UI" },
  },
  f = {
    name = "Files",
    f = {
      "<cmd>Telescope find_files hidden=true theme=dropdown<cr>",
      "Find" },
    g = { "<cmd>Telescope live_grep<cr>", "Grep" },
    h = { "<cmd>Telescope oldfiles<CR>", "Recents" },
    l = { "<cmd>Telescope resume<cr>", "Resume last search" },
  },
  g = {
    name = "Git",
    g = { "<cmd>lua LazygitToggle()<CR>", "Lazygit" },
    j = { "<cmd>lua require 'gitsigns'.next_hunk()<cr>", "Next Hunk" },
    k = { "<cmd>lua require 'gitsigns'.prev_hunk()<cr>", "Prev Hunk" },
    l = { "<cmd>GitBlameToggle<cr>", "Blame" },
    o = { "<cmd>GitBlameOpenCommitURL<cr>", "Open Commit In Browser" },
    p = { "<cmd>lua require 'gitsigns'.preview_hunk()<cr>", "Preview Hunk" },
    d = {
      name = "Diffview",
      o = {
        "<cmd>DiffviewOpen<cr>",
        "Diff open",
      },
      c = {
        "<cmd>DiffviewClose<cr>",
        "Diff close",
      },
      r = {
        "<cmd>DiffviewRefresh<cr>",
        "Diff refresh",
      },
    }
  },
  h = {
    name = "Harpoon",
    a = { "<cmd>lua require('harpoon'):list():append()<cr>", "Add File" },
    c = { "<cmd>lua require('harpoon'):list():clear()<cr>", "Clear List" },
    e = { "<cmd>lua require('harpoon').ui:toggle_quick_menu(require('harpoon'):list())<cr>", "Quick Menu" },
  },
  l = {
    name = "LSP",
    a = { "<cmd>lua vim.lsp.buf.code_action()<cr>", "Code Action" },
    f = { "<cmd>lua vim.lsp.buf.format({async=true})<cr>", "Format" },
    F = { "<cmd>LspToggleAutoFormat<cr>", "Toggle Autoformat" },
    i = { "<cmd>LspInfo<cr>", "Info" },
    I = { "<cmd>Mason<cr>", "Installer Info" },
    j = {
      "<cmd>lua vim.diagnostic.goto_next({buffer=0})<CR>",
      "Next Diagnostic",
    },
    k = {
      "<cmd>lua vim.diagnostic.goto_prev({buffer=0})<cr>",
      "Prev Diagnostic",
    },
    l = { "<cmd>lua vim.lsp.codelens.run()<cr>", "CodeLens Action" },
    q = { "<cmd>lua vim.diagnostic.setloclist()<cr>", "Quickfix" },
    r = { "<cmd>lua vim.lsp.buf.rename()<cr>", "Rename" },
    s = { "<cmd>Telescope lsp_document_symbols<cr>", "Document Symbols" },
    S = {
      "<cmd>Telescope lsp_dynamic_workspace_symbols<cr>",
      "Workspace Symbols",
    },
  },
  n = {
    name = "Neovim",
    c = { "<cmd>Telescope colorscheme<cr>", "Colorscheme" },
    d = { "<cmd>Dashboard<CR>", "Dashboard" },
    e = { "<cmd>edit $MYVIMRC<cr>", "Edit Configuration" },
    r = { "<cmd>:e %<cr>", "Reload File" },
    t = { "<cmd>lua TerminalToggle()<CR>", "Terminal" },
    p = { "<cmd>:Lazy<cr>", "Plugin management" },
    u = { "<cmd>:Lazy sync<cr>", "Update" },
  },
  s = {
    name = "Session",
    r = { "<cmd>lua require('persistence').load()<cr>", "Restore Session" },
    s = { "<cmd>lua require('persistence').stop()<cr>", "Stop Running Session" },
  },
  t = {
    name = "Testing",
    d = { "<cmd>lua require('neotest').run.run({strategy = 'dap'})<cr>", "Debug This Test" },
    f = { "<cmd>lua require'neotest'.run.run(vim.fn.expand('%'))<cr>", "Run File" },
    r = { "<cmd>lua require'neotest'.run.run()<cr>", "Run This Test" },
    t = {
      name = "Toggle",
      p = { "<cmd>lua require'neotest'.output_panel.toggle()<cr>", "Toggle Panel" },
      s = { "<cmd>lua require'neotest'.summary.toggle()<cr>", "Toggle File Summary" },
      S = {
        function()
          require('neotest').setup({
            discovery = {
              enabled = true,
            },
            quickfix = {
              enabled = true,
              open = false,
            },
            adapters = {
              require('neotest-jest')({}),
            },
            summary = {
              open = "topleft vsplit | vertical resize 50"
            }
          })

          require 'neotest'.summary.toggle()
        end, "Toggle Full Summary" }
    },
  },
}

local vopts = {
  mode = "v",     -- VISUAL mode
  prefix = "<leader>",
  buffer = nil,   -- Global mappings. Specify a buffer number for buffer local mappings
  silent = true,  -- use `silent` when creating keymaps
  noremap = true, -- use `noremap` when creating keymaps
  nowait = true,  -- use `nowait` when creating keymaps
}

local vmappings = {
  ["/"] = { '<ESC><CMD>lua require("Comment.api").toggle.linewise(vim.fn.visualmode())<CR>', "Comment" },
  s = { "<esc><cmd>'<,'>SnipRun<cr>", "Run range" },
}

which_key.setup(setup)
which_key.register(mappings, opts)
which_key.register(vmappings, vopts)
