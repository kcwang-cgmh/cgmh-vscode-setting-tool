import * as vscode from "vscode";

interface ToolItem {
    readonly label: string;
    readonly description: string;
    readonly commandId: string;
    readonly iconId: string;
}

const TOOL_ITEMS: readonly ToolItem[] = [
    {
        label: "檢測開發環境",
        description: "檢查 Node.js、Git、.NET SDK",
        commandId: "cgmh.checkEnvironment",
        iconId: "search",
    },
    {
        label: "建立設定檔",
        description: "套用長庚醫科標準設定",
        commandId: "cgmh.setupProfile",
        iconId: "settings-gear",
    },
    {
        label: "安裝推薦延伸模組",
        description: "安裝推薦的 VS Code 延伸模組",
        commandId: "cgmh.installExtensions",
        iconId: "extensions",
    },
];

export class ToolsTreeDataProvider implements vscode.TreeDataProvider<ToolItem> {
    getTreeItem(element: ToolItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.None
        );
        treeItem.description = element.description;
        treeItem.iconPath = new vscode.ThemeIcon(element.iconId);
        treeItem.command = {
            command: element.commandId,
            title: element.label,
        };
        return treeItem;
    }

    getChildren(): ToolItem[] {
        return [...TOOL_ITEMS];
    }
}
