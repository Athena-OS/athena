"use strict";
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
exports.deactivate = exports.activate = void 0;
const languageserver = require("./languageserver");
const psi = require("./psi/psiViewer");
let luadoc = require('../3rd/vscode-lua-doc/extension.js');
function activate(context) {
    languageserver.activate(context);
    let luaDocContext = {
        ViewType: undefined,
        OpenCommand: undefined,
        extensionPath: undefined,
    };
    for (const k in context) {
        try {
            luaDocContext[k] = context[k];
        }
        catch (error) { }
    }
    luaDocContext.ViewType = 'lua-doc';
    luaDocContext.OpenCommand = 'extension.lua.doc';
    luaDocContext.extensionPath = context.extensionPath + '/client/3rd/vscode-lua-doc';
    luadoc.activate(luaDocContext);
    psi.activate(context);
    return {
        reportAPIDoc(params) {
            return __awaiter(this, void 0, void 0, function* () {
                yield languageserver.reportAPIDoc(params);
            });
        }
    };
}
exports.activate = activate;
function deactivate() {
    languageserver.deactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map