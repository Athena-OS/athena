local utils = require "nvchad"
local misc = require "nvchad.utils.misc"
local prompts = require "nvchad.utils.prompts"
local echo = utils.echo

local M = {}

M.config_path = vim.fn.stdpath "config"
M.current_config = require("core.utils").load_config()
M.update_url = M.current_config.options.nvChad.update_url or "https://github.com/NvChad/NvChad"
M.update_branch = M.current_config.options.nvChad.update_branch or "main"
M.current_sha, M.backup_sha, M.remote_sha = "", "", ""
M.breaking_change_patterns = { "breaking.*change" }

-- on failing, restore to the last repo state, including untracked files
M.restore_repo_state = function()
  utils.cmd(
    "git -C "
      .. M.config_path
      .. " reset --hard "
      .. M.current_sha
      .. " ; git -C "
      .. M.config_path
      .. " cherry-pick -n "
      .. M.backup_sha
      .. " ; git reset",
    false
  )
end

-- get the current sha of the remote HEAD
M.get_remote_head = function(branch)
  local result = utils.cmd("git -C " .. M.config_path .. " ls-remote --heads origin " .. branch, true)

  if result then
    return result:match "([%w\\_\\-.]*)"
  end

  return ""
end

-- get the current sha of the local HEAD
M.get_local_head = function()
  local result = utils.cmd("git -C " .. M.config_path .. " rev-parse HEAD", false)

  if result then
    return result:match "([%w\\_\\-.]*)"
  end

  return ""
end

M.commit = function(...)
  local args = misc.table_pack(...)
  args.n = nil

  local result = utils.cmd("git -C " .. M.config_path .. " commit " .. (... and table.concat(args, " ") or ""), false)

  if result then
    return true
  end

  return false
end

-- check if the NvChad directory is a valid git repo
M.validate_dir = function(commit_msg)
  local valid = true
  commit_msg = commit_msg or "tmp"

  -- save the current sha of the local HEAD
  M.current_sha = M.get_local_head()

  -- check if the config folder is a valid git directory
  if M.current_sha ~= "" then
    -- create a tmp snapshot of the current repo state
    M.commit("-a", "-m", "'" .. commit_msg .. "'")
    M.backup_sha = M.get_local_head()

    if M.backup_sha == "" then
      valid = false
    end
  else
    valid = false
  end

  if not valid then
    M.restore_repo_state()
    echo(misc.list_text_replace(prompts.not_a_git_dir, "<CONFIG_PATH>", M.config_path))
    return false
  end

  return true
end

-- checkout a given branch
M.checkout_branch = function(branch, silent)
  utils.cmd("git -C " .. M.config_path .. " checkout " .. branch, not silent)
  local current_branch_name = M.get_current_branch_name()

  if current_branch_name == branch then
    return true
  end

  if not silent then
    echo(
      misc.list_text_replace(
        prompts.checkout_failed,
        { "<NEW_BRANCH_NAME>", "<OLD_BRANCH_NAME>" },
        { branch, current_branch_name }
      )
    )
  end

  return false
end

-- returns the currently checked out branch name
M.get_current_branch_name = function()
  local result = utils.cmd("git -C " .. M.config_path .. " rev-parse --abbrev-ref HEAD", false)

  if result then
    return result:match "([%w\\_%-./]*)"
  end

  return ""
end

M.branch = function(...)
  local args = misc.table_pack(...)
  args.n = nil
  local command = (... and table.concat(args, " ") or "")

  local result = utils.cmd("git -C " .. M.config_path .. " branch " .. command, false)

  if not result then
    echo(
      misc.list_text_replace(
        prompts.branch_failed,
        { "<BRANCH_ACTION>" },
        { "git -C " .. M.config_path .. " branch " .. command }
      )
    )
    return false
  end

  return result
end

M.get_branch_list = function(filter)
  local result = M.branch "--list"

  if result then
    local branch_list = vim.fn.split(result, "\n")
    branch_list = vim.tbl_map(vim.trim, branch_list)

    if type(filter) == "function" then
      return vim.tbl_filter(filter, branch_list)
    end

    return branch_list
  end

  return {}
end

-- returns the currently checked out branch name
M.reset = function(...)
  local args = misc.table_pack(...)
  args.n = nil

  local result = utils.cmd("git -C " .. M.config_path .. " reset " .. (... and table.concat(args, " ") or ""), false)

  if not result then
    echo(prompts.reset_failed)
    return false
  end

  return true
