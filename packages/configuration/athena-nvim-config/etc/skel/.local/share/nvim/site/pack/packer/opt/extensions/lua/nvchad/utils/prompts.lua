M = {}

M.add_failed = { { "Adding ", "WarningMsg" }, { " <FILE_PATH> " }, { " to the staging area failed!", "WarningMsg" } }
M.already_on_selected_snapshot_branch =
  { { "You are already on the selected snapshot branch (", "Title" }, { "<SNAP_NAME>" }, { ").", "Title" } }
M.already_on_selected_update_branch =
  { { "You are already on the selected update branch (", "Title" }, { "<SNAP_NAME>" }, { ").", "Title" } }
M.already_on_snapshot_branch = {
  { "You are already on a snapshot branch (", "WarningMsg" },
  { "<SNAP_NAME>" },
  { "). You cannot create a snapshot of a snapshot.", "WarningMsg" },
}
M.analyzing_commits = { { "Analyzing commits...", "String" } }
M.analyzing_commits_done_breaking_changes = { { "Analyzing commits... Done", "String" } }
M.analyzing_commits_done_no_breaking_changes = { { "No breaking changes in commit list - Analyzed", "Title" } }
M.applied_commits = { { "Applied Commits:\n", "Title" } }
M.applying_git_stash_failed = {
  { "Applying git stash to ", "WarningMsg" },
  { "<BRANCH_NAME>" },
  { " failed! Remove all merge conflicts to apply the stash.", "WarningMsg" },
}
M.beta_disclaimer = {
  {
    'IMPORTANT DISCLAIMER BEFORE USE:\n\nThe NvChadSnapshot feature is still in BETA. Use this feature with caution as it might still contain some bugs. Snapshots are stored in git branches. Do not manually switch between Snapshot branches, always use "NvChadSnapshotCheckout". Should your custom folder at any point "get lost", use the "git stash apply" command to restore it. NvChad will always keep the last 4 versions of your custom folder in the Git Stash when creating new Snapshots or switching from the update branch to a Snapshot to ensure that you will not lose any data. If you encounter any bugs or have feature requests please create an issue in the main NvChad repo and mention @LeonHeidelbach! If you like this feature, you can also let us know by commenting on the pinned issue for this BETA release! <3',
    "WarningMsg",
  },
}
M.branch_already_exists = {
  { "A Snapshot with the name ", "WarningMsg" },
  { "<BRANCH_NAME>" },
  {
    " already exists! Would you like to [o]verwirte this snapshot, use another [<name>] or [c]ancel? [<name>/o/C]",
    "WarningMsg",
  },
}
M.branch_delete_failed = { { "Deleting branch ", "WarningMsg" }, { "<BRANCH_NAME>" }, { " failed!", "WarningMsg" } }
M.branch_deleted = { { "Branch ", "WarningMsg" }, { "<BRANCH_NAME>" }, { " deleted succesfully!\n", "WarningMsg" } }
M.branch_failed = { { "Branch action ", "WarningMsg" }, { "<BRANCH_ACTION>" }, { " failed!", "WarningMsg" } }
M.breaking_changes_found = {
  { "\nFound", "Title" },
  { " <BREAKING_CHANGES_COUNT> " },
  { "potentially breaking ", "Title" },
  { "<HR_CHANGE>", "Title" },
  { ":\n", "Title" },
}
M.cancelled_action = { { "Action ", "Title" }, { "<ACTION>" }, { " cancelled!", "Title" } }
M.cannot_delete_current_snapshot =
  { { "Error: You cannot delete a snapshot that is currently in use!\n\n", "ErrorMsg" } }
