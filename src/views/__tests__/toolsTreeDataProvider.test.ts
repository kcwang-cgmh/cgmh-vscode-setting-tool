import { describe, it, expect, vi, beforeEach } from "vitest";
import { ToolsTreeDataProvider } from "../toolsTreeDataProvider";
import * as vscode from "vscode";
import * as environmentService from "../../services/environmentService";

vi.mock("vscode");
vi.mock("../../services/environmentService");

const mockCheckEnvironment = vi.mocked(environmentService.checkEnvironment);

describe("ToolsTreeDataProvider", () => {
    let provider: ToolsTreeDataProvider;

    beforeEach(() => {
        vi.resetAllMocks();
        provider = new ToolsTreeDataProvider();
    });

    it("should return 2 categories at root", () => {
        const children = provider.getChildren();
        expect(children).toHaveLength(2);
        expect(children[0]).toHaveProperty("type", "category");
        expect(children[0]).toHaveProperty("label", "環境狀態");
        expect(children[1]).toHaveProperty("type", "category");
        expect(children[1]).toHaveProperty("label", "工具");
    });

    it("should return tool items under 工具 category", () => {
        const categories = provider.getChildren();
        const toolCategory = categories[1];
        const tools = provider.getChildren(toolCategory);
        expect(tools).toHaveLength(2);
        expect(tools.map((t) => (t as { label: string }).label)).toEqual([
            "建立設定檔",
            "安裝推薦延伸模組",
        ]);
    });

    it("should show placeholder when env not yet checked", () => {
        const categories = provider.getChildren();
        const envCategory = categories[0];
        const envItems = provider.getChildren(envCategory);
        expect(envItems).toHaveLength(1);
        expect(envItems[0]).toHaveProperty("label", "尚未檢測");
    });

    it("should show env results after refresh", async () => {
        mockCheckEnvironment.mockResolvedValue({
            allPassed: true,
            results: [
                { name: "Node.js", status: "installed", version: "v22.0.0" },
                { name: "Git", status: "installed", version: "2.45.0" },
                { name: ".NET SDK 8.0", status: "missing", detail: "未偵測到", downloadUrl: "https://dotnet.microsoft.com" },
            ],
        });

        await provider.refresh();

        const categories = provider.getChildren();
        const envCategory = categories[0];
        const envItems = provider.getChildren(envCategory);
        expect(envItems).toHaveLength(3);
        expect(envItems[0]).toHaveProperty("label", "Node.js");
        expect(envItems[1]).toHaveProperty("label", "Git");
        expect(envItems[2]).toHaveProperty("label", ".NET SDK 8.0");
    });

    it("should create TreeItem with command for tool items", () => {
        const categories = provider.getChildren();
        const tools = provider.getChildren(categories[1]);
        const treeItem = provider.getTreeItem(tools[0]);

        expect(treeItem).toBeInstanceOf(vscode.TreeItem);
        expect(treeItem.command).toEqual({
            command: "cgmh.setupProfile",
            title: "建立設定檔",
        });
    });

    it("should create TreeItem for category", () => {
        const categories = provider.getChildren();
        const treeItem = provider.getTreeItem(categories[0]);

        expect(treeItem).toBeInstanceOf(vscode.TreeItem);
    });
});
