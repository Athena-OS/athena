local log = require "mason-core.log"
local _ = require "mason-core.functional"
local platform = require "mason-core.platform"
local uv = vim.loop

---@alias luv_pipe any
---@alias luv_handle any

---@class StdioSink
---@field stdout fun(chunk: string)
---@field stderr fun(chunk: string)

local M = {}

---@param pipe luv_pipe
---@param sink fun(chunk: string)
local function connect_sink(pipe, sink)
    ---@param err string | nil
    ---@param data string | nil
    return function(err, data)
        if err then
            log.error("Unexpected error when reading pipe.", err)
        end
        if data ~= nil then
            sink(data)
        else
            pipe:read_stop()
            pipe:close()
        end
    end
end

-- We gather the root env immediately, primarily because of E5560.
-- Also, there's no particular reason we need to refresh the environment (yet).
local initial_environ = vim.fn.environ()

---@param new_paths string[] A list of paths to prepend the existing PATH with.
function M.extend_path(new_paths)
    local new_path_str = table.concat(new_paths, platform.path_sep)
    return ("%s%s%s"):format(new_path_str, platform.path_sep, initial_environ.PATH or "")
end

---Merges the provided env param with the user's full environment. Provided env has precedence.
---@param env table<string, string>
---@param excluded_var_names string[]|nil
---@return string[]
function M.graft_env(env, excluded_var_names)
    local excluded_var_names_set = excluded_var_names and _.set_of(excluded_var_names) or {}
    local merged_env = {}
    for key, val in pairs(initial_environ) do
        if not excluded_var_names_set[key] and env[key] == nil then
            merged_env[#merged_env + 1] = key .. "=" .. val
        end
    end
    for key, val in pairs(env) do
        if not excluded_var_names_set[key] then
            merged_env[#merged_env + 1] = key .. "=" .. val
        end
    end
    return merged_env
end

---@param env_list string[]
local function sanitize_env_list(env_list)
    local sanitized_list = {}
    for __, env in ipairs(env_list) do
        local safe_envs = {
            "GO111MODULE",
            "GOBIN",
            "GOPATH",
            "PATH",
            "GEM_HOME",
            "GEM_PATH",
        }
        local is_safe_env = _.any(function(safe_env)
            return env:find(safe_env .. "=") == 1
        end, safe_envs)
        if is_safe_env then
            sanitized_list[#sanitized_list + 1] = env
        else
            local idx = env:find "="
            sanitized_list[#sanitized_list + 1] = env:sub(1, idx) .. "<redacted>"
        end
    end
    return sanitized_list
end

---@alias JobSpawnCallback fun(success: boolean, exit_code: integer?, signal: integer?)

---@class JobSpawnOpts
---@field env string[]? List of "key=value" string.
---@field args string[]
---@field cwd string
---@field stdio_sink StdioSink

---@param cmd string The command/executable.
---@param opts JobSpawnOpts
---@param callback JobSpawnCallback
---@return luv_handle?,luv_pipe[]?,integer? # Returns the job handle and the stdio array on success, otherwise returns nil.
function M.spawn(cmd, opts, callback)
    local stdin = uv.new_pipe(false)
    local stdout = uv.new_pipe(false)
    local stderr = uv.new_pipe(false)

    local stdio = { stdin, stdout, stderr }

    local spawn_opts = {
        env = opts.env,
        stdio = stdio,
        args = opts.args,
        cwd = opts.cwd,
        detached = false,
        hide = true,
    }

    log.lazy_debug(function()
        local sanitized_env = opts.env and sanitize_env_list(opts.env) or nil
        return "Spawning cmd=%s, spawn_opts=%s",
            cmd,
            {
                args = opts.args,
                cwd = opts.cwd,
                env = sanitized_env,
            }
    end)

    local handle, pid_or_err
    handle, pid_or_err = uv.spawn(cmd, spawn_opts, function(exit_code, signal)
        local successful = exit_code == 0 and signal == 0
        handle:close()
        if not stdin:is_closing() then
            stdin:close()
        end

        -- ensure all pipes are closed, for I am a qualified plumber
        local check = uv.new_check()
        check:start(function()
            for i = 1, #stdio do
                local pipe = stdio[i]
                if not pipe:is_closing() then
                    return
                end
            end
            check:stop()
            callback(successful, exit_code, signal)
        end)

        log.fmt_debug("Job pid=%s exited with exit_code=%s, signal=%s", pid_or_err, exit_code, signal)
    end)

    if handle == nil then
        log.fmt_error("Failed to spawn process. cmd=%s, err=%s", cmd, pid_or_err)
        if type(pid_or_err) == "string" and pid_or_err:find "ENOENT" == 1 then
            opts.stdio_sink.stderr(("Could not find executable %q in path.\n"):format(cmd))
        else
            opts.stdio_sink.stderr(("Failed to spawn process cmd=%s err=%s\n"):format(cmd, pid_or_err))
        end
        callback(false)
        return nil, nil, nil
    end

    log.debug("Spawned with pid", pid_or_err)

    stdout:read_start(connect_sink(stdout, opts.stdio_sink.stdout))
    stderr:read_start(connect_sink(stderr, opts.stdio_sink.stderr))

    return handle, stdio, pid_or_err
end

function M.empty_sink()
    local function noop() end
    return {
        stdout = noop,
        stderr = noop,
    }
end

function M.simple_sink()
    return {
        stdout = vim.schedule_wrap(vim.api.nvim_out_write),
        stderr = vim.schedule_wrap(vim.api.nvim_err_write),
    }
end

function M.in_memory_sink()
    local stdout, stderr = {}, {}
    return {
        buffers = { stdout = stdout, stderr = stderr },
        sink = {
            stdout = function(chunk)
                stdout[#stdout + 1] = chunk
            end,
            stderr = function(chunk)
                stderr[#stderr + 1] = chunk
            end,
        },
    }
end

---@param luv_handle luv_handle
---@param signal integer
function M.kill(luv_handle, signal)
    assert(type(signal) == "number", "signal is not a number")
    assert(signal > 0 and signal < 32, "signal must be between 1-31")
    log.fmt_trace("Sending signal %s to handle %s", signal, luv_handle)
    local ok, is_active = pcall(uv.is_active, luv_handle)
    if not ok or not is_active then
        log.fmt_trace("Tried to send signal %s to inactive uv handle.", signal)
        return
    end
    uv.process_kill(luv_handle, signal)
end

return M
