import * as vscode from "vscode";
import { checkEnvironmentCommand } from "./commands/checkEnvironment";
import { installExtensionsCommand } from "./commands/installExtensions";
import { setupProfileCommand } from "./commands/setupProfile";
import { ToolsTreeDataProvider } from "./views/toolsTreeDataProvider";

export function activate(context: vscode.ExtensionContext) {
    // 註冊側邊欄 TreeView
    const toolsProvider = new ToolsTreeDataProvider();
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("cgmh.toolsView", toolsProvider)
    );

    // 註冊命令
    context.subscriptions.push(
        vscode.commands.registerCommand("cgmh.checkEnvironment", async () => {
            await checkEnvironmentCommand();
            await toolsProvider.refresh();
        }),
        vscode.commands.registerCommand("cgmh.setupProfile", () => setupProfileCommand(context.globalState)),
        vscode.commands.registerCommand("cgmh.installExtensions", installExtensionsCommand)
    );

    // 啟動時自動執行環境檢測並更新側邊欄
    const config = vscode.workspace.getConfiguration("cgmh");
    const skipCheck = config.get<boolean>("skipEnvironmentCheck", false);

    if (!skipCheck) {
        setTimeout(async () => {
            await toolsProvider.refresh();
            await vscode.commands.executeCommand("cgmh.checkEnvironment");
        }, 2000);
    } else {
        // 即使跳過通知，也更新側邊欄狀態
        toolsProvider.refresh();
    }
}

export function deactivate() { }
