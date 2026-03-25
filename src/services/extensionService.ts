import * as vscode from "vscode";
import { extensionCatalog } from "../data/extensionCatalog";

/**
 * 檢查延伸模組是否已安裝
 */
function isExtensionInstalled(extensionId: string): boolean {
    return vscode.extensions.getExtension(extensionId) !== undefined;
}

/**
 * 分類選擇並批次安裝延伸模組
 */
export async function installExtensionsByCategory(): Promise<void> {
    // 建立 QuickPick 項目，顯示每個分類的名稱、數量、描述
    const items = extensionCatalog.map((category) => {
        const installedCount = category.extensions.filter((ext) => isExtensionInstalled(ext.id)).length;
        const totalCount = category.extensions.length;
        return {
            label: category.label,
            description: `${installedCount}/${totalCount} 已安裝`,
            detail: category.description,
            picked: true, // 預設全選
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

    // 收集待安裝的延伸模組（排除已安裝的）
    const toInstall: { id: string; name: string; categoryLabel: string }[] = [];
    for (const item of selected) {
        for (const ext of item.category.extensions) {
            if (!isExtensionInstalled(ext.id)) {
                toInstall.push({ id: ext.id, name: ext.name, categoryLabel: item.category.label });
            }
        }
    }

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

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "正在安裝延伸模組",
            cancellable: false,
        },
        async (progress) => {
            let installed = 0;
            let failed = 0;

            for (const ext of toInstall) {
                progress.report({
                    message: `(${installed + failed + 1}/${toInstall.length}) ${ext.name}`,
                    increment: 100 / toInstall.length,
                });

                try {
                    await vscode.commands.executeCommand(
                        "workbench.extensions.installExtension",
                        ext.id
                    );
                    installed++;
                } catch {
                    failed++;
                }
            }

            if (failed === 0) {
                vscode.window.showInformationMessage(`已成功安裝 ${installed} 個延伸模組！`);
            } else {
                vscode.window.showWarningMessage(
                    `安裝完成：${installed} 個成功，${failed} 個失敗。`
                );
            }
        }
    );
}
