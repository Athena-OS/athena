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
exports.reportAPIDoc = exports.deactivate = exports.activate = exports.defaultClient = void 0;
const path = require("path");
const os = require("os");
const fs = require("fs");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
function registerCustomCommands(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('lua.config', (changes) => {
        let propMap = new Map();
        for (const data of changes) {
            let config = vscode_1.workspace.getConfiguration(undefined, vscode_1.Uri.parse(data.uri));
            if (data.action == 'add') {
                let value = config.get(data.key);
                value.push(data.value);
                config.update(data.key, value, data.global);
                continue;
            }
            if (data.action == 'set') {
                config.update(data.key, data.value, data.global);
                continue;
            }
            if (data.action == 'prop') {
                if (!propMap[data.key]) {
                    propMap[data.key] = config.get(data.key);
                }
                propMap[data.key][data.prop] = data.value;
                config.update(data.key, propMap[data.key], data.global);
                continue;
            }
        }
    }));
}
class LuaClient {
    constructor(context, documentSelector) {
        this.context = context;
        this.documentSelector = documentSelector;
        this.disposables = new Array();
    }
    start() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Options to control the language client
            let clientOptions = {
                // Register the server for plain text documents
                documentSelector: this.documentSelector,
                progressOnInitialization: true,
                markdown: {
                    isTrusted: true,
                    supportHtml: true,
                },
                initializationOptions: {
                    changeConfiguration: true,
                }
            };
            let config = vscode_1.workspace.getConfiguration(undefined, (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]);
            let commandParam = config.get("Lua.misc.parameters");
            let command = yield this.getCommand(config);
            let serverOptions = {
                command: command,
                args: commandParam,
            };
            this.client = new node_1.LanguageClient('Lua', 'Lua', serverOptions, clientOptions);
            //client.registerProposedFeatures();
            yield this.client.start();
            this.onCommand();
            this.statusBar();
        });
    }
    getCommand(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let executablePath = config.get("Lua.misc.executablePath");
            if (executablePath && executablePath != "") {
                return executablePath;
            }
            let command;
            let platform = os.platform();
            let binDir;
            if ((yield fs.promises.stat(this.context.asAbsolutePath('server/bin'))).isDirectory()) {
                binDir = 'bin';
            }
            switch (platform) {
                case "win32":
                    command = this.context.asAbsolutePath(path.join('server', binDir ? binDir : 'bin-Windows', 'lua-language-server.exe'));
                    break;
                case "linux":
                    command = this.context.asAbsolutePath(path.join('server', binDir ? binDir : 'bin-Linux', 'lua-language-server'));
                    yield fs.promises.chmod(command, '777');
                    break;
                case "darwin":
                    command = this.context.asAbsolutePath(path.join('server', binDir ? binDir : 'bin-macOS', 'lua-language-server'));
                    yield fs.promises.chmod(command, '777');
                    break;
            }
            return command;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.stop();
            for (const disposable of this.disposables) {
                disposable.dispose();
            }
        });
    }
    statusBar() {
        let client = this.client;
        let bar = vscode_1.window.createStatusBarItem();
        bar.text = 'Lua';
        bar.command = 'Lua.statusBar';
        this.disposables.push(vscode_1.commands.registerCommand(bar.command, () => {
            client.sendNotification('$/status/click');
        }));
        this.disposables.push(client.onNotification('$/status/show', (params) => {
            bar.show();
        }));
        this.disposables.push(client.onNotification('$/status/hide', (params) => {
            bar.hide();
        }));
        this.disposables.push(client.onNotification('$/status/report', (params) => {
            bar.text = params.text;
            bar.tooltip = params.tooltip;
        }));
        client.sendNotification('$/status/refresh');
        this.disposables.push(bar);
    }
    onCommand() {
        this.disposables.push(this.client.onNotification('$/command', (params) => {
            vscode_1.commands.executeCommand(params.command, params.data);
        }));
    }
}
function activate(context) {
    registerCustomCommands(context);
    function didOpenTextDocument(document) {
        // We are only interested in language mode text
        if (document.languageId !== 'lua' || (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled')) {
            return;
        }
        // Untitled files go to a default client.
        if (!exports.defaultClient) {
            exports.defaultClient = new LuaClient(context, [
                { language: 'lua' }
            ]);
            exports.defaultClient.start();
            return;
        }
    }
    vscode_1.workspace.onDidOpenTextDocument(didOpenTextDocument);
    vscode_1.workspace.textDocuments.forEach(didOpenTextDocument);
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.defaultClient) {
            exports.defaultClient.stop();
            exports.defaultClient = null;
        }
        return undefined;
    });
}
exports.deactivate = deactivate;
function reportAPIDoc(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.defaultClient) {
            return;
        }
        exports.defaultClient.client.sendNotification('$/api/report', params);
    });
}
exports.reportAPIDoc = reportAPIDoc;
//# sourceMappingURL=languageserver.js.map