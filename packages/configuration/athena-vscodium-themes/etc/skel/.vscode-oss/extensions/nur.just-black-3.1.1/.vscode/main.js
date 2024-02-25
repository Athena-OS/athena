/// <reference path="c:/Users/nurmo/.vscode/extensions/nur.script-0.1.3/@types/vscode.global.d.ts" />
/// <reference path="c:/Users/nurmo/.vscode/extensions/nur.script-0.1.3/@types/api.global.d.ts" />
//  @ts-check
//  API: https://code.visualstudio.com/api/references/vscode-api
// 'Reload Window' or 'Restart Extension Host' after edit...

Script.onActivate(_ctx => {
	window.showInformationMessage('Hello World!');
});
