"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
function activate() {
    vscode_1.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("gruvboxMaterial")) {
            vscode_1.window.showInformationMessage("Configuration options are currently not available in vscode web.");
        }
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=index-web.js.map