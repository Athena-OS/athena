"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultSemantic = void 0;
function getDefaultSemantic(palette) {
    return {
        // General {{{
        operatorOverload: `${palette.orange}`,
        memberOperatorOverload: `${palette.orange}`,
        // }}}
        // JavaScript {{{
        "variable.defaultLibrary:javascript": `${palette.purple}`,
        "property.defaultLibrary:javascript": `${palette.purple}`,
        // }}}
        // JavaScript React {{{
        "variable.defaultLibrary:javascriptreact": `${palette.purple}`,
        "property.defaultLibrary:javascriptreact": `${palette.purple}`,
        // }}}
        // TypeScript {{{
        "class:typescript": `${palette.aqua}`,
        "interface:typescript": `${palette.aqua}`,
        "enum:typescript": `${palette.purple}`,
        "enumMember:typescript": `${palette.blue}`,
        "namespace:typescript": `${palette.purple}`,
        "variable.defaultLibrary:typescript": `${palette.purple}`,
        "property.defaultLibrary:typescript": `${palette.purple}`,
        // }}}
        // TypeScript React {{{
        "class:typescriptreact": `${palette.aqua}`,
        "interface:typescriptreact": `${palette.aqua}`,
        "enum:typescriptreact": `${palette.purple}`,
        "enumMember:typescriptreact": `${palette.blue}`,
        "namespace:typescriptreact": `${palette.purple}`,
        "variable.defaultLibrary:typescriptreact": `${palette.purple}`,
        "property.defaultLibrary:typescriptreact": `${palette.purple}`,
        // }}}
        // Python {{{
        "intrinsic:python": `${palette.purple}`,
        "module:python": `${palette.blue}`,
        "class:python": `${palette.aqua}`,
        // }}}
        // Rust {{{
        "macro:rust": `${palette.aqua}`,
        "namespace:rust": `${palette.purple}`,
        "selfKeyword:rust": `${palette.purple}`,
        // }}}
    };
}
exports.getDefaultSemantic = getDefaultSemantic;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=default.js.map