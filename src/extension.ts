import * as vscode from "vscode";
import { PROJECT_PREFIX } from "./constants";
import { SidebarProvider } from "./SidebarProvider";
import typeChecker from "./type-checker";

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "checker-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${PROJECT_PREFIX}.checkTypes`, () => {
      vscode.window.showInformationMessage("来噜!!!");
      typeChecker();
    })
  );
}

export function deactivate() {}
