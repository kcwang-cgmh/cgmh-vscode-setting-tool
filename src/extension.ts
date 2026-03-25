import * as vscode from "vscode";
import { checkEnvironmentCommand } from "./commands/checkEnvironment";
import { installExtensionsCommand } from "./commands/installExtensions";
import { setupProfileCommand } from "./commands/setupProfile";

export function activate(context: vscode.ExtensionContext) {
    // 註冊命令
    context.subscriptions.push(
        vscode.commands.registerCommand("cgmh.checkEnvironment", checkEnvironmentCommand),
        vscode.commands.registerCommand("cgmh.setupProfile", setupProfileCommand),
        vscode.commands.registerCommand("cgmh.installExtensions", installExtensionsCommand)
    );

    // 啟動時自動執行環境檢測（僅在使用者未略過時）
    const config = vscode.workspace.getConfiguration("cgmh");
    const skipCheck = config.get<boolean>("skipEnvironmentCheck", false);

    if (!skipCheck) {
        // 延遲 2 秒後執行，避免影響啟動效能
        setTimeout(() => {
            vscode.commands.executeCommand("cgmh.checkEnvironment");
        }, 2000);
    }
}

export function deactivate() { }
