"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const languageserver_1 = require("../languageserver");
const LANGUAGE_ID = "lua";
/**
 * Manages webview panels
 */
class PsiViewer {
    constructor(context, column) {
        this.context = context;
        this.disposables = [];
        this.extensionPath = context.extensionPath;
        this.builtAppFolder = PsiViewer.distDirectory;
        // Create and show a new webview panel
        this.panel = vscode.window.createWebviewPanel(PsiViewer.viewType, PsiViewer.title, column, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, this.builtAppFolder))]
        });
        // Set the webview's initial html content
        this.panel.webview.html = this._getHtmlForWebview();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }
    static createOrShow(context) {
        // const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        // If we already have a panel, show it.
        // Otherwise, create angular panel.
        if (PsiViewer.currentPanel) {
            PsiViewer.currentPanel.panel.reveal(vscode.ViewColumn.Two);
        }
        else {
            PsiViewer.currentPanel = new PsiViewer(context, vscode.ViewColumn.Two);
            PsiViewer.currentPanel.active(context);
        }
        return PsiViewer.currentPanel;
    }
    dispose() {
        PsiViewer.currentPanel = undefined;
        // Clean up our resources
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    post(message) {
        this.panel.webview.postMessage(message);
    }
    /**
     * Returns html of the start page (index.html)
     */
    _getHtmlForWebview() {
        // path to dist folder
        const appDistPath = path.join(this.extensionPath, PsiViewer.distDirectory);
        const appDistPathUri = vscode.Uri.file(appDistPath);
        // path as uri
        const baseUri = this.panel.webview.asWebviewUri(appDistPathUri);
        // get path to index.html file from dist folder
        const indexPath = path.join(appDistPath, 'index.html');
        // read index file from file system
        let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });
        // update the base URI tag
        indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
        return indexHtml;
    }
    active(context) {
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(PsiViewer.onDidChangeTextDocument, null, context.subscriptions));
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(PsiViewer.onDidChangeActiveTextEditor, null, context.subscriptions));
        context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(PsiViewer.onDidChangeSelection, null, context.subscriptions));
    }
    requestPsi(editor) {
        if (this.timeoutToReqAnn) {
            clearTimeout(this.timeoutToReqAnn);
        }
        this.timeoutToReqAnn = setTimeout(() => {
            this.requestPsiImpl(editor);
        }, 150);
    }
    requestPsiImpl(editor) {
        const client = languageserver_1.defaultClient.client;
        let params = { uri: editor.document.uri.toString() };
        client === null || client === void 0 ? void 0 : client.sendRequest("$/psi/view", params).then(result => {
            if (result) {
                this.post({
                    type: "psi",
                    value: [result.data]
                });
            }
        });
    }
    requestPsiSelect(position, uri) {
        const client = languageserver_1.defaultClient.client;
        let params = { uri: uri.toString(), position };
        client === null || client === void 0 ? void 0 : client.sendRequest("$/psi/select", params).then(result => {
            if (result) {
                this.post({
                    type: "psi_select",
                    value: result.data
                });
            }
        });
    }
    static onDidChangeTextDocument(event) {
        const activeEditor = vscode.window.activeTextEditor;
        const viewer = PsiViewer.currentPanel;
        if (activeEditor
            && activeEditor.document === event.document
            && activeEditor.document.languageId === LANGUAGE_ID) {
            viewer.requestPsi(activeEditor);
        }
    }
    static onDidChangeActiveTextEditor(editor) {
        const viewer = PsiViewer.currentPanel;
        if (editor
            && editor.document.languageId === LANGUAGE_ID) {
            viewer.requestPsi(editor);
        }
    }
    static onDidChangeSelection(e) {
        if (e.kind == vscode.TextEditorSelectionChangeKind.Mouse
            || e.kind == vscode.TextEditorSelectionChangeKind.Keyboard) {
            const viewer = PsiViewer.currentPanel;
            if (viewer) {
                viewer.requestPsiSelect(e.selections[0].start, e.textEditor.document.uri);
            }
        }
    }
}
PsiViewer.viewType = 'LuaPsiView';
PsiViewer.title = "LuaPsiView";
PsiViewer.distDirectory = "client/web/dist";
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('lua.psi.view', () => {
        PsiViewer.createOrShow(context);
    }));
}
exports.activate = activate;
//# sourceMappingURL=psiViewer.js.map