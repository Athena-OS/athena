"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPalette = void 0;
const material_1 = require("./dark/foreground/material");
const mix_1 = require("./dark/foreground/mix");
const original_1 = require("./dark/foreground/original");
const hard_1 = require("./dark/background/hard");
const medium_1 = require("./dark/background/medium");
const soft_1 = require("./dark/background/soft");
const material_2 = require("./light/foreground/material");
const mix_2 = require("./light/foreground/mix");
const original_2 = require("./light/foreground/original");
const hard_2 = require("./light/background/hard");
const medium_2 = require("./light/background/medium");
const soft_2 = require("./light/background/soft");
function getPalette(configuration, variant) {
    let paletteBackground = medium_1.default;
    let paletteForeground = material_1.default;
    if (variant === "dark") {
        // {{{
        switch (configuration.darkContrast // {{{
        ) {
            case "hard": {
                paletteBackground = hard_1.default;
                break;
            }
            case "medium": {
                paletteBackground = medium_1.default;
                break;
            }
            case "soft": {
                paletteBackground = soft_1.default;
                break;
            }
            default: {
                paletteBackground = medium_1.default;
            }
        } // }}}
        switch (configuration.darkPalette // {{{
        ) {
            case "material": {
                paletteForeground = material_1.default;
                break;
            }
            case "mix": {
                paletteForeground = mix_1.default;
                break;
            }
            case "original": {
                paletteForeground = original_1.default;
                break;
            }
            default: {
                paletteForeground = material_1.default;
            } // }}}
        } // }}}
    }
    else {
        // {{{
        switch (configuration.lightContrast // {{{
        ) {
            case "hard": {
                paletteBackground = hard_2.default;
                break;
            }
            case "medium": {
                paletteBackground = medium_2.default;
                break;
            }
            case "soft": {
                paletteBackground = soft_2.default;
                break;
            }
            default: {
                paletteBackground = medium_2.default;
            }
        } // }}}
        switch (configuration.lightPalette // {{{
        ) {
            case "material": {
                paletteForeground = material_2.default;
                break;
            }
            case "mix": {
                paletteForeground = mix_2.default;
                break;
            }
            case "original": {
                paletteForeground = original_2.default;
                break;
            }
            default: {
                paletteForeground = material_2.default;
            }
        } // }}}
    } // }}}
    return {
        // {{{
        bg0: paletteBackground.bg0,
        bg1: paletteBackground.bg1,
        bg: paletteBackground.bg,
        bg2: paletteBackground.bg2,
        bg3: paletteBackground.bg3,
        bg4: paletteBackground.bg4,
        bg5: paletteBackground.bg5,
        bg6: paletteBackground.bg6,
        bg7: paletteBackground.bg7,
        bg8: paletteBackground.bg8,
        bg9: paletteBackground.bg9,
        grey0: paletteBackground.grey0,
        grey1: paletteBackground.grey1,
        grey2: paletteBackground.grey2,
        shadow: paletteBackground.shadow,
        fg0: paletteForeground.fg0,
        fg: paletteForeground.fg,
        fg1: paletteForeground.fg1,
        red: paletteForeground.red,
        orange: paletteForeground.orange,
        yellow: paletteForeground.yellow,
        green: paletteForeground.green,
        aqua: paletteForeground.aqua,
        blue: paletteForeground.blue,
        purple: paletteForeground.purple,
        dimRed: paletteForeground.dimRed,
        dimOrange: paletteForeground.dimOrange,
        dimYellow: paletteForeground.dimYellow,
        dimGreen: paletteForeground.dimGreen,
        dimAqua: paletteForeground.dimAqua,
        dimBlue: paletteForeground.dimBlue,
        dimPurple: paletteForeground.dimPurple,
    }; // }}}
}
exports.getPalette = getPalette;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=index.js.map