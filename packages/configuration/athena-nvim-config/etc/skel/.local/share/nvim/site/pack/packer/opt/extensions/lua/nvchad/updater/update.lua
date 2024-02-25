local function update()
  -- in all the comments below, config means user config
  local utils = require "nvchad"
  local git = require "nvchad.utils.git"
  local misc = require "nvchad.utils.misc"
  local defaults = require "nvchad.utils.config"
  local prompts = require "nvchad.utils.prompts"
  local echo = utils.echo
  local current_branch_name = git.get_current_branch_name()
  local continue, skip_confirmation = false, false

  -- check if we are on a snapshot branch
  if current_branch_name:match("^" .. defaults.snaps.base_snap_branch_name) then
    echo(prompts.cannot_update_snapshot)
    return
  end

  -- check if we are on the correct update branch, if not, switch to it
  if not git.checkout_branch(git.update_branch) then
    return
  end

  -- check if the last tmp commit was properly removed, if not remove it
  git.check_for_leftover_tmp_commit()

  local valid_git_dir = git.validate_dir()

  -- return if the directory is not a valid git directory
  if not valid_git_dir then
    return
  end

  echo(prompts.checking_for_updates)

  -- get the current sha of the remote HEAD
  git.remote_sha = git.get_remote_head(git.update_branch)
  if git.remote_sha == "" then
    git.restore_repo_state()
    echo(prompts.remote_head_sha_fetch_failed)
    return
  end

  continue, skip_confirmation = git.check_for_breaking_changes(git.current_sha, git.remote_sha)

  if continue == nil and skip_confirmation == nil then
    echo(prompts.reset_remote_head)

    if not git.reset_to_remote_head() then
      git.restore_repo_state()
      echo(prompts.update_failed)
      return false
    end

    utils.clear_last_echo()
    echo(misc.list_text_replace(prompts.reset_remote_head_success, "<UPDATE_BRANCH>", git.update_branch))

    valid_git_dir = git.validate_dir()

    if not valid_git_dir then
      return
    end
  elseif not continue then
    return
  end

  -- ask the user for confirmation to update because we are going to run git reset --hard
  if git.backup_sha ~= git.current_sha then
    -- prompt user that modifications outside of the custom directory will be lost
    echo(prompts.modifications_detected)
    skip_confirmation = false
  else
    echo(prompts.no_modifications_detected)
  end

  if skip_confirmation then
    misc.print_padding("\n", 1)
  else
    echo(prompts.update_confirm)
    local ans = string.lower(vim.fn.input "-> ") == "y"

    misc.print_padding("\n", 2)

    if not ans then
      git.restore_repo_state()
      echo(prompts.update_cancelled)
      return
    end
  end

  local packer_sync = misc.packer_sync()

  -- function that will executed when git commands are done
  local function update_exit(_, code)
    -- close the terminal buffer only if update was success, as in case of error, we need the
    -- error message
    if code == 0 then
      local summary = {}

      -- check if there are new commits
      local applied_commit_list = git.get_commit_list_by_hash_range(git.current_sha, git.get_local_head())

      if applied_commit_list ~= nil and #applied_commit_list > 0 then
        vim.list_extend(summary, prompts.applied_commits)
        vim.list_extend(summary, git.prepare_commit_table(applied_commit_list))
      else -- no new commits
        vim.list_extend(summary, prompts.commit_summary_failed)
      end

      vim.list_extend(summary, prompts.update_success)

      -- print the update summary
      vim.cmd "bd!"
      echo(summary)
      if packer_sync then
        vim.cmd [[PackerSync]]
      end
    else
      git.restore_repo_state()
      echo(prompts.update_failed_changes_restored)
    end
  end

  -- reset in case config was modified
  git.reset_to_local_head()

  -- use --rebase, to not mess up if the local repo is outdated
  local update_script = table.concat({
    "git pull --set-upstream",
    git.update_url,
    git.update_branch,
    "--rebase",
  }, " ")

  -- check if NvChad is running on windows and pipe the command through cmd.exe
  if vim.fn.has "win32" == 1 then
    update_script = { "cmd.exe", "/C", update_script }
  end

  -- open a new buffer
  vim.cmd "new"

  -- finally open the pseudo terminal buffer
  vim.fn.termopen(update_script, {

    -- change dir to config path so we don't need to move in script
    cwd = git.config_path,
    on_exit = update_exit,
  })
end

return update
