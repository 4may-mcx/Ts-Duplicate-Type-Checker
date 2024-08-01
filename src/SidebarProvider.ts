import * as vscode from "vscode";
import { DuplicateTypeMessage } from "../types/message";
import getTypeCheckResult from "./type-checker";

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "openFile":
          const uri = vscode.Uri.file(message.filePath);
          vscode.commands.executeCommand("vscode.open", uri);
          break;
      }
    });

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // todo@xmc: 补充获取路径的逻辑

    // 每次切换回来时都重新发送数据到 Webview
    this._view.onDidChangeVisibility(() => {
      this._view?.visible && this.sendCheckerResultToWebview();
    });
    this.sendCheckerResultToWebview();
  }

  private sendCheckerResultToWebview() {
    const data = getTypeCheckResult();
    this._view?.webview.postMessage(data);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const reactAppPath = vscode.Uri.joinPath(
      this._extensionUri,
      "react-app",
      "dist",
      "bundle.js"
    );
    const reactAppUri = webview.asWebviewUri(reactAppPath);

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVscodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleVscodeUri}" rel="stylesheet">
        <link href="${styleResetUri}" rel="stylesheet">
      </head>
      <body>
        <div id="root" />
        <script src="${reactAppUri}"></script>
      </body>
      </html>`;
  }
}
