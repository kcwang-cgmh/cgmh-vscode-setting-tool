import * as vscode from "vscode";
import { defaultSettings } from "../data/defaultSettings";

/**
 * 套用預設設定到使用者的 Global 設定中
 * 只補上缺少的設定，不覆蓋已有的自訂值
 */
export async function applyDefaultSettings(): Promise<{ applied: number; skipped: number }> {
    const config = vscode.workspace.getConfiguration();
    let applied = 0;
    let skipped = 0;

    for (const [key, value] of Object.entries(defaultSettings)) {
        const inspection = config.inspect(key);

        // 如果使用者已有全域設定值，跳過不覆蓋
        if (inspection?.globalValue !== undefined) {
            skipped++;
            continue;
        }

        // 處理含有 section 的 key（如 "[markdown]"）
        if (key.startsWith("[") && key.endsWith("]")) {
            const langId = key.slice(1, -1);
            const langConfig = vscode.workspace.getConfiguration("", { languageId: langId });
            const langValue = value as Record<string, unknown>;
            for (const [subKey, subVal] of Object.entries(langValue)) {
                const subInspection = langConfig.inspect(subKey);
                if (subInspection?.globalLanguageValue !== undefined) {
                    skipped++;
                    continue;
                }
                await langConfig.update(subKey, subVal, vscode.ConfigurationTarget.Global, true);
                applied++;
            }
            continue;
        }

        // 取得 section 和 key 的部分
        const dotIndex = key.lastIndexOf(".");
        if (dotIndex === -1) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        } else {
            const section = key.substring(0, dotIndex);
            const prop = key.substring(dotIndex + 1);
            await vscode.workspace.getConfiguration(section).update(prop, value, vscode.ConfigurationTarget.Global);
        }
        applied++;
    }

    return { applied, skipped };
}

/**
 * Profile 建立與設定套用流程
 */
export async function setupProfile(): Promise<void> {
    const choice = await vscode.window.showQuickPick(
        [
            { label: "$(add) 建立新的設定檔 (Profile)", description: "建立新 Profile 後套用預設設定", value: "create" },
            { label: "$(settings-gear) 套用到目前的設定檔", description: "將預設設定套用到目前使用中的 Profile", value: "apply" },
        ],
        { title: "長庚醫科開發設定工具", placeHolder: "請選擇操作方式" }
    );

    if (!choice) {
        return;
    }

    if (choice.value === "create") {
        // 觸發 VS Code 原生的 Profile 建立對話框
        await vscode.commands.executeCommand("workbench.profiles.actions.createProfile");

        // 等待使用者完成建立後再套用設定
        const proceed = await vscode.window.showInformationMessage(
            "Profile 建立完成後，是否要套用長庚醫科預設設定？",
            "套用設定",
            "取消"
        );

        if (proceed !== "套用設定") {
            return;
        }
    }

    // 計算將要套用的設定數量
    const config = vscode.workspace.getConfiguration();
    let newCount = 0;
    for (const key of Object.keys(defaultSettings)) {
        if (key.startsWith("[") && key.endsWith("]")) {
            const langId = key.slice(1, -1);
            const langConfig = vscode.workspace.getConfiguration("", { languageId: langId });
            const langValue = defaultSettings[key] as Record<string, unknown>;
            for (const subKey of Object.keys(langValue)) {
                const subInspection = langConfig.inspect(subKey);
                if (subInspection?.globalLanguageValue === undefined) {
                    newCount++;
                }
            }
            continue;
        }
        const inspection = config.inspect(key);
        if (inspection?.globalValue === undefined) {
            newCount++;
        }
    }

    if (newCount === 0) {
        vscode.window.showInformationMessage("所有預設設定已存在，無需額外套用。");
        return;
    }

    const confirm = await vscode.window.showInformationMessage(
        `將套用 ${newCount} 項新設定（已有的自訂設定不會被覆蓋），是否繼續？`,
        "確認套用",
        "取消"
    );

    if (confirm !== "確認套用") {
        return;
    }

    const result = await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "正在套用預設設定...",
            cancellable: false,
        },
        async () => applyDefaultSettings()
    );

    vscode.window.showInformationMessage(
        `設定套用完成！已套用 ${result.applied} 項設定，跳過 ${result.skipped} 項已有設定。`
    );
}
