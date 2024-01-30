local status_ok, gitsigns = pcall(require, "gitsigns")
if not status_ok then
  return
end

local git_blame_status_ok, gitblame = pcall(require, "gitblame")
if not git_blame_status_ok then
  return
end

gitsigns.setup {
  signs = {
    add          = { hl = 'GitSignsAdd'   , text = "▎", numhl='GitSignsAddNr'   , linehl='GitSignsAddLn'    },
    change       = { hl = 'GitSignsChange', text = "▎", numhl='GitSignsChangeNr', linehl='GitSignsChangeLn' },
    delete       = { hl = 'GitSignsDelete', text = "󰐊", numhl='GitSignsDeleteNr', linehl='GitSignsDeleteLn' },
    topdelete    = { hl = 'GitSignsDelete', text = "󰐊", numhl='GitSignsDeleteNr', linehl='GitSignsDeleteLn' },
    changedelete = { hl = 'GitSignsChange', text = "▎", numhl='GitSignsChangeNr', linehl='GitSignsChangeLn' },
  },
}

gitblame.setup{
  enabled = false
}