end

-- returns the currently checked out branch name
M.restore = function(...)
  local args = misc.table_pack(...)
  args.n = nil

  local result = utils.cmd("git -C " .. M.config_path .. " restore " .. (... and table.concat(args, " ") or ""), false)

  if not result then
    echo(prompts.restore_failed)
    return false
  end

  return true
end

M.delete_file = function(file_path, cached)
  local result = utils.cmd("git -C " .. M.config_path .. " rm " .. (cached and "--cached " or "") .. file_path)

  if not result then
    echo(misc.list_text_replace(prompts.delete_file_failed, "<FILE_NAME>", file_path))
    return false
  end

  return true
end

-- returns the latest commit message in the git history
M.get_last_commit_message = function()
  local result = utils.cmd("git -C " .. M.config_path .. " log -1 --pretty=%B", false)

  if result then
    return result:match "([%w\\_\\-.]*)"
  end

  return ""
end

-- get all commits between two points in the git history as a list of strings
M.get_commit_list_by_hash_range = function(start_hash, end_hash)
  local commit_list_string = utils.cmd(
    "git -C "
      .. M.config_path
      .. ' log --oneline --no-merges --decorate --date=short --pretty="format:%ad: %h %s" '
      .. start_hash
      .. ".."
      .. end_hash,
    true
  )

  if commit_list_string == nil then
    return nil
  end

  return vim.fn.split(commit_list_string, "\n")
end

M.create_branch = function(branch_name)
  local result = utils.cmd("git -C " .. M.config_path .. " checkout -b " .. branch_name, true)

  if result then
    return true
  end

  echo(misc.list_text_replace(prompts.create_branch_failed, "<BRANCH_NAME>", branch_name))
  return false
end

M.delete_branch = function(branch_name)
  local result = M.branch("-D", branch_name)

  if result then
    return true
  end

  echo(misc.list_text_replace(prompts.branch_delete_failed, "<BRANCH_NAME>", branch_name))
  return false
end

M.is_shallow = function()
  local result = utils.cmd("git -C " .. M.config_path .. " rev-parse --is-shallow-repository", false)

  if result and result:match "true" then
    return true
  end

  return false
end

