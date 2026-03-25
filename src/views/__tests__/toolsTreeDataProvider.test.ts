import { describe, it, expect, vi } from "vitest";
import { ToolsTreeDataProvider } from "../toolsTreeDataProvider";
import * as vscode from "vscode";

vi.mock("vscode");

describe("ToolsTreeDataProvider", () => {
    const provider = new ToolsTreeDataProvider();

    it("should return 3 tool items", () => {
        const children = provider.getChildren();
        expect(children).toHaveLength(3);
    });

    it("should have correct labels", () => {
        const children = provider.getChildren();
        const labels = children.map((c) => c.label);
        expect(labels).toEqual([
            "檢測開發環境",
            "建立設定檔",
            "安裝推薦延伸模組",
        ]);
    });

    it("should have correct command ids", () => {
        const children = provider.getChildren();
        const commandIds = children.map((c) => c.commandId);
        expect(commandIds).toEqual([
            "cgmh.checkEnvironment",
            "cgmh.setupProfile",
            "cgmh.installExtensions",
        ]);
    });

    it("should create TreeItem with command property", () => {
        const children = provider.getChildren();
        const treeItem = provider.getTreeItem(children[0]);

        expect(treeItem).toBeInstanceOf(vscode.TreeItem);
        expect(treeItem.command).toEqual({
            command: "cgmh.checkEnvironment",
            title: "檢測開發環境",
        });
        expect(treeItem.description).toBe("檢查 Node.js、Git、.NET SDK");
    });

    it("should return a new array each time from getChildren", () => {
        const first = provider.getChildren();
        const second = provider.getChildren();
        expect(first).not.toBe(second);
        expect(first).toEqual(second);
    });
});
