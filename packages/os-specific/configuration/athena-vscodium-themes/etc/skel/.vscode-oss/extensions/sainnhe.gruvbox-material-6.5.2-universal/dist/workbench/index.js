"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkbench = void 0;
const palette_1 = require("../palette");
const flat_1 = require("./flat");
const highContrast_1 = require("./highContrast");
const material_1 = require("./material");
function getWorkbench(configuration, variant) {
    const palette = (0, palette_1.getPalette)(configuration, variant);
    if (variant === "dark") {
        switch (configuration.darkWorkbench) {
            case "material":
                return (0, material_1.materialWorkbench)(palette, configuration, "dark");
            case "flat":
                return (0, flat_1.flatWorkbench)(palette, configuration, "dark");
            case "high-contrast":
                return (0, highContrast_1.highContrastWorkbench)(palette, configuration, "dark");
            default:
                return (0, material_1.materialWorkbench)(palette, configuration, "dark");
        }
    }
    else {
        switch (configuration.lightWorkbench) {
            case "material":
                return (0, material_1.materialWorkbench)(palette, configuration, "light");
            case "flat":
                return (0, flat_1.flatWorkbench)(palette, configuration, "light");
            case "high-contrast":
                return (0, highContrast_1.highContrastWorkbench)(palette, configuration, "light");
            default:
                return (0, material_1.materialWorkbench)(palette, configuration, "light");
        }
    }
}
exports.getWorkbench = getWorkbench;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=index.js.map