local mock = require "luassert.mock"
local spy = require "luassert.spy"
local stub = require "luassert.stub"
local path = require "mason-core.path"

local _ = require "mason-core.functional"
local a = require "mason-core.async"
local pip3 = require "mason-core.managers.pip3"
local installer = require "mason-core.installer"
local Result = require "mason-core.result"
local settings = require "mason.settings"
local spawn = require "mason-core.spawn"
local api = require "mason-registry.api"

describe("pip3 manager", function()
    before_each(function()
        settings.set(settings._DEFAULT_SETTINGS)
    end)

    it("normalizes pip3 packages", function()
        local normalize = pip3.normalize_package
        assert.equals("python-lsp-server", normalize "python-lsp-server[all]")
        assert.equals("python-lsp-server", normalize "python-lsp-server[]")
        assert.equals("python-lsp-server", normalize "python-lsp-server[[]]")
    end)

    it(
        "should create venv and call pip3 install",
        async_test(function()
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle, { requested_version = "42.13.37" })
            installer.exec_in_context(
                ctx,
                pip3.packages { "main-package", "supporting-package", "supporting-package2" }
            )
            assert.equals(path.package_prefix "dummy", ctx.cwd:get()) -- should've promoted cwd
            assert.spy(ctx.spawn.python3).was_called(1)
            assert.spy(ctx.spawn.python3).was_called_with {
                "-m",
                "venv",
                "venv",
            }
            assert.spy(ctx.spawn.python).was_called(1)
            assert.spy(ctx.spawn.python).was_called_with {
                "-m",
                "pip",
                "--disable-pip-version-check",
                "install",
                "-U",
                {},
                {
                    "main-package==42.13.37",
                    "supporting-package",
                    "supporting-package2",
                },
                with_paths = { path.concat { path.package_prefix "dummy", "venv", "bin" } },
            }
        end)
    )

    it(
        "should exhaust python3 executable candidates if all fail",
        async_test(function()
            vim.g.python3_host_prog = "/my/python3"
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle)
            ctx.spawn.python3 = spy.new(mockx.throws())
            ctx.spawn.python = spy.new(mockx.throws())
            ctx.spawn[vim.g.python3_host_prog] = spy.new(mockx.throws())
            local err = assert.has_error(function()
                installer.exec_in_context(ctx, pip3.packages { "package" })
            end)
            vim.g.python3_host_prog = nil

            assert.equals("Unable to create python3 venv environment.", err)
            assert.spy(ctx.spawn["/my/python3"]).was_called(1)
            assert.spy(ctx.spawn.python3).was_called(1)
            assert.spy(ctx.spawn.python).was_called(1)
        end)
    )

    it(
        "should not exhaust python3 executable if one succeeds",
        async_test(function()
            vim.g.python3_host_prog = "/my/python3"
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle)
            ctx.spawn.python3 = spy.new(mockx.throws())
            ctx.spawn.python = spy.new(mockx.returns {})
            ctx.spawn[vim.g.python3_host_prog] = spy.new(mockx.returns {})

            installer.exec_in_context(ctx, pip3.packages { "package" })
            vim.g.python3_host_prog = nil
            assert.spy(ctx.spawn.python3).was_called(0)
            assert.spy(ctx.spawn.python).was_called(1)
            assert.spy(ctx.spawn["/my/python3"]).was_called(1)
        end)
    )

    it(
        "should expand python3_host_prog path",
        async_test(function()
            vim.g.python3_host_prog = "~/python3"
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle)
            ctx.spawn.python = spy.new(mockx.returns {})
            ctx.spawn[vim.env.HOME .. "/python3"] = spy.new(mockx.returns {})

            installer.exec_in_context(ctx, pip3.packages { "package" })
            a.scheduler()
            vim.g.python3_host_prog = nil
            assert.spy(ctx.spawn[vim.env.HOME .. "/python3"]).was_called(1)
        end)
    )

    it(
        "should use install_args from settings",
        async_test(function()
            settings.set {
                pip = {
                    install_args = { "--proxy", "http://localhost:8080" },
                },
            }
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle)
            installer.exec_in_context(ctx, pip3.packages { "package" })
            assert.spy(ctx.spawn.python).was_called(1)
            assert.spy(ctx.spawn.python).was_called_with {
                "-m",
                "pip",
                "--disable-pip-version-check",
                "install",
                "-U",
                { "--proxy", "http://localhost:8080" },
                { "package" },
                with_paths = { path.concat { path.package_prefix "dummy", "venv", "bin" } },
            }
        end)
    )

    it(
        "should upgrade pip",
        async_test(function()
            settings.set {
                pip = {
                    upgrade_pip = true,
                },
            }
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle)
            installer.exec_in_context(ctx, pip3.packages { "package" })
            assert.spy(ctx.spawn.python).was_called(2)
            assert.spy(ctx.spawn.python).was_called_with {
                "-m",
                "pip",
                "--disable-pip-version-check",
                "install",
                "-U",
                {},
                "pip",
                with_paths = { path.concat { path.package_prefix "dummy", "venv", "bin" } },
            }
            assert.spy(ctx.spawn.python).was_called_with {
                "-m",
                "pip",
                "--disable-pip-version-check",
                "install",
                "-U",
                {},
                { "package" },
                with_paths = { path.concat { path.package_prefix "dummy", "venv", "bin" } },
            }
        end)
    )

    it(
        "should provide receipt information",
        async_test(function()
            local handle = InstallHandleGenerator "dummy"
            local ctx = InstallContextGenerator(handle, { requested_version = "42.13.37" })
            installer.exec_in_context(
                ctx,
                pip3.packages { "main-package", "supporting-package", "supporting-package2" }
            )
            assert.same({
                type = "pip3",
                package = "main-package",
            }, ctx.receipt.primary_source)
            assert.same({
                {
                    type = "pip3",
                    package = "supporting-package",
                },
                {
                    type = "pip3",
                    package = "supporting-package2",
                },
            }, ctx.receipt.secondary_sources)
        end)
    )
