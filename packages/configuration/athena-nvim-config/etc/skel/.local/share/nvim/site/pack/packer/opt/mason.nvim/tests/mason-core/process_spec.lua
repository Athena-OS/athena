local spy = require "luassert.spy"
local match = require "luassert.match"
local process = require "mason-core.process"

describe("process.spawn", function()
    -- Unix only
    it(
        "should spawn command and feed output to sink",
        async_test(function()
            local stdio = process.in_memory_sink()
            local callback = spy.new()
            process.spawn("env", {
                args = {},
                env = {
                    "HELLO=world",
                    "MY_ENV=var",
                },
                stdio_sink = stdio.sink,
            }, callback)

            assert.wait_for(function()
                assert.spy(callback).was_called(1)
                assert.spy(callback).was_called_with(true, 0, match.is_number())
                assert.equals(table.concat(stdio.buffers.stdout, ""), "HELLO=world\nMY_ENV=var\n")
            end)
        end)
    )
end)
