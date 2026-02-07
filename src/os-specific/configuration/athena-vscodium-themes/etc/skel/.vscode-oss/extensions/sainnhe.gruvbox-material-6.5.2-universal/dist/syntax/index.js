"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyntax = void 0;
const palette_1 = require("../palette");
const default_1 = require("./default");
const italic_1 = require("./italic");
const colorful_1 = require("./colorful");
const colorfulItalic_1 = require("./colorfulItalic");
function getSyntax(configuration, variant) {
    const palette = (0, palette_1.getPalette)(configuration, variant);
    let syntax;
    if (configuration.colorfulSyntax === false) {
        if (configuration.italicKeywords === true) {
            syntax = (0, italic_1.getItalicSyntax)(palette, configuration.italicComments);
        }
        else {
            syntax = (0, default_1.getDefaultSyntax)(palette, configuration.italicComments);
        }
    }
    else {
        if (configuration.italicKeywords === true) {
            syntax = (0, colorfulItalic_1.getColorfulItalicSyntax)(palette, configuration.italicComments);
        }
        else {
            syntax = (0, colorful_1.getColorfulSyntax)(palette, configuration.italicComments);
        }
    }
    return syntax;
}
exports.getSyntax = getSyntax;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=index.js.map