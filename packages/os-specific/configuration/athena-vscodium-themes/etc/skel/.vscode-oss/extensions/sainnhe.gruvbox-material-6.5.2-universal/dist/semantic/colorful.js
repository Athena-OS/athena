"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorfulSemantic = void 0;
function getColorfulSemantic(palette) {
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
        "namespace:typescript": `${palette.purple}`,
        "enumMember:typescript": `${palette.yellow}`,
        "variable.defaultLibrary:typescript": `${palette.purple}`,
        "property.defaultLibrary:typescript": `${palette.purple}`,
        // }}}
        // TypeScript React {{{
        "namespace:typescriptreact": `${palette.purple}`,
        "enumMember:typescriptreact": `${palette.yellow}`,
        "variable.defaultLibrary:typescriptreact": `${palette.purple}`,
        "property.defaultLibrary:typescriptreact": `${palette.purple}`,
        // }}}
    };
}
exports.getColorfulSemantic = getColorfulSemantic;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=colorful.js.map