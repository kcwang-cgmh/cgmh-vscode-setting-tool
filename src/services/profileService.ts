import * as vscode from "vscode";
import { defaultSettings, settingsVersion } from "../data/defaultSettings";

const APPLIED_VERSION_KEY = "cgmh.appliedSettingsVersion";
const APPLIED_SNAPSHOT_KEY = "cgmh.appliedSettingsSnapshot";

export interface ApplyResult {
    applied: number;
    skipped: number;
    updated: number;
}

/**
 * 套用預設設定到使用者的 Global 設定中
 * - 首次套用：只補上缺少的設定
 * - 版本更新：比對上次套用的快照，只覆蓋使用者沒有手動修改過的設定
 */
export async function applyDefaultSettings(globalState: vscode.Memento): Promise<ApplyResult> {
    const config = vscode.workspace.getConfiguration();
    const previousVersion = globalState.get<number>(APPLIED_VERSION_KEY, 0);
    const snapshot = globalState.get<Record<string, unknown>>(APPLIED_SNAPSHOT_KEY, {});
    const isUpgrade = previousVersion > 0 && previousVersion < settingsVersion;

    let applied = 0;
    let skipped = 0;
    let updated = 0;
    const newSnapshot: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(defaultSettings)) {
        // 處理語言設定（如 "[markdown]"）
        if (key.startsWith("[") && key.endsWith("]")) {
            const langId = key.slice(1, -1);
            const langConfig = vscode.workspace.getConfiguration("", { languageId: langId });
            const langValue = value as Record<string, unknown>;
            for (const [subKey, subVal] of Object.entries(langValue)) {
                const snapshotKey = `${key}.${subKey}`;
                newSnapshot[snapshotKey] = subVal;

                const subInspection = langConfig.inspect(subKey);
                const currentValue = subInspection?.globalLanguageValue;

                if (currentValue === undefined) {
                    await langConfig.update(subKey, subVal, vscode.ConfigurationTarget.Global, true);
                    applied++;
                } else if (isUpgrade && deepEqual(currentValue, snapshot[snapshotKey])) {
                    await langConfig.update(subKey, subVal, vscode.ConfigurationTarget.Global, true);
                    updated++;
                } else {
                    skipped++;
                }
            }
            continue;
        }

        newSnapshot[key] = value;
        const inspection = config.inspect(key);

        if (inspection?.globalValue === undefined) {
            // 設定不存在，補上
            const dotIndex = key.lastIndexOf(".");
            if (dotIndex === -1) {
                await config.update(key, value, vscode.ConfigurationTarget.Global);
            } else {
                const section = key.substring(0, dotIndex);
                const prop = key.substring(dotIndex + 1);
                await vscode.workspace.getConfiguration(section).update(prop, value, vscode.ConfigurationTarget.Global);
            }
            applied++;
        } else if (isUpgrade && deepEqual(inspection.globalValue, snapshot[key])) {
            // 版本升級 + 使用者沒手動改過（現值 === 上次套用值）→ 覆蓋
            const dotIndex = key.lastIndexOf(".");
            if (dotIndex === -1) {
                await config.update(key, value, vscode.ConfigurationTarget.Global);
            } else {
                const section = key.substring(0, dotIndex);
                const prop = key.substring(dotIndex + 1);
                await vscode.workspace.getConfiguration(section).update(prop, value, vscode.ConfigurationTarget.Global);
            }
            updated++;
        } else {
            skipped++;
        }
    }

    // 記錄版本號和快照
    await globalState.update(APPLIED_VERSION_KEY, settingsVersion);
    await globalState.update(APPLIED_SNAPSHOT_KEY, newSnapshot);

    return { applied, skipped, updated };
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) { return true; }
    if (a === null || b === null || a === undefined || b === undefined) { return false; }
    if (typeof a !== typeof b) { return false; }
    if (typeof a !== "object") { return false; }

    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) { return false; }
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}

/**
 * Profile 建立與設定套用流程
 */
export async function setupProfile(globalState: vscode.Memento): Promise<void> {
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
        await vscode.commands.executeCommand("workbench.profiles.actions.createProfile");

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
    const previousVersion = globalState.get<number>(APPLIED_VERSION_KEY, 0);
    const snapshot = globalState.get<Record<string, unknown>>(APPLIED_SNAPSHOT_KEY, {});
    const isUpgrade = previousVersion > 0 && previousVersion < settingsVersion;
    const config = vscode.workspace.getConfiguration();
    let newCount = 0;
    let updateCount = 0;

    for (const key of Object.keys(defaultSettings)) {
        if (key.startsWith("[") && key.endsWith("]")) {
            const langId = key.slice(1, -1);
            const langConfig = vscode.workspace.getConfiguration("", { languageId: langId });
            const langValue = defaultSettings[key] as Record<string, unknown>;
            for (const subKey of Object.keys(langValue)) {
                const subInspection = langConfig.inspect(subKey);
                const currentValue = subInspection?.globalLanguageValue;
                if (currentValue === undefined) {
                    newCount++;
                } else if (isUpgrade && deepEqual(currentValue, snapshot[`${key}.${subKey}`])) {
                    updateCount++;
                }
            }
            continue;
        }
        const inspection = config.inspect(key);
        if (inspection?.globalValue === undefined) {
            newCount++;
        } else if (isUpgrade && deepEqual(inspection.globalValue, snapshot[key])) {
            updateCount++;
        }
    }

    if (newCount === 0 && updateCount === 0) {
        vscode.window.showInformationMessage("所有預設設定已是最新，無需額外套用。");
        return;
    }

    const parts: string[] = [];
    if (newCount > 0) { parts.push(`${newCount} 項新設定`); }
    if (updateCount > 0) { parts.push(`${updateCount} 項更新設定`); }

    const confirm = await vscode.window.showInformationMessage(
        `將套用 ${parts.join("、")}（已自訂的設定不會被覆蓋），是否繼續？`,
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
        async () => applyDefaultSettings(globalState)
    );

    const resultParts: string[] = [];
    if (result.applied > 0) { resultParts.push(`新增 ${result.applied} 項`); }
    if (result.updated > 0) { resultParts.push(`更新 ${result.updated} 項`); }
    if (result.skipped > 0) { resultParts.push(`跳過 ${result.skipped} 項`); }

    vscode.window.showInformationMessage(`設定套用完成！${resultParts.join("、")}。`);
}
