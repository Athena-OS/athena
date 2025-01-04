local Ui = require "mason-core.ui"
local p = require "mason.ui.palette"

---@param state InstallerUiState
return function(state)
    return Ui.HlTextNode {
        {
            p.none "The ",
            p.highlight_secondary "L",
            p.none "anguage ",
            p.highlight_secondary "S",
            p.none "erver ",
            p.highlight_secondary "P",
            p.none "rotocol defines the protocol used between an",
        },
        {
            p.none "editor or IDE and a language server that provides language features",
        },
        {
            p.none "like auto complete, go to definition, find all references etc.",
        },
    }
end
