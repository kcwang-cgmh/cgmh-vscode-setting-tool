import * as vscode from "vscode";
import { checkEnvironment, type ToolCheckResult, type ToolStatus } from "../services/environmentService";

type TreeNode = CategoryNode | ToolItemNode | EnvResultNode;

interface CategoryNode {
    readonly type: "category";
    readonly label: string;
    readonly iconId: string;
    readonly children: readonly TreeNode[];
}

interface ToolItemNode {
    readonly type: "tool";
    readonly label: string;
    readonly description: string;
    readonly commandId: string;
    readonly iconId: string;
}

interface EnvResultNode {
    readonly type: "env";
    readonly label: string;
    readonly description: string;
    readonly iconId: string;
    readonly status: ToolStatus;
    readonly downloadUrl?: string;
}

const STATUS_ICON: Record<ToolStatus, string> = {
    installed: "pass",
    missing: "error",
    misconfigured: "warning",
};

function toEnvResultNode(result: ToolCheckResult): EnvResultNode {
    return {
        type: "env",
        label: result.name,
        description: result.version ?? result.detail ?? "",
        iconId: STATUS_ICON[result.status],
        status: result.status,
        downloadUrl: result.downloadUrl,
    };
}

const TOOL_ITEMS: readonly ToolItemNode[] = [
    {
        type: "tool",
        label: "建立設定檔",
        description: "套用長庚醫科標準設定",
        commandId: "cgmh.setupProfile",
        iconId: "settings-gear",
    },
    {
        type: "tool",
        label: "安裝推薦延伸模組",
        description: "安裝推薦的 VS Code 延伸模組",
        commandId: "cgmh.installExtensions",
        iconId: "extensions",
    },
];

export class ToolsTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private envResults: readonly EnvResultNode[] = [];

    async refresh(): Promise<void> {
        const report = await checkEnvironment();
        this.envResults = report.results.map(toEnvResultNode);
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        if (element.type === "category") {
            const item = new vscode.TreeItem(
                element.label,
                vscode.TreeItemCollapsibleState.Expanded
            );
            item.iconPath = new vscode.ThemeIcon(element.iconId);
            return item;
        }

        const item = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.None
        );
        item.description = element.description;
        item.iconPath = new vscode.ThemeIcon(element.iconId);

        if (element.type === "tool") {
            item.command = {
                command: element.commandId,
                title: element.label,
            };
        }

        if (element.type === "env" && element.downloadUrl && element.status !== "installed") {
            item.command = {
                command: "vscode.open",
                title: "開啟下載頁面",
                arguments: [vscode.Uri.parse(element.downloadUrl)],
            };
        }

        return item;
    }

    getChildren(element?: TreeNode): TreeNode[] {
        if (!element) {
            const envCategory: CategoryNode = {
                type: "category",
                label: "環境狀態",
                iconId: "pulse",
                children: this.envResults.length > 0
                    ? this.envResults
                    : [{ type: "env", label: "尚未檢測", description: "", iconId: "circle-outline", status: "missing" as ToolStatus }],
            };
            const toolCategory: CategoryNode = {
                type: "category",
                label: "工具",
                iconId: "tools",
                children: TOOL_ITEMS,
            };
            return [envCategory, toolCategory];
        }

        if (element.type === "category") {
            return [...element.children];
        }

        return [];
    }
}
