import { describe, it, expect, vi, beforeEach } from "vitest";
import { installExtensionsByCategory } from "../extensionService";
import * as vscode from "vscode";
import { extensionCatalog } from "../../data/extensionCatalog";

vi.mock("vscode");

describe("installExtensionsByCategory", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // 預設：所有延伸模組未安裝
        vi.mocked(vscode.extensions.getExtension).mockReturnValue(undefined);
    });

    it("should return early when user cancels selection", async () => {
        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(undefined);

        await installExtensionsByCategory();

        expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it("should show message when all extensions are already installed", async () => {
        // 所有延伸模組已安裝
        vi.mocked(vscode.extensions.getExtension).mockReturnValue({} as never);

        // 使用者選擇全部分類
        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(
            extensionCatalog.map((cat) => ({
                label: cat.label,
                description: "",
                detail: "",
                picked: true,
                category: cat,
            })) as never
        );

        await installExtensionsByCategory();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            expect.stringContaining("皆已安裝")
        );
    });

    it("should return early when user cancels confirmation", async () => {
        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(
            [{ label: "test", category: extensionCatalog[0] }] as never
        );
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue("取消" as never);

        await installExtensionsByCategory();

        expect(vscode.window.withProgress).not.toHaveBeenCalled();
    });

    it("should install extensions when user confirms", async () => {
        const testCategory = extensionCatalog[0];

        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(
            [{ label: testCategory.label, category: testCategory }] as never
        );
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue("開始安裝" as never);

        // withProgress 執行 callback
        vi.mocked(vscode.window.withProgress).mockImplementation(
            async (_opts, task) => task({ report: vi.fn() } as never, {} as never)
        );
        vi.mocked(vscode.commands.executeCommand).mockResolvedValue(undefined);

        await installExtensionsByCategory();

        expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(testCategory.extensions.length);
        for (const ext of testCategory.extensions) {
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                "workbench.extensions.installExtension",
                ext.id
            );
        }
    });

    it("should skip already installed extensions", async () => {
        const testCategory = extensionCatalog[0];
        const firstExtId = testCategory.extensions[0].id;

        // 第一個延伸模組已安裝
        vi.mocked(vscode.extensions.getExtension).mockImplementation(
            (id: string) => (id === firstExtId ? ({} as never) : undefined)
        );

        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(
            [{ label: testCategory.label, category: testCategory }] as never
        );
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue("開始安裝" as never);
        vi.mocked(vscode.window.withProgress).mockImplementation(
            async (_opts, task) => task({ report: vi.fn() } as never, {} as never)
        );
        vi.mocked(vscode.commands.executeCommand).mockResolvedValue(undefined);

        await installExtensionsByCategory();

        // 不應安裝第一個（已安裝的）
        expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(testCategory.extensions.length - 1);
        expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith(
            "workbench.extensions.installExtension",
            firstExtId
        );
    });

    it("should show warning when some installations fail", async () => {
        const testCategory = extensionCatalog[0];

        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(
            [{ label: testCategory.label, category: testCategory }] as never
        );
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue("開始安裝" as never);
        vi.mocked(vscode.window.withProgress).mockImplementation(
            async (_opts, task) => task({ report: vi.fn() } as never, {} as never)
        );

        // 第一次安裝失敗，其餘成功
        let callCount = 0;
        vi.mocked(vscode.commands.executeCommand).mockImplementation(async () => {
            callCount++;
            if (callCount === 1) {
                throw new Error("install failed");
            }
        });

        await installExtensionsByCategory();

        expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
            expect.stringContaining("失敗")
        );
    });
});