end)

describe("pip3 version check", function()
    it(
        "should return current version",
        async_test(function()
            stub(spawn, "python")
            spawn.python.returns(Result.success {
                stdout = _.dedent [[
                    [
                        {"name": "astroid", "version": "2.9.3"},
                        {"name": "mccabe", "version": "0.6.1"},
                        {"name": "python-lsp-server", "version": "1.3.0", "latest_version": "1.4.0", "latest_filetype": "wheel"},
                        {"name": "wrapt", "version": "1.13.3", "latest_version": "1.14.0", "latest_filetype": "wheel"}
                    ]
                ]],
            })

            local result = pip3.get_installed_primary_package_version(
                mock.new {
                    primary_source = mock.new {
                        type = "pip3",
                        package = "python-lsp-server",
                    },
                },
                path.package_prefix "dummy"
            )

            assert.spy(spawn.python).was_called(1)
            assert.spy(spawn.python).was_called_with {
                "-m",
                "pip",
                "list",
                "--format=json",
                cwd = path.package_prefix "dummy",
                with_paths = { path.concat { path.package_prefix "dummy", "venv", "bin" } },
            }
            assert.is_true(result:is_success())
            assert.equals("1.3.0", result:get_or_nil())
        end)
    )

    it(
        "should return outdated primary package",
        async_test(function()
            stub(api, "get")
            api.get.on_call_with("/api/pypi/python-lsp-server/versions/latest").returns(Result.success {
                name = "python-lsp-server",
                version = "1.4.0",
            })
            stub(spawn, "python")
            spawn.python.returns(Result.success {
                stdout = [[
                    [
                        {"name": "astroid", "version": "2.9.3"},
                        {"name": "mccabe", "version": "0.6.1"},
                        {"name": "python-lsp-server", "version": "1.3.0", "latest_version": "1.4.0", "latest_filetype": "wheel"},
                        {"name": "wrapt", "version": "1.13.3", "latest_version": "1.14.0", "latest_filetype": "wheel"}
                    ]
                ]],
            })

            local result = pip3.check_outdated_primary_package(
                mock.new {
                    primary_source = mock.new {
                        type = "pip3",
                        package = "python-lsp-server",
                    },
                },
                path.package_prefix "dummy"
            )

            assert.is_true(result:is_success())
            assert.same({
                name = "python-lsp-server",
                current_version = "1.3.0",
                latest_version = "1.4.0",
            }, result:get_or_nil())
        end)
    )

    it(
        "should return failure if primary package is not outdated",
        async_test(function()
            stub(spawn, "python")
            spawn.python.returns(Result.success {
                stdout = [[
                    [
                        {"name": "astroid", "version": "2.9.3"},
                        {"name": "mccabe", "version": "0.6.1"},
                        {"name": "python-lsp-server", "version": "1.3.0", "latest_version": "1.4.0", "latest_filetype": "wheel"},
                        {"name": "wrapt", "version": "1.13.3", "latest_version": "1.14.0", "latest_filetype": "wheel"}
                    ]
                ]],
            })
            stub(api, "get")
            api.get.on_call_with("/api/pypi/python-lsp-server/versions/latest").returns(Result.success {
                name = "python-lsp-server",
                version = "1.3.0",
            })

            local result = pip3.check_outdated_primary_package(
                mock.new {
                    primary_source = mock.new {
                        type = "pip3",
                        package = "python-lsp-server",
                    },
                },
                "/tmp/install/dir"
            )

            assert.is_true(result:is_failure())
            assert.equals("Primary package is not outdated.", result:err_or_nil())
        end)
    )
end)