M.cannot_update_snapshot = {
  {
    'Error: You cannot update while using a NvChadSnapshot! Use "NvChadSnapshotCheckout" to return to the update branch and try again.',
    "ErrorMsg",
  },
}
M.chadrc_file_not_created = {
  { "Error: Could not create ", "WarningMsg" },
  { "<FILE_PATH>" },
  { "! Please create it manually and try again.", "WarningMsg" },
}
M.checking_for_updates = { { "Checking for updates...", "String" } }
M.checkout = { { "\nChecking out branch ", "WarningMsg" }, { "<BRANCH_NAME>" } }
M.checkout_failed = {
  { "\nChecking out branch ", "WarningMsg" },
  { "<NEW_BRANCH_NAME>" },
  { " failed!", "WarningMsg" },
  { " Current branch is: ", "WarningMsg" },
  { "<OLD_BRANCH_NAME>" },
  { ".", "WarningMsg" },
}
M.checkout_success = { { "Checked out ", "Title" }, { "<NEW_BRANCH_NAME>" }, { " successfully!", "Title" } }
M.clean_repo_dir_failed = { { "Error: Could not clean up the repo.", "ErrorMsg" } }
M.clean_repo_dir_success = { { "Cleanup successful!\n\n", "Title" } }
M.commit_failed = { { "Error: Could not create commit.", "ErrorMsg" } }
M.commit_summary_failed = { { "Could not create a commit summary.\n", "WarningMsg" } }
M.create_branch_failed =
  { { "Error: Could not create branch ", "WarningMsg" }, { "<BRANCH_NAME>" }, { "!", "WarningMsg" } }
M.delete_file_failed = { { "Error: Could not delete file ", "WarningMsg" }, { "<FILE_NAME>" }, { "!", "WarningMsg" } }
M.diverged_branches = {
  {
    "\nSomething went wrong. No new commits were received even though the remote's HEAD "
      .. "differs from the currently checked out HEAD.",
    "Title",
  },
  { "\n\nWould you like to reset NvChad to the remote's HEAD? Local changes will be lost! " .. "[y/N]", "WarningMsg" },
}
M.get_author_identity_failed = { { "Error: Could not get author identity.", "ErrorMsg" } }
M.get_initial_commit_hash_failed = { { "Error: Could not get initial commit hash.", "ErrorMsg" } }
M.invalid_input = { { "Invalid input! Please enter a valid snapshot index.", "WarningMsg" } }
M.invalid_inputs = { { "Invalid inputs: ", "WarningMsg" } }
M.modifications_detected = {
  { "Warning\n  Modification to repo files detected.\n\n  Updater will run", "WarningMsg" },
  { " git reset --hard " },
  { "in config folder, so changes to existing repo files except ", "WarningMsg" },
  { "lua/custom folder" },
  { " will be lost!\n", "WarningMsg" },
}
M.modifications_detected_stash = {
  {
    "Local changes outside of the custom directory detected. " .. 'They have been stashed with "git stash"!\n',
    "WarningMsg",
  },
}
M.modifications_detected_stash_restore_failed = {
  {
    "\nApplying stashed changes to the NvChad "
      .. 'directory failed, please resolve the conflicts manually and use "git stash pop" to '
      .. 'restore or "git stash drop" to discard them!\n ',
    "WarningMsg",
  },
}
M.modifications_detected_stash_restored = { { "Local changes have been restored succesfully.\n", "WarningMsg" } }
M.new_commits_summary = {
  { "There ", "Title" },
  { "<HR_HAVE>", "Title" },
  { " been", "Title" },
  { " <HR_NEW_COMMIT_LIST> " },
  { "new ", "Title" },
  { "<HR_COMMITS>", "Title" },
  { " since the last update:\n", "Title" },
}
M.no_modifications_detected = { { "No conflicting changes outside of the custom folder, ready to update.", "Title" } }
M.no_snapshots_deleted = { { "No snapshots were deleted!", "WarningMsg" } }
M.no_snapshots_found = {
  { "No snapshots found! Use ", "WarningMsg" },
  { "NvChadSnapshotCreate" },
  { " to create your first snapshot.", "WarningMsg" },
}
M.no_snapshots_selected = { { "No snapshots selected!" } }
M.not_a_git_dir =
  { { "Error: ", "ErrorMsg" }, { "<CONFIG_PATH>", "ErrorMsg" }, { " is not a valid git directory.\n", "ErrorMsg" } }
M.packer_sync = {
  { "Would you like to run ", "WarningMsg" },
  { "PackerSync" },
  { " after the update has completed?\n", "WarningMsg" },
  { "Not running ", "WarningMsg" },
  { "PackerSync" },
  { " may break NvChad! ", "WarningMsg" },
  { "[y/N]", "WarningMsg" },
}
M.remote_head_changes_fetch_failed = { { "Error: Could not fetch remote changes.", "ErrorMsg" } }
M.remote_head_fetching_changes = { { "Fetching new changes from remote...", "String" } }
M.remote_head_sha_fetch_failed = { { "Error: Could not fetch remote HEAD sha.", "ErrorMsg" } }
M.remote_info =
  { { "Url: ", "Title" }, { "<UPDATE_URL>" }, { "\nBranch: ", "Title" }, { "<UPDATE_BRANCH>" }, { "\n\n" } }
