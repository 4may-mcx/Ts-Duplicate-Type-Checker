import * as vscode from "vscode";

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

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "input":
          vscode.window.showInformationMessage(`你输入了: ${data.value}`);
          break;
      }
    });
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
