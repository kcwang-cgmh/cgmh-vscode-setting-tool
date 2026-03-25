import * as vscode from "vscode";
import { extensionCatalog } from "../data/extensionCatalog";

const MARKETPLACE_BASE_URL = "https://marketplace.visualstudio.com/items?itemName=";

/**
 * 檢查延伸模組是否已安裝
 */
function isExtensionInstalled(extensionId: string): boolean {
    return vscode.extensions.getExtension(extensionId) !== undefined;
}

interface InstallResult {
    name: string;
    id: string;
    categoryLabel: string;
    status: "installed" | "failed" | "skipped";
}

/**
 * 分類選擇並批次安裝延伸模組
 */
export async function installExtensionsByCategory(): Promise<void> {
    const items = extensionCatalog.map((category) => {
        const installedCount = category.extensions.filter((ext) => isExtensionInstalled(ext.id)).length;
        const totalCount = category.extensions.length;
        return {
            label: category.label,
            description: `${installedCount}/${totalCount} 已安裝`,
            detail: category.description,
            picked: true,
            category,
        };
    });

    const selected = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        title: "安裝推薦延伸模組",
        placeHolder: "選擇要安裝的模組分類（預設全選）",
    });

    if (!selected || selected.length === 0) {
        return;
    }

    // 收集所有延伸模組（含已安裝的，用於報告）
    const allExtensions: { id: string; name: string; categoryLabel: string; alreadyInstalled: boolean }[] = [];
    for (const item of selected) {
        for (const ext of item.category.extensions) {
            allExtensions.push({
                id: ext.id,
                name: ext.name,
                categoryLabel: item.category.label,
                alreadyInstalled: isExtensionInstalled(ext.id),
            });
        }
    }

    const toInstall = allExtensions.filter((ext) => !ext.alreadyInstalled);

    if (toInstall.length === 0) {
        vscode.window.showInformationMessage("所選分類中的所有延伸模組皆已安裝！");
        return;
    }

    const confirm = await vscode.window.showInformationMessage(
        `即將安裝 ${toInstall.length} 個延伸模組，是否繼續？`,
        "開始安裝",
        "取消"
    );

    if (confirm !== "開始安裝") {
        return;
    }

    const results: InstallResult[] = [];

    // 記錄已跳過的
    for (const ext of allExtensions.filter((e) => e.alreadyInstalled)) {
        results.push({ name: ext.name, id: ext.id, categoryLabel: ext.categoryLabel, status: "skipped" });
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "正在安裝延伸模組",
            cancellable: false,
        },
        async (progress) => {
            for (const ext of toInstall) {
                progress.report({
                    message: `(${results.filter((r) => r.status !== "skipped").length + 1}/${toInstall.length}) ${ext.name}`,
                    increment: 100 / toInstall.length,
                });

                try {
                    await vscode.commands.executeCommand(
                        "workbench.extensions.installExtension",
                        ext.id
                    );
                    results.push({ name: ext.name, id: ext.id, categoryLabel: ext.categoryLabel, status: "installed" });
                } catch {
                    results.push({ name: ext.name, id: ext.id, categoryLabel: ext.categoryLabel, status: "failed" });
                }
            }
        }
    );

    showInstallReport(results);
}

function showInstallReport(results: InstallResult[]): void {
    const installed = results.filter((r) => r.status === "installed");
    const failed = results.filter((r) => r.status === "failed");
    const skipped = results.filter((r) => r.status === "skipped");

    const output = vscode.window.createOutputChannel("CGMH 延伸模組安裝");
    output.clear();
    output.appendLine("═══════════════════════════════════════");
    output.appendLine("  延伸模組安裝報告");
    output.appendLine("═══════════════════════════════════════");
    output.appendLine("");

    if (installed.length > 0) {
        output.appendLine(`✅ 成功安裝 (${installed.length})`);
        for (const r of installed) {
            output.appendLine(`   ${r.name} (${r.id})`);
        }
        output.appendLine("");
    }

    if (failed.length > 0) {
        output.appendLine(`❌ 安裝失敗 (${failed.length})`);
        for (const r of failed) {
            output.appendLine(`   ${r.name} (${r.id})`);
            output.appendLine(`   → 手動安裝：${MARKETPLACE_BASE_URL}${r.id}`);
        }
        output.appendLine("");
    }

    if (skipped.length > 0) {
        output.appendLine(`⏭️ 已安裝，略過 (${skipped.length})`);
        for (const r of skipped) {
            output.appendLine(`   ${r.name} (${r.id})`);
        }
        output.appendLine("");
    }

    output.appendLine("═══════════════════════════════════════");
    output.show();

    if (failed.length === 0) {
        vscode.window.showInformationMessage(`已成功安裝 ${installed.length} 個延伸模組！`);
    } else {
        vscode.window.showWarningMessage(
            `安裝完成：${installed.length} 個成功，${failed.length} 個失敗。詳見輸出面板。`
        );
    }
}
