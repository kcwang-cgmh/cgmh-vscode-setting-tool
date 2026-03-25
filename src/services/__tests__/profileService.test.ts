import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { applyDefaultSettings } from "../profileService";
import * as vscode from "vscode";
import * as settingsModule from "../../data/defaultSettings";

vi.mock("vscode");

const { defaultSettings } = settingsModule;
const ORIGINAL_VERSION = settingsModule.settingsVersion;

function createMockGlobalState(store: Record<string, unknown> = {}): vscode.Memento {
    return {
        get: vi.fn((key: string, defaultValue?: unknown) => store[key] ?? defaultValue),
        update: vi.fn(async (key: string, value: unknown) => { store[key] = value; }),
        keys: vi.fn(() => Object.keys(store)),
        setKeysForSync: vi.fn(),
    } as unknown as vscode.Memento;
}

function setSettingsVersion(v: number) {
    Object.defineProperty(settingsModule, "settingsVersion", { value: v, writable: true, configurable: true });
}

describe("applyDefaultSettings", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        setSettingsVersion(ORIGINAL_VERSION);
    });

    it("should apply all settings when none exist (first time)", async () => {
        const mockUpdate = vi.fn();
        const mockInspect = vi.fn().mockReturnValue({ globalValue: undefined });

        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(),
            inspect: mockInspect,
            update: mockUpdate,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        const globalState = createMockGlobalState();
        const result = await applyDefaultSettings(globalState);

        expect(result.applied).toBeGreaterThan(0);
        expect(result.skipped).toBe(0);
        expect(result.updated).toBe(0);
        expect(globalState.update).toHaveBeenCalledWith("cgmh.appliedSettingsVersion", settingsModule.settingsVersion);
        expect(globalState.update).toHaveBeenCalledWith("cgmh.appliedSettingsSnapshot", expect.any(Object));
    });

    it("should skip settings that already have global values", async () => {
        const mockUpdate = vi.fn();

        const regularConfig = {
            get: vi.fn(),
            inspect: vi.fn().mockReturnValue({ globalValue: "existing-value" }),
            update: mockUpdate,
        };

        const langConfig = {
            get: vi.fn(),
            inspect: vi.fn().mockReturnValue({ globalLanguageValue: "existing-value" }),
            update: mockUpdate,
        };

        vi.mocked(vscode.workspace.getConfiguration).mockImplementation(
            (...args: unknown[]) => {
                const section = args[0] as string | undefined;
                const scope = args[1] as Record<string, unknown> | undefined;
                if (section === "" && scope && "languageId" in scope) {
                    return langConfig as unknown as ReturnType<typeof vscode.workspace.getConfiguration>;
                }
                return regularConfig as unknown as ReturnType<typeof vscode.workspace.getConfiguration>;
            }
        );

        const globalState = createMockGlobalState();
        const result = await applyDefaultSettings(globalState);

        expect(result.skipped).toBeGreaterThan(0);
        expect(result.applied).toBe(0);
    });

    it("should update settings when version upgraded and user did not modify", async () => {
        setSettingsVersion(2);

        const firstKey = Object.keys(defaultSettings).find((k) => !k.startsWith("["))!;
        const oldValue = "old-value";
        const oldSnapshot: Record<string, unknown> = { [firstKey]: oldValue };

        const globalState = createMockGlobalState({
            "cgmh.appliedSettingsVersion": 1,
            "cgmh.appliedSettingsSnapshot": oldSnapshot,
        });

        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(),
            inspect: vi.fn().mockImplementation((key: string) => {
                if (key === firstKey) {
                    return { globalValue: oldValue };
                }
                return { globalValue: undefined };
            }),
            update: vi.fn(),
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        const result = await applyDefaultSettings(globalState);

        expect(result.updated).toBeGreaterThanOrEqual(1);
    });

    it("should NOT update settings when user manually modified them", async () => {
        setSettingsVersion(2);

        const firstKey = Object.keys(defaultSettings).find((k) => !k.startsWith("["))!;
        const oldValue = "old-value";
        const oldSnapshot: Record<string, unknown> = { [firstKey]: oldValue };

        const globalState = createMockGlobalState({
            "cgmh.appliedSettingsVersion": 1,
            "cgmh.appliedSettingsSnapshot": oldSnapshot,
        });

        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(),
            inspect: vi.fn().mockImplementation((key: string) => {
                if (key === firstKey) {
                    return { globalValue: "user-custom-value" };
                }
                return { globalValue: undefined };
            }),
            update: vi.fn(),
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        const result = await applyDefaultSettings(globalState);

        expect(result.skipped).toBeGreaterThanOrEqual(1);
    });

    it("should handle language-specific settings", async () => {
        const mockUpdate = vi.fn();

        const regularConfig = {
            get: vi.fn(),
            inspect: vi.fn().mockReturnValue({ globalValue: "existing" }),
            update: mockUpdate,
        };

        const langConfig = {
            get: vi.fn(),
            inspect: vi.fn().mockReturnValue({ globalLanguageValue: undefined }),
            update: mockUpdate,
        };

        vi.mocked(vscode.workspace.getConfiguration).mockImplementation(
            (...args: unknown[]) => {
                const section = args[0] as string | undefined;
                const scope = args[1] as Record<string, unknown> | undefined;
                if (section === "" && scope && "languageId" in scope) {
                    return langConfig as unknown as ReturnType<typeof vscode.workspace.getConfiguration>;
                }
                return regularConfig as unknown as ReturnType<typeof vscode.workspace.getConfiguration>;
            }
        );

        const globalState = createMockGlobalState();
        const result = await applyDefaultSettings(globalState);

        const langSettingsCount = Object.keys(defaultSettings)
            .filter((k) => k.startsWith("[") && k.endsWith("]"))
            .reduce((count, key) => {
                const val = defaultSettings[key] as Record<string, unknown>;
                return count + Object.keys(val).length;
            }, 0);

        expect(result.applied).toBe(langSettingsCount);
    });
});
