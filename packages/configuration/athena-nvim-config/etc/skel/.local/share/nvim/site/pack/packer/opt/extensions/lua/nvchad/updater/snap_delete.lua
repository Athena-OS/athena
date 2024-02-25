local function snap_delete()
  local p_snapshot = require "packer.snapshot"
  local utils = require "nvchad"
  local git = require "nvchad.utils.git"
  local misc = require "nvchad.utils.misc"
  local defaults = require "nvchad.utils.config"
  local prompts = require "nvchad.utils.prompts"
  local echo = utils.echo
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

  -- prepare the output string containing the list of all snapshots
  local snapshot_list_str = {}

  -- add the introductory prompt to the string
  vim.list_extend(snapshot_list_str, prompts.select_snapshot_to_delete)

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
        { snapshot, "Title" },
        { (current_branch_name == snapshot and " (currently in use)" or "") },
        { "\n" },
      }
    )
  end

  -- add the selection prompt to the list string and print it
  vim.list_extend(snapshot_list_str, prompts.select_snapshot_to_delete_enter_index)

  echo(snapshot_list_str)

  -- trim user input and switch to lower case representation
  local selection = vim.trim(string.lower(vim.fn.input "-> "))

  misc.print_padding("\n", 2)

  -- if the deletion was cancelled print the cancellation message and return
  if selection == "c" then
    echo(misc.list_text_replace(prompts.cancelled_action, "<ACTION>", "NvChadSnapshotDelete"))
    return
  end

  -- split the user input at " " since the user can input a list of snapshots to delete
  local selection_list = vim.fn.split(selection, " ")

  -- check if the selection list from the user input contains any values
  if #selection_list == 0 then
    echo(prompts.no_snapshots_selected)
    return
  end

  -- a list that will ensure that duplicate values are disregarded
  local processed = {}

  -- two lists that will split valid and invalid user inputs so that they can be prompted later
  local invalid_selection_list = vim.deepcopy(prompts.invalid_inputs)
  local valid_selection_list = vim.deepcopy(prompts.snapshot_successfully_deleted)

  -- loop through the user input
  for _, input_str in ipairs(selection_list) do
    -- extract the number value from the user input
    local number = tonumber(input_str)

    -- check if the input string is not empty and has not already been processed
    if input_str ~= "" and not vim.tbl_contains(processed, input_str) then
      -- add current user input to the processed list
      table.insert(processed, input_str)

      -- check if the input is a valid snapshot index, print prompt if not and return
      if
        type(number) ~= "number"
        or number < 1
        or number > #snapshot_list
        or current_branch_name == snapshot_list[number]
      then
        -- we cannot delete snapshots that are currently in use
        if current_branch_name == snapshot_list[number] then
          echo(prompts.cannot_delete_current_snapshot)
        end

        -- add the current value to the invalid inputs list
        vim.list_extend(invalid_selection_list, {
          { (#invalid_selection_list > 1 and ", " or "") .. input_str },
        })
      else
        -- delete the snapshot
        if git.delete_branch(snapshot_list[number]) then
          -- delete the corresponding "PackerSnapshot"
          p_snapshot.delete(snapshot_list[number])

          -- add the current value to the valid inputs list
          vim.list_extend(
            valid_selection_list,
            { { (#valid_selection_list > 1 and ", " or "") .. "[" .. input_str .. "] " .. snapshot_list[number] } }
          )
        end
      end
    end
  end

  -- if we found any invalid inputs, print them
  if #invalid_selection_list > 1 then
    echo(invalid_selection_list)
    misc.print_padding("\n", 1)
  end

  -- if we found any valid inputs, print them
  if #valid_selection_list > 1 then
    echo(valid_selection_list)
  else
    echo(prompts.no_snapshots_deleted)
    return
  end
end

return snap_delete
