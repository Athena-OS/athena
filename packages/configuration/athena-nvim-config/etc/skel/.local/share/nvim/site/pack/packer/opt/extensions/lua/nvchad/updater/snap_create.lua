local function snap_create()
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

  -- return if we are already on a snapshot branch
  if current_branch_name:match(defaults.snaps.base_snap_branch_name .. "(.+)" .. "$") then
    echo(misc.list_text_replace(prompts.already_on_snapshot_branch, "<SNAP_NAME>", current_branch_name))
    return
  end

  -- check if we are on the correct update branch, if not, switch to it
  if not git.checkout_branch(git.update_branch) then
    return
  end

  -- ask the user for the name of the new snapshot
  echo(prompts.snapshot_enter_name)
  local name = vim.trim(vim.fn.input "-> ")

  misc.print_padding("\n", 2)

  if string.lower(name) == "c" or name == "" then
    echo(misc.list_text_replace(prompts.cancelled_action, "<ACTION>", "NvChadSnapshotCreate"))
    return
  end

  -- make sure that chadrc.lua exists, if not create it as a copy of the example file
  local result = misc.ensure_file_exists(defaults.custom.default_chadrc_path, misc.get_example_chadrc())

  -- if the default custom config could not be created return
  if not result then
    echo(misc.list_text_replace(prompts.chadrc_file_not_created, "<FILE_PATH>", defaults.custom.default_chadrc_path))
    return false
  end

  -- generate the snapshot name
  local branch_name = defaults.snaps.base_snap_branch_name .. misc.replace_whitespaces(name)

  -- create a commit message for the squash commit including the hash of the current HEAD
  local squash_commit_msg = defaults.snaps.base_commit_message .. git.get_local_head()

  -- create a backup of the current custom dir in the git stash and restore the repo state
  if git.add('"' .. defaults.custom.config_dir_rel .. '"', "-f") then
    echo(misc.list_text_replace(prompts.stashing_custom_dir, "<STASH_NAME>", config_stash_name))
    misc.print_padding("\n", 1)

    git.stash(
      "store",
      '"$(git  -C ' .. git.config_path .. " stash create " .. defaults.custom.config_dir_rel .. ')"',
      "-m " .. config_stash_name
    )
    git.restore("--staged", defaults.custom.config_dir_rel)
  end

  -- drop old config backup stash entries (we only keep the 4 newest entries for safety)
  git.stash_action_for_entry_by_name("drop", defaults.snaps.base_config_stash_name, 4)

  -- check if a branch with the generated snapshot name already exists
  while git.checkout_branch(branch_name, true) do
    -- if a snapshot branch with the generated name already exists, offer next actions
    echo(misc.list_text_replace(prompts.branch_already_exists, "<BRANCH_NAME>", branch_name))
    name = string.lower(vim.fn.input "-> ")

    misc.print_padding("\n", 2)

    -- the user can overwrite the existing snapshot, change the new snapshot's name or cancel
    if name == "o" then
      if not git.checkout_branch(git.update_branch) then
        return
      end
      if not git.stash "apply" then
        return
      end
      if not git.delete_branch(branch_name) then
        return
      end

      echo(misc.list_text_replace(prompts.branch_deleted, "<BRANCH_NAME>", branch_name))
      break
    elseif name == "c" then
      if not git.checkout_branch(git.update_branch) then
        return
      end

      echo(misc.list_text_replace(prompts.switched_to_update_branch, "<UPDATE_BRANCH>", git.update_branch))

      if not git.stash "pop" then
        return
      end
      return
    else
      branch_name = defaults.snaps.base_snap_branch_name .. misc.replace_whitespaces(name)

      if not git.checkout_branch(git.update_branch) then
        return
      end
      if not git.stash "apply" then
        return
      end
    end
  end

  echo(misc.list_text_replace(prompts.snapshot_creating_branch, "<BRANCH_NAME>", branch_name))

  -- create a packer snapshot
  packer.snapshot(branch_name)

  -- create and checkout snapshot branch
  if not git.create_branch(branch_name) then
    git.stash "drop"
    return
  end

  -- force stage the custom folder
  if not git.add('"' .. defaults.custom.config_dir_rel .. '"', "-f") then
    return
  end

  -- create a temporary commit to add our changes in chadrc.lua to the git history
  if not git.commit("-m '" .. defaults.snaps.base_tmp_commit_message .. branch_name .. "'") then
    echo(prompts.commit_failed)
    return
  end

  -- retrieve the current git author's identity
  local success, author, email, time_zone = git.get_author_identity()

  -- this should not fail but if it does we might have to handle it more gracefully in the future
  if not success then
    return
  end

  echo(misc.list_text_replace(prompts.snapshot_compressing_branch, "<BRANCH_NAME>", branch_name))

  -- squash commit history to save storage space and change commit ownership
  if not git.squash_commit_history(squash_commit_msg, author, email, time_zone) then
    return
  end

  misc.print_padding("\n", 1)
  echo(misc.list_text_replace(prompts.snapshot_successfully_created, "<SNAP_NAME>", branch_name))

  -- return to the update branch after creating the snapshot
  if not git.checkout_branch(git.update_branch) then
    return
  end

  -- the previously stashed custom directory will have to be reapplied
  git.stash_action_for_entry_by_name("apply", defaults.snaps.base_config_stash_name, 0, 1)

  -- since the custom dir should be ignored in the git history, we restore the staged files
  if not git.restore("--staged", defaults.custom.config_dir_rel) then
    return
  end

  -- ask the user if the update or the snapshot branch should be used
  misc.print_padding("\n", 1)
  echo(
    misc.list_text_replace(
      prompts.snapshot_stay_or_return,
      { "<BRANCH_NAME>", "<UPDATE_BRANCH>" },
      { branch_name, git.update_branch }
    )
  )

  local stay_on_snap = vim.trim(string.lower(vim.fn.input "-> "))

  -- if the user chose to return to the update branch we don't have to do anything
  if stay_on_snap == "r" then
    return
  end

  -- if the user would like to use the new snapshot we will have to checkout the new branch
  if not git.checkout_branch(branch_name) then
    return
  end

  -- rollback to selected snapshot
  misc.print_padding("\n", 2)
  echo(prompts.wait_for_rollback_to_complete)

  packer.rollback(branch_name)
end

return snap_create
