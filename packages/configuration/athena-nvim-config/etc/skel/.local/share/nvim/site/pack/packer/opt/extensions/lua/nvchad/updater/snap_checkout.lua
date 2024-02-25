local function snap_checkout()
  local packer = require "packer"
  local utils = require "nvchad"
  local git = require "nvchad.utils.git"
  local misc = require "nvchad.utils.misc"
  local defaults = require "nvchad.utils.config"
  local prompts = require "nvchad.utils.prompts"
  local echo = utils.echo
  local config_stash_name = defaults.snaps.base_config_stash_name .. os.date "%Y-%m-%d_%H:%M:%S_%z"
  local current_branch_name = git.get_current_branch_name()

  -- BETA DISCLAIMER: This feature is still in BETA. If you encounter any issues contact
  -- @LeonHeidelbach on GitHub by creating an issue in the main NvChad repo.
  echo(prompts.beta_disclaimer)
  misc.print_padding("\n", 1)

  -- check if the current repo contains any snapshots and store them in a table
  local snapshot_list = git.get_branch_list(function(branch)
    return branch:match(defaults.snaps.base_snap_branch_name)
  end)

  -- return if no snapshots could be found
  if #snapshot_list == 0 then
    echo(prompts.no_snapshots_found)
    return
  end

  -- prepend the update branch to the list of available checkout branches
  snapshot_list = vim.list_extend({ git.update_branch }, snapshot_list)

  -- prepare the output string containing the list of all snapshots
  local snapshot_list_str = {}

  -- add the introductory prompt to the string
  vim.list_extend(snapshot_list_str, prompts.select_snapshot_to_checkout)

  -- add the snapshots to the list, mark the update branch and the branch that is currently in use
  for i, snapshot in ipairs(snapshot_list) do
    -- the checked out branch will contain "*" at the beginning of the branch name, remove it
    if snapshot:match("\\* " .. current_branch_name .. "$") then
      snapshot_list[i] = current_branch_name
      snapshot = current_branch_name
    end

    -- add the formatted snapshot string to the list
    vim.list_extend(
      snapshot_list_str,
      {
        { "    [" .. tostring(i) .. "] " },
        { (snapshot == git.update_branch and "  " or "") .. snapshot, "Title" },
        { (current_branch_name == snapshot and " (currently in use)" or "") },
        { "\n" },
      }
    )
  end

  -- add the selection prompt to the list string and print it
  vim.list_extend(snapshot_list_str, prompts.select_snapshot_to_checkout_enter_index)

  echo(snapshot_list_str)

  -- trim user input and switch to lower case representation
  local selection = vim.trim(string.lower(vim.fn.input "-> "))

  misc.print_padding("\n", 2)

  -- if the checkout was cancelled print the cancellation message and return
  if selection == "c" then
    echo(misc.list_text_replace(prompts.cancelled_action, "<ACTION>", "NvChadSnapshotCheckout"))
    return
  end

  -- extract the number value from the user input
  local number = tonumber(selection)

  -- check if the input is a valid snapshot index, print prompt if not and return
  if type(number) ~= "number" or number < 1 or number > #snapshot_list then
    echo(prompts.invalid_input)
    return
  end

  -- check if the selected branch is the update branch
  local selected_is_update_branch = snapshot_list[number] == git.update_branch

  -- if the selected branch is the current branch, print prompt and return
  if snapshot_list[number] == current_branch_name then
    if selected_is_update_branch then
      echo(misc.list_text_replace(prompts.already_on_selected_update_branch, "<SNAP_NAME>", snapshot_list[number]))
    else
      echo(misc.list_text_replace(prompts.already_on_selected_snapshot_branch, "<SNAP_NAME>", snapshot_list[number]))
    end

    return
  end

  -- if the current branch is the update branch we will have to create a new git stash entry
  if current_branch_name == git.update_branch then
    -- make sure that chadrc.lua exists, if not create it as a copy of the example
    local result = misc.ensure_file_exists(defaults.custom.default_chadrc_path, misc.get_example_chadrc())

    -- if the default custom config could not be created return
    if not result then
      echo(misc.list_text_replace(prompts.chadrc_file_not_created, "<FILE_PATH>", defaults.custom.default_chadrc_path))
      return false
    end

    -- create a backup of the current custom dir in the git stash and restore the repo state
    if git.add('"' .. defaults.custom.config_dir_rel .. '"', "-f") then
      echo(misc.list_text_replace(prompts.stashing_custom_dir, "<STASH_NAME>", config_stash_name))

      git.stash(
        "store",
        '"$(git  -C ' .. git.config_path .. " stash create " .. defaults.custom.config_dir_rel .. ')"',
        "-m " .. config_stash_name
      )
      git.restore("--staged", defaults.custom.config_dir_rel)
    end

    -- drop old config backup stash entries (we only keep the 4 newest entries for safety)
    git.stash_action_for_entry_by_name("drop", defaults.snaps.base_config_stash_name, 4)
    misc.print_padding("\n", 1)
  elseif current_branch_name:match(defaults.snaps.base_snap_branch_name) then
    -- if the current branch is a snapshot branch we commit potential changes
    git.commit("-a", "-m", defaults.snaps.base_custom_changes_commit_message .. os.date "%Y-%m-%d_%H:%M:%S_%z")
  end

  -- check out the selected branch
  if not git.checkout_branch(snapshot_list[number]) then
    return
  end

  -- if the selected branch is the update branch we will have to restore the custom dir from stash
  if selected_is_update_branch then
    if vim.fn.isdirectory(defaults.custom.config_dir_abs) == 0 then
      if git.stash "apply" then
        git.restore("--staged", defaults.custom.config_dir_rel)
      else
        echo(misc.list_text_replace(prompts.applying_git_stash_failed, "<BRANCH_NAME>", snapshot_list[number]))
      end
    end
  elseif snapshot_list[number]:match(defaults.snaps.base_snap_branch_name) then
    -- rollback to selected snapshot
    misc.print_padding("\n", 2)
    echo(prompts.wait_for_rollback_to_complete)

    packer.rollback(snapshot_list[number])
  end

  -- print success message
  echo(misc.list_text_replace(prompts.checkout_success, "<NEW_BRANCH_NAME>", snapshot_list[number]))
end

return snap_checkout