M.add = function(...)
  local args = misc.table_pack(...)
  args.n = nil

  local result = utils.cmd("git -C " .. M.config_path .. " add " .. (... and table.concat(args, " ") or ""), true)

  if result then
    return true
  end

  echo(misc.list_text_replace(prompts.add_failed, "<FILE_PATH>", args[#args - 1]))
end

M.get_initial_commit_hash = function()
  local result = utils.cmd("git -C " .. M.config_path .. " rev-list --max-parents=0 HEAD", false)

  if result then
    return result:match "([%w\\_\\-.]*)"
  end

  echo(prompts.get_initial_commit_hash_failed)
  return false
end

-- squash all commits in history after the start commit
M.squash_commits_from_hash = function(start_hash)
  local result = utils.cmd("git -C " .. M.config_path .. " reset --soft " .. start_hash, true)

  if result then
    return true
  end

  echo(prompts.squash_failed)
  return false
end

M.get_author_identity = function()
  local author_name = utils.cmd("git -C " .. M.config_path .. " config --get user.name", false)
  local author_email = utils.cmd("git -C " .. M.config_path .. " config --get user.email", false)
  local author_time_zone = os.date "%Y-%m-%d %H:%M:%S %z"

  if author_name or author_email or author_time_zone then
    return true, author_name, author_email, author_time_zone
  end

  echo(prompts.get_author_identity_failed)
  return false, nil, nil, nil
end

M.squash_commit_history = function(commit_message, author_name, author_email, author_time_zone)
  -- get hash of first commit in history
  local first_commit_hash = M.get_initial_commit_hash()

  if not first_commit_hash then
    return false
  end

  -- squash all commits in history after the first commit
  local reset_state = M.squash_commits_from_hash(first_commit_hash)

  if not reset_state then
    return false
  end

  -- commit the squashed history
  local commit_state = M.commit(
    "-m " .. commit_message,
    (author_name and " --author='" .. author_name or "")
      .. (author_name and author_email and " <" .. author_email .. ">'" or ""),
    (author_time_zone and " --date='" .. author_time_zone .. "'" or ""),
    "--amend"
  )

  if not commit_state then
    return false
  end

  return true
end

M.fetch_head = function()
  local shallow = M.is_shallow() and "--unshallow " or ""

  -- fetch remote silently
  local fetch_status = utils.cmd(
    "git -C "
      .. M.config_path
      .. " fetch --quiet --prune --no-tags "
      .. shallow
      .. "--no-recurse-submodules origin "
      .. M.update_branch,
    true
  )

  if fetch_status == nil then
    M.restore_repo_state()
    echo(prompts.remote_head_changes_fetch_failed)
    return false
  end

  return true
end

-- return a list of all stashes in the git history
M.get_stash_list = function()
  local stash_list_string = utils.cmd("git -C " .. M.config_path .. " stash list", true)

  if stash_list_string == nil then
    return nil
  end

  return vim.fn.split(stash_list_string, "\n")
end

M.stash = function(...)
  local args = misc.table_pack(...)
  args.n = nil

  local result = utils.cmd("git -C " .. M.config_path .. " stash " .. (... and table.concat(args, " ") or ""), true)

  if result then
    return true
  end

  echo(prompts.stash_failed)
  return false
end

M.stash_action_for_entry_by_name = function(action, stash_name, min, max)
  local stash_list = M.get_stash_list()
  local found_entries = 0
  local handled_entries = 0

  if stash_list == nil then
    return false
  end

  for i, stash in ipairs(stash_list) do
    if stash:match(stash_name) then
      found_entries = found_entries + 1
      if not min or found_entries > min then
        if max and max - found_entries < 0 then
          break
        end
        local result = M.stash(action, "stash@{" .. i - 1 - handled_entries .. "}")
        if result then
          handled_entries = handled_entries + 1
        end
      end
    end
  end

  return handled_entries > 0
end

-- if the updater failed to remove the last tmp commit remove it
M.check_for_leftover_tmp_commit = function()
  local last_commit_message = M.get_last_commit_message()

  if last_commit_message:match "^tmp$" then
    echo(prompts.removing_tmp_commit)
    local pre_stash_count = #M.get_stash_list()

    -- push unstaged changes to stash if there are any
    M.stash()

    -- remove the tmp commit
    M.reset("HEAD~1", "--hard")

    -- if local changes were stashed, try to reapply them
    if #M.get_stash_list() > pre_stash_count then
      echo(prompts.modifications_detected_stash)

      -- force pop the stash
      local stash_pop = utils.cmd(
        "git -C "
          .. M.config_path
          .. " stash show -p | git -C "
          .. M.config_path
          .. " apply && git -C "
          .. M.config_path
          .. " stash drop",
        true
      )

      if stash_pop then
        echo(prompts.modifications_detected_stash_restored)
      else
        echo(prompts.modifications_detected_stash_restore_failed)
      end
    end

    misc.print_padding("\n", 1)
  end
end

-- reset the repo to the remote's HEAD and clean up
M.reset_to_remote_head = function()
  -- reset to remote HEAD
  local reset_status = utils.cmd("git -C " .. M.config_path .. " reset --hard origin/" .. M.update_branch, true)

  if reset_status == nil then
    M.restore_repo_state()
    utils.clear_last_echo()
    echo(prompts.reset_remote_head_failed)
    return false
  end

  utils.clear_last_echo()
  echo(misc.list_text_replace(prompts.reset_remote_head_success_status, "<RESET_STATUS>", reset_status))

  -- clean up the repo
  local clean_status = utils.cmd("git -C " .. M.config_path .. " clean -f -d", true)

  if clean_status == nil then
    M.restore_repo_state()
    echo(prompts.clean_repo_dir_failed)
    return false
  end

  echo(prompts.clean_repo_dir_success)

  return true
end

M.reset_to_local_head = function()
  utils.cmd("git -C " .. M.config_path .. " reset --hard " .. M.current_sha, true)
end

-- filter string list by regex pattern list
M.filter_commit_list = function(commit_list, patterns)
  local counter = 0

  return vim.tbl_filter(function(line)
    -- update counter and print current progress

    counter = counter + 1
    misc.print_progress_percentage(prompts.analyzing_commits[1][1], "String", counter, #commit_list, true)

    -- normalize current commit
    local normalized_line = string.lower(line)

    -- check if the commit message matches any of the patterns
    for _, pattern in ipairs(patterns) do
      -- match the pattern against the normalized commit message
      if vim.fn.match(normalized_line, pattern) ~= -1 then
        return true
      end
    end

    return false
  end, commit_list),
    counter or nil,
    counter
end

-- prepare the string representation of a commit list and return a list of lists to use with echo
M.prepare_commit_table = function(commit_list)
  local output = { { "" } }

  for _, line in ipairs(commit_list) do
    -- split line into date hash and message. Expected format: "yyyy-mm-dd: hash message"
    local commit_date, commit_hash, commit_message = line:match("(%d%d%d%d%-%d%d%-%d%d): " .. "(%w+)(.*)")

    -- merge commit messages into one output array to minimize echo calls
    vim.list_extend(output, {
      { "    " },
      { tostring(commit_date) },
      { " " },
      { tostring(commit_hash), "WarningMsg" },
      { tostring(commit_message), "String" },
      { "\n" },
    })
  end

  return output
end

-- check for breaking changes in the current branch
M.check_for_breaking_changes = function(current_head, remote_head)
  -- if the remote HEAD is equal to the current HEAD we are already up to date
  if remote_head == current_head then
    utils.clear_last_echo()
    echo(misc.list_text_replace(prompts.update_cancelled_up_to_date, "<UPDATE_BRANCH>", M.update_branch))
    return false
  end

  utils.clear_last_echo()
  echo(
    misc.list_text_replace(
      prompts.remote_info,
      { "<UPDATE_URL>", "<UPDATE_BRANCH>" },
      { M.update_url, M.update_branch }
    )
  )

  misc.print_progress_percentage(prompts.remote_head_fetching_changes[1][1], "String", 1, 2, false)

  if not M.fetch_head() then
    return false
  end

  misc.print_progress_percentage(prompts.analyzing_commits[1][1], "String", 2, 2, true)

  -- get all new commits
  local new_commit_list = M.get_commit_list_by_hash_range(current_head, remote_head)

  -- if we did not receive any new commits, we encountered an error
  if new_commit_list == nil or #new_commit_list == 0 then
    utils.clear_last_echo()
    echo(prompts.diverged_branches)
    local continue = string.lower(vim.fn.input "-> ") == "y"
    misc.print_padding("\n", 2)

    if continue then
      return nil, nil
    else
      M.restore_repo_state()
      echo(prompts.update_cancelled)
      return false
    end
  end

  -- get human redable wording
  local hr = misc.get_human_readables(#new_commit_list)

  -- create a summary of the new commits
  local new_commits_summary_list = M.prepare_commit_table(new_commit_list)
  local new_commits_summary = misc.list_text_replace(
    prompts.new_commits_summary,
    { "<HR_HAVE>", "<HR_NEW_COMMIT_LIST>", "<HR_COMMITS>" },
    { hr["have"], #new_commit_list, hr["commits"] }
  )
  vim.list_extend(new_commits_summary, new_commits_summary_list)
  vim.list_extend(new_commits_summary, { { "\n", "String" } })

  utils.clear_last_echo()
  echo(new_commits_summary)

  -- check if there are any breaking changes
  local breaking_changes, counter = M.filter_commit_list(new_commit_list, M.breaking_change_patterns)

  if #breaking_changes == 0 then
    misc.print_progress_percentage(
      prompts.analyzing_commits_done_no_breaking_changes[1][1],
      prompts.analyzing_commits_done_no_breaking_changes[1][2],
      counter,
      #new_commit_list,
      true
    )
  else
    misc.print_progress_percentage(
      prompts.analyzing_commits_done_breaking_changes[1][1],
      prompts.analyzing_commits_done_breaking_changes[1][2],
      counter,
      #new_commit_list,
      true
    )
  end

  -- if there are breaking changes, print a list of them
  if #breaking_changes > 0 then
    hr = misc.get_human_readables(#breaking_changes)
    local breaking_changes_message = misc.list_text_replace(
      prompts.breaking_changes_found,
      { "<BREAKING_CHANGES_COUNT>", "<HR_CHANGE>" },
      { #breaking_changes, hr["change"] }
    )

    vim.list_extend(breaking_changes_message, M.prepare_commit_table(breaking_changes))
    echo(breaking_changes_message)

    -- ask the user if they would like to continue with the update
    echo(prompts.update_continue)
    local continue = string.lower(vim.fn.input "-> ") == "y"
    misc.print_padding("\n", 2)

    if continue then
      return true, true
    else
      M.restore_repo_state()
      echo(prompts.update_cancelled)
      return false
    end
  else
    -- if there are no breaking changes, just update
    misc.print_padding("\n", 1)
    return true
  end
end

return M
