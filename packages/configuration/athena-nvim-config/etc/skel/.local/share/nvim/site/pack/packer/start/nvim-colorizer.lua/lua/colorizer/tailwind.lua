---Helper functions to parse tailwind color variables
--@module colorizer.tailwind
local api = vim.api

local tailwind = {}

-- use a different namespace for tailwind as will be cleared if kept in Default namespace
local DEFAULT_NAMESPACE_TAILWIND = api.nvim_create_namespace "colorizer_tailwind"

local TAILWIND = {}

--- Cleanup tailwind variables and autocmd
---@param buf number
function tailwind.cleanup(buf)
  if TAILWIND[buf] and TAILWIND[buf].AU_ID and TAILWIND[buf].AU_ID[1] then
    pcall(api.nvim_del_autocmd, TAILWIND[buf].AU_ID[1])
    pcall(api.nvim_del_autocmd, TAILWIND[buf].AU_ID[2])
  end
  api.nvim_buf_clear_namespace(buf, DEFAULT_NAMESPACE_TAILWIND, 0, -1)
  TAILWIND[buf] = nil
end

local function highlight_tailwind(buf, ns, options, add_highlight)
  -- it can take some time to actually fetch the results
  -- on top of that, tailwindcss is quite slow in neovim
  vim.defer_fn(function()
    if not TAILWIND[buf] or not TAILWIND[buf].CLIENT or not TAILWIND[buf].CLIENT.request then
      return
    end

    local opts = { textDocument = vim.lsp.util.make_text_document_params() }
    --@local
    ---@diagnostic disable-next-line: param-type-mismatch
    TAILWIND[buf].CLIENT.request("textDocument/documentColor", opts, function(err, results, _, _)
      if err == nil and results ~= nil then
        local data, line_start, line_end = {}, nil, nil
        for _, color in pairs(results) do
          local cur_line = color.range.start.line
          if line_start then
            if cur_line < line_start then
              line_start = cur_line
            end
          else
            line_start = cur_line
          end

          local end_line = color.range["end"].line
          if line_end then
            if end_line > line_end then
              line_end = end_line
            end
          else
            line_end = end_line
          end

          local r, g, b, a = color.color.red or 0, color.color.green or 0, color.color.blue or 0, color.color.alpha or 0
          local rgb_hex = string.format("%02x%02x%02x", r * a * 255, g * a * 255, b * a * 255)
          local first_col = color.range.start.character
          local end_col = color.range["end"].character

          data[cur_line] = data[cur_line] or {}
          table.insert(data[cur_line], { rgb_hex = rgb_hex, range = { first_col, end_col } })
        end
        add_highlight(buf, ns, line_start or 0, line_end and (line_end + 2) or -1, data, options)
      end
    end)
  end, 10)
end

--- highlight buffer using values returned by tailwindcss
-- To see these table information, see |colorizer.buffer|
---@param buf number
---@param options table
---@param options_local table
---@param add_highlight function
function tailwind.setup_lsp_colors(buf, options, options_local, add_highlight)
  TAILWIND[buf] = TAILWIND[buf] or {}
  TAILWIND[buf].AU_ID = TAILWIND[buf].AU_ID or {}

  if not TAILWIND[buf].CLIENT or TAILWIND[buf].CLIENT.is_stopped() then
    if vim.version().minor >= 8 then
      -- create the autocmds so tailwind colours only activate when tailwindcss lsp is active
      if not TAILWIND[buf].AU_CREATED then
        api.nvim_buf_clear_namespace(buf, DEFAULT_NAMESPACE_TAILWIND, 0, -1)
        TAILWIND[buf].AU_ID[1] = api.nvim_create_autocmd("LspAttach", {
          group = options_local.__augroup_id,
          buffer = buf,
          callback = function(args)
            local ok, client = pcall(vim.lsp.get_client_by_id, args.data.client_id)
            if ok then
              if client.name == "tailwindcss" and client.supports_method "textDocument/documentColor" then
                -- wait 100 ms for the first request
                TAILWIND[buf].CLIENT = client
                vim.defer_fn(function()
                  highlight_tailwind(buf, DEFAULT_NAMESPACE_TAILWIND, options, add_highlight)
                end, 100)
              end
            end
          end,
        })
        -- make sure the autocmds are deleted after lsp server is closed
        TAILWIND[buf].AU_ID[2] = api.nvim_create_autocmd("LspDetach", {
          group = options_local.__augroup_id,
          buffer = buf,
          callback = function()
            tailwind.cleanup(buf)
          end,
        })
        TAILWIND[buf].AU_CREATED = true
      end
    end
    -- this will be triggered when no lsp is attached
    api.nvim_buf_clear_namespace(buf, DEFAULT_NAMESPACE_TAILWIND, 0, -1)

    TAILWIND[buf].CLIENT = nil

    local ok, tailwind_client = pcall(function()
      return vim.lsp.get_active_clients { bufnr = buf, name = "tailwindcss" }
    end)
    if not ok then
      return
    end

    ok = false
    for _, cl in pairs(tailwind_client) do
      if cl["name"] == "tailwindcss" then
        tailwind_client = cl
        ok = true
        break
      end
    end

    if
      not ok
      and (
        vim.tbl_isempty(tailwind_client or {})
        or not tailwind_client
        or not tailwind_client.supports_method
        or not tailwind_client.supports_method "textDocument/documentColor"
      )
    then
      return true
    end

    TAILWIND[buf].CLIENT = tailwind_client

    -- wait 500 ms for the first request
    vim.defer_fn(function()
      highlight_tailwind(buf, DEFAULT_NAMESPACE_TAILWIND, options, add_highlight)
    end, 1000)

    return true
  end

  -- only try to do tailwindcss highlight if lsp is attached
  if TAILWIND[buf].CLIENT then
    highlight_tailwind(buf, DEFAULT_NAMESPACE_TAILWIND, options, add_highlight)
  end
end

return tailwind
