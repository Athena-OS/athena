local cmp = require("cmp")
local util = require("vim.lsp.util")

local source = {}

local defaults = {
	use_show_condition = true,
	show_autosnippets  = false,
}

-- the options are being passed via cmp.setup.sources, e.g.
-- require('cmp').setup { sources = { { name = 'luasnip', opts = {...} } } }
local function init_options(params)
	params.option = vim.tbl_deep_extend('keep', params.option, defaults)
	vim.validate({
		use_show_condition = { params.option.use_show_condition, 'boolean' },
		show_autosnippets  = { params.option.show_autosnippets,  'boolean' },
	})
end

local snip_cache = {}
local doc_cache = {}

source.clear_cache = function()
	snip_cache = {}
	doc_cache = {}
end

source.refresh = function()
	local ft = require("luasnip.session").latest_load_ft
	snip_cache[ft] = nil
	doc_cache[ft] = nil
end

local function get_documentation(snip, data)
	local header = (snip.name or "") .. " _ `[" .. data.filetype .. "]`\n"
	local docstring = { "", "```" .. vim.bo.filetype, snip:get_docstring(), "```" }
	local documentation = { header .. "---", (snip.dscr or ""), docstring }
	documentation = util.convert_input_to_markdown_lines(documentation)
	documentation = table.concat(documentation, "\n")

	doc_cache[data.filetype] = doc_cache[data.filetype] or {}
	doc_cache[data.filetype][data.snip_id] = documentation
	return documentation
end

source.new = function()
	return setmetatable({}, { __index = source })
end

source.get_keyword_pattern = function()
	return "\\%([^[:alnum:][:blank:]]\\|\\w\\+\\)"
end

function source:is_available()
	local ok, _ = pcall(require, "luasnip")
	return ok
end

function source:get_debug_name()
	return "luasnip"
end

function source:complete(params, callback)
	init_options(params)

	local filetypes = require("luasnip.util.util").get_snippet_filetypes()
	local items = {}

	for i = 1, #filetypes do
		local ft = filetypes[i]
		if not snip_cache[ft] then
			-- ft not yet in cache.
			local ft_items = {}
			local ft_table = require("luasnip").get_snippets(ft, {type = "snippets"})
			local iter_tab
			if params.option.show_autosnippets then
				local auto_table = require('luasnip').get_snippets(ft, {type="autosnippets"})
				iter_tab = {{ft_table, false}, {auto_table, true}}
			else
				iter_tab = {{ft_table, false}}
			end
			for _,ele in ipairs(iter_tab) do
				local tab,auto = unpack(ele)
				for j, snip in pairs(tab) do
					if not snip.hidden then
						ft_items[#ft_items + 1] = {
							word = snip.trigger,
							label = snip.trigger,
							kind = cmp.lsp.CompletionItemKind.Snippet,
							data = {
								filetype = ft,
								snip_id = snip.id,
								show_condition = snip.show_condition,
								auto = auto
							},
						}
					end
				end
			end
			snip_cache[ft] = ft_items
		end
		vim.list_extend(items, snip_cache[ft])
	end

	if params.option.use_show_condition then
		local line_to_cursor = params.context.cursor_before_line
		items = vim.tbl_filter(function(i)
			-- check if show_condition exists in case (somehow) user updated cmp_luasnip but not luasnip
			return not i.data.show_condition or i.data.show_condition(line_to_cursor)
		end, items)
	end

	callback(items)
end

function source:resolve(completion_item, callback)
	local item_snip_id = completion_item.data.snip_id
	local snip = require("luasnip").get_id_snippet(item_snip_id)
	local doc_itm = doc_cache[completion_item.data.filetype] or {}
	doc_itm = doc_itm[completion_item.data.snip_id] or get_documentation(snip, completion_item.data)
	completion_item.documentation = {
		kind = cmp.lsp.MarkupKind.Markdown,
		value = doc_itm,
	}
	callback(completion_item)
end

function source:execute(completion_item, callback)
	local snip = require("luasnip").get_id_snippet(completion_item.data.snip_id)

	-- if trigger is a pattern, expand "pattern" instead of actual snippet.
	if snip.regTrig then
		snip = snip:get_pattern_expand_helper()
	end

	local cursor = vim.api.nvim_win_get_cursor(0)
	-- get_cursor returns (1,0)-indexed position, clear_region expects (0,0)-indexed.
	cursor[1] = cursor[1] - 1

	-- text cannot be cleared before, as TM_CURRENT_LINE and
	-- TM_CURRENT_WORD couldn't be set correctly.
	require("luasnip").snip_expand(snip, {
		-- clear word inserted into buffer by cmp.
		-- cursor is currently behind word.
		clear_region = {
			from = {
				cursor[1],
				cursor[2]-#completion_item.word
			},
			to = cursor
		}
	})
	callback(completion_item)
end

return source
