"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const vscode_1 = require("vscode");
const workbench_1 = require("./workbench");
const syntax_1 = require("./syntax");
const semantic_1 = require("./semantic");
class Utils {
    detectConfigChanges(
    // {{{
    event, onConfigChange) {
        if (event.affectsConfiguration("gruvboxMaterial")) {
            onConfigChange();
        }
    } // }}}
    getConfiguration() {
        // {{{
        const workspaceConfiguration = vscode_1.workspace.getConfiguration("gruvboxMaterial");
        return {
            darkContrast: workspaceConfiguration.get("darkContrast"),
            lightContrast: workspaceConfiguration.get("lightContrast"),
            darkWorkbench: workspaceConfiguration.get("darkWorkbench"),
            lightWorkbench: workspaceConfiguration.get("lightWorkbench"),
            darkSelection: workspaceConfiguration.get("darkSelection"),
            lightSelection: workspaceConfiguration.get("lightSelection"),
            darkCursor: workspaceConfiguration.get("darkCursor"),
            lightCursor: workspaceConfiguration.get("lightCursor"),
            darkPalette: workspaceConfiguration.get("darkPalette"),
            lightPalette: workspaceConfiguration.get("lightPalette"),
            colorfulSyntax: workspaceConfiguration.get("colorfulSyntax"),
            italicKeywords: workspaceConfiguration.get("italicKeywords"),
            italicComments: workspaceConfiguration.get("italicComments"),
            diagnosticTextBackgroundOpacity: workspaceConfiguration.get("diagnosticTextBackgroundOpacity"),
            highContrast: workspaceConfiguration.get("highContrast"),
        };
    } // }}}
    isDefaultConfiguration(configuration) {
        // {{{
        return (configuration.colorfulSyntax === false &&
            configuration.italicKeywords === false &&
            configuration.italicComments === true &&
            configuration.lightPalette === "material" &&
            configuration.darkPalette === "material" &&
            configuration.lightWorkbench === "material" &&
            configuration.darkWorkbench === "material" &&
            configuration.lightContrast === "medium" &&
            configuration.darkContrast === "medium" &&
            configuration.darkCursor === "white" &&
            configuration.lightCursor === "black" &&
            configuration.darkSelection === "grey" &&
            configuration.lightSelection === "grey" &&
            configuration.diagnosticTextBackgroundOpacity === "0%" &&
            configuration.highContrast === false);
    } // }}}
    getThemeData(configuration) {
        // {{{
        return {
            dark: {
                name: "Gruvbox Material Dark",
                type: "dark",
                semanticHighlighting: true,
                semanticTokenColors: (0, semantic_1.getSemantic)(configuration, "dark"),
                colors: (0, workbench_1.getWorkbench)(configuration, "dark"),
                tokenColors: (0, syntax_1.getSyntax)(configuration, "dark"),
            },
            light: {
                name: "Gruvbox Material Light",
                type: "light",
                semanticHighlighting: true,
                semanticTokenColors: (0, semantic_1.getSemantic)(configuration, "light"),
                colors: (0, workbench_1.getWorkbench)(configuration, "light"),
                tokenColors: (0, syntax_1.getSyntax)(configuration, "light"),
            },
        };
    } // }}}
    isNewlyInstalled() {
        // {{{
        const flagPath = (0, path_1.join)(__dirname, "..", ".flag");
        if (!fs.existsSync(flagPath)) {
            this.writeFile(flagPath, "");
            return true;
        }
        else {
            return false;
        }
    } // }}}
    writeFile(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // {{{
            return new Promise((resolve, reject) => {
                fs.writeFile(path, JSON.stringify(data, null, 2), (err) => err ? reject(err) : resolve("Success"));
            });
        });
    } // }}}
    promptToReload() {
        // {{{
        const action = "Reload";
        vscode_1.window
            .showInformationMessage("Reload required.", action)
            .then((selectedAction) => {
            if (selectedAction === action) {
                vscode_1.commands.executeCommand("workbench.action.reloadWindow");
            }
        });
    } // }}}
    generate(darkPath, lightPath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // {{{
            this.writeFile(darkPath, data.dark).then(this.promptToReload);
            this.writeFile(lightPath, data.light);
        });
    } // }}}
}
exports.default = Utils;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=utils.js.map