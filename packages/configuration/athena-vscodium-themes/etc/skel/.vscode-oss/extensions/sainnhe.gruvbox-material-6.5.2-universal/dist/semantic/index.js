"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemantic = void 0;
const palette_1 = require("../palette");
const default_1 = require("./default");
const colorful_1 = require("./colorful");
function getSemantic(configuration, variant) {
    const palette = (0, palette_1.getPalette)(configuration, variant);
    let semantic;
    if (configuration.colorfulSyntax === false) {
        semantic = (0, default_1.getDefaultSemantic)(palette);
    }
    else {
        semantic = (0, colorful_1.getColorfulSemantic)(palette);
    }
    return semantic;
}
exports.getSemantic = getSemantic;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=index.js.map