M.removing_tmp_commit = {
  {
    "Removing tmp commit. This has not been removed properly after the " .. "last update. Cleaning up...\n\n",
    "WarningMsg",
  },
}
M.reset_failed = { { "Reset failed!", "WarningMsg" } }
M.reset_remote_head = { { "Resetting to remote HEAD...", "Title" } }
M.reset_remote_head_failed = { { "Error: Could not reset to remote HEAD.", "ErrorMsg" } }
M.reset_remote_head_success =
  { { "NvChad's HEAD has successfully been reset to ", "Title" }, { "<UPDATE_BRANCH>" }, { ".\n\n", "Title" } }
M.reset_remote_head_success_status =
  { { "Reset to remote HEAD successful!\n\n", "Title" }, { "<RESET_STATUS>", "String" }, { "\n", "String" } }
M.restore_failed = { { "Restore failed!", "WarningMsg" } }
M.select_snapshot_to_checkout =
  { { "Select a snapshot that you would like to checkout or switch back to the   update branch:\n", "WarningMsg" } }
M.select_snapshot_to_checkout_enter_index =
  { { "\nEnter the index of the snapshot that you would like to checkout or [c]ancel [<number>/C]:", "WarningMsg" } }
M.select_snapshot_to_delete = { { "Select the snapshot(s) that you would like to delete:\n", "WarningMsg" } }
M.select_snapshot_to_delete_enter_index =
  { { "\nEnter the indices of the snapshots separated by space or [c]ancel [<number_list>/C]:", "WarningMsg" } }
M.snapshot_compressing_branch = { { "Compressing snapshot...", "WarningMsg" } }
M.snapshot_creating_branch = { { "Creating snapshot branch -> ", "WarningMsg" }, { "<BRANCH_NAME>" } }
M.snapshot_enter_name = { { "Enter the name of the snapshot you want to create or cancel [<name>/C]:", "WarningMsg" } }
M.snapshot_stay_or_return = {
  { "Would you like to [u]se the snapshot branch (", "WarningMsg" },
  { "<BRANCH_NAME>" },
  { ") or [r]eturn to the update branch (", "WarningMsg" },
  { "<UPDATE_BRANCH>" },
  { ")? [u/R]", "WarningMsg" },
}
M.snapshot_successfully_created =
  { { "Snapshot ", "Title" }, { "<SNAP_NAME>" }, { " has been created successfully!", "Title" } }
M.snapshot_successfully_deleted = { { "The following snapshots have been successfully deleted: ", "WarningMsg" } }
M.squash_failed = { { "Error: Could not squash commits.", "ErrorMsg" } }
M.stash_failed = { { "Error: Could not complete stash operation.", "ErrorMsg" } }
M.stashing_custom_dir =
  { { "Stashing custom directory under: ", "WarningMsg" }, { "<STASH_NAME>" }, { ".", "WarningMsg" } }
M.switched_to_update_branch = { { "Switched to update branch ", "Title" }, { "<UPDATE_BRANCH>" }, { ".", "Title" } }
M.update_cancelled = { { "Update cancelled!", "Title" } }
M.update_cancelled_up_to_date = {
  { "You are already up to date with ", "String" },
  { "<UPDATE_BRANCH>" },
  { ". There is nothing to do!", "String" },
}
M.update_confirm = { { "\nUpdate NvChad? [y/N]", "WarningMsg" } }
M.update_continue = { { "\nWould you still like to continue with the update? [y/N]", "WarningMsg" } }
M.update_failed = { { "\nError: NvChad Update failed.", "ErrorMsg" } }
M.update_failed_changes_restored =
  { { "Error: NvChad Update failed.\n\n", "ErrorMsg" }, { "Local changes were restored." } }
M.update_success = { { "\nNvChad succesfully updated.\n", "String" } }
M.wait_for_rollback_to_complete = {
  {
    'Packer will now start rolling back your custom plugins. This will take several seconds. Please wait for the completion notification and restart your editor. Do not run "PackerSync" while using a NvChadSnapshot!',
    "WarningMsg",
  },
}

return M
