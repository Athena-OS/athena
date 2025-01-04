local stub = require "luassert.stub"
local match = require "luassert.match"
local std = require "mason-core.managers.std"
local path = require "mason-core.path"
local pip3 = require "mason-core.managers.pip3"
local registry = require "mason-registry"

describe("installer", function()
    ---@module "mason-core.platform"
    local platform

    before_each(function()
        package.loaded["mason-core.installer.platform"] = nil
        package.loaded["mason-core.installer.context"] = nil
        platform = require "mason-core.platform"
    end)

    it("should write shell exec wrapper on Unix", function()
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx.fs, "write_file")
        stub(std, "chmod")

        ctx:write_shell_exec_wrapper("my-executable", "bash -c 'echo $GREETING'", {
            GREETING = "Hello World!",
        })

        assert.spy(ctx.fs.write_file).was_called(1)
        assert.spy(ctx.fs.write_file).was_called_with(
            match.is_ref(ctx.fs),
            "my-executable",
            [[#!/usr/bin/env bash
export GREETING="Hello World!"
exec bash -c 'echo $GREETING' "$@"]]
        )
    end)

    it("should write shell exec wrapper on Windows", function()
        platform.is.darwin = false
        platform.is.mac = false
        platform.is.unix = false
        platform.is.linux = false
        platform.is.win = true
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx.fs, "write_file")
        stub(std, "chmod")

        ctx:write_shell_exec_wrapper("my-executable", "cmd.exe /C echo %GREETING%", {
            GREETING = "Hello World!",
        })

        assert.spy(ctx.fs.write_file).was_called(1)
        assert.spy(ctx.fs.write_file).was_called_with(
            match.is_ref(ctx.fs),
            "my-executable.cmd",
            [[@ECHO off
SET GREETING=Hello World!
cmd.exe /C echo %GREETING% %*]]
        )
    end)

    it("should write Node exec wrapper", function()
        local js_rel_path = path.concat { "some", "obscure", "path", "server.js" }
        local dummy = registry.get_package "dummy"
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.fs, "file_exists")
        ctx.fs.file_exists.on_call_with(match.is_ref(ctx.fs), js_rel_path).returns(true)

        ctx:write_node_exec_wrapper("my-wrapper-script", js_rel_path)

        assert.spy(ctx.write_shell_exec_wrapper).was_called(1)
        assert.spy(ctx.write_shell_exec_wrapper).was_called_with(
            match.is_ref(ctx),
            "my-wrapper-script",
            ("node %q"):format(path.concat { dummy:get_install_path(), js_rel_path })
        )
    end)

    it("should not write Node exec wrapper if the target script doesn't exist", function()
        local js_rel_path = path.concat { "some", "obscure", "path", "server.js" }
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.fs, "file_exists")
        ctx.fs.file_exists.on_call_with(match.is_ref(ctx.fs), js_rel_path).returns(false)

        local err = assert.has_error(function()
            ctx:write_node_exec_wrapper("my-wrapper-script", js_rel_path)
        end)

        assert.equals(
            [[Cannot write Node exec wrapper for path "some/obscure/path/server.js" as it doesn't exist.]],
            err
        )
        assert.spy(ctx.write_shell_exec_wrapper).was_called(0)
    end)

    it("should write Python exec wrapper", function()
        local dummy = registry.get_package "dummy"
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx.cwd, "get")
        ctx.cwd.get.returns "/tmp/placeholder"
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.spawn, "python")

        ctx:write_pyvenv_exec_wrapper("my-wrapper-script", "my-module")

        assert.spy(ctx.write_shell_exec_wrapper).was_called(1)
        assert.spy(ctx.write_shell_exec_wrapper).was_called_with(
            match.is_ref(ctx),
            "my-wrapper-script",
            ("%q -m my-module"):format(path.concat { pip3.venv_path(dummy:get_install_path()), "python" })
        )
    end)

    it("should not write Python exec wrapper if module cannot be found", function()
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx.cwd, "get")
        ctx.cwd.get.returns "/tmp/placeholder"
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.spawn, "python")

        ctx.spawn.python.invokes(function()
            error ""
        end)

        local err = assert.has_error(function()
            ctx:write_pyvenv_exec_wrapper("my-wrapper-script", "my-module")
        end)

        assert.equals([[Cannot write Python exec wrapper for module "my-module" as it doesn't exist.]], err)
        assert.spy(ctx.write_shell_exec_wrapper).was_called(0)
    end)

    it("should write exec wrapper", function()
        local dummy = registry.get_package "dummy"
        local exec_rel_path = path.concat { "obscure", "path", "to", "server" }
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.fs, "file_exists")
        ctx.fs.file_exists.on_call_with(match.is_ref(ctx.fs), exec_rel_path).returns(true)

        ctx:write_exec_wrapper("my-wrapper-script", exec_rel_path)

        assert.spy(ctx.write_shell_exec_wrapper).was_called(1)
        assert
            .spy(ctx.write_shell_exec_wrapper)
            .was_called_with(
                match.is_ref(ctx),
                "my-wrapper-script",
                ("%q"):format(path.concat { dummy:get_install_path(), exec_rel_path })
            )
    end)

    it("should not write exec wrapper if target executable doesn't exist", function()
        local exec_rel_path = path.concat { "obscure", "path", "to", "server" }
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.fs, "file_exists")
        ctx.fs.file_exists.on_call_with(match.is_ref(ctx.fs), exec_rel_path).returns(false)

        local err = assert.has_error(function()
            ctx:write_exec_wrapper("my-wrapper-script", exec_rel_path)
        end)

        assert.equals([[Cannot write exec wrapper for path "obscure/path/to/server" as it doesn't exist.]], err)
        assert.spy(ctx.write_shell_exec_wrapper).was_called(0)
    end)

    it("should write PHP exec wrapper", function()
        local php_rel_path = path.concat { "some", "obscure", "path", "cli.php" }
        local dummy = registry.get_package "dummy"
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.fs, "file_exists")
        ctx.fs.file_exists.on_call_with(match.is_ref(ctx.fs), php_rel_path).returns(true)

        ctx:write_php_exec_wrapper("my-wrapper-script", php_rel_path)

        assert.spy(ctx.write_shell_exec_wrapper).was_called(1)
        assert.spy(ctx.write_shell_exec_wrapper).was_called_with(
            match.is_ref(ctx),
            "my-wrapper-script",
            ("php %q"):format(path.concat { dummy:get_install_path(), php_rel_path })
        )
    end)

    it("should not write PHP exec wrapper if the target script doesn't exist", function()
        local php_rel_path = path.concat { "some", "obscure", "path", "cli.php" }
        local handle = InstallHandleGenerator "dummy"
        local ctx = InstallContextGenerator(handle)
        stub(ctx, "write_shell_exec_wrapper")
        stub(ctx.fs, "file_exists")
        ctx.fs.file_exists.on_call_with(match.is_ref(ctx.fs), php_rel_path).returns(false)

        local err = assert.has_error(function()
            ctx:write_php_exec_wrapper("my-wrapper-script", php_rel_path)
        end)

        assert.equals([[Cannot write PHP exec wrapper for path "some/obscure/path/cli.php" as it doesn't exist.]], err)
        assert.spy(ctx.write_shell_exec_wrapper).was_called(0)
    end)
end)
