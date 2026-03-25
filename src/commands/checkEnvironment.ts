import * as vscode from "vscode";
import { checkEnvironment, type ToolCheckResult } from "../services/environmentService";

export async function checkEnvironmentCommand(): Promise<void> {
    const report = await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "正在檢測開發環境...",
            cancellable: false,
        },
        async () => checkEnvironment()
    );

    if (report.allPassed) {
        const action = await vscode.window.showInformationMessage(
            `✅ 環境檢測通過！${report.results.map((r) => `${r.name} ${r.version}`).join("、")}`,
            "不再提醒"
        );
        if (action === "不再提醒") {
            await disableAutoCheck();
        }
        return;
    }

    // 有項目未通過，顯示詳細結果
    const items: vscode.QuickPickItem[] = report.results.map((r) => ({
        label: statusIcon(r) + " " + r.name,
        description: r.version ?? "",
        detail: r.detail ?? (r.status === "installed" ? "已安裝" : ""),
    }));

    // 收集有下載連結的工具
    const missingTools = report.results.filter(
        (r) => r.status !== "installed" && r.downloadUrl
    );

    if (missingTools.length > 0) {
        const action = await vscode.window.showWarningMessage(
            `環境檢測發現 ${missingTools.length} 個問題需要處理`,
            "查看詳情",
            "開啟下載頁面",
            "不再提醒"
        );

        if (action === "查看詳情") {
            await vscode.window.showQuickPick(items, {
                title: "環境檢測結果",
                placeHolder: "以下是各項工具的檢測狀態",
            });
        } else if (action === "開啟下載頁面") {
            for (const tool of missingTools) {
                if (tool.downloadUrl) {
                    await vscode.env.openExternal(vscode.Uri.parse(tool.downloadUrl));
                }
            }
        } else if (action === "不再提醒") {
            await disableAutoCheck();
        }
    }
}

async function disableAutoCheck(): Promise<void> {
    await vscode.workspace.getConfiguration("cgmh")
        .update("skipEnvironmentCheck", true, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("已關閉啟動時自動檢測。如需重新啟用，請至設定中搜尋「cgmh.skipEnvironmentCheck」。");
}

function statusIcon(r: ToolCheckResult): string {
    switch (r.status) {
        case "installed": return "$(check)";
        case "missing": return "$(error)";
        case "misconfigured": return "$(warning)";
    }
}
