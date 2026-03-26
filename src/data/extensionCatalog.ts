export interface ExtensionItem {
    id: string;
    name: string;
    description: string;
}

export interface ExtensionCategory {
    id: string;
    label: string;
    description: string;
    extensions: ExtensionItem[];
}

export const extensionCatalog: ExtensionCategory[] = [
    {
        id: "csharp-dotnet",
        label: "C# / .NET 核心開發",
        description: "C# 語言支援、.NET SDK 整合、類別建立等核心開發工具",
        extensions: [
            { id: "ms-dotnettools.csdevkit", name: "C# Dev Kit", description: "完整的 C# 開發體驗" },
            { id: "ms-dotnettools.csharp", name: "C#", description: "C# 語言支援（語法、除錯）" },
            { id: "ms-dotnettools.vscode-dotnet-runtime", name: ".NET Runtime", description: ".NET 執行環境管理" },
            { id: "kreativ-software.csharpextensions", name: "C# Extensions", description: "C# 類別/介面快速建立" },
            { id: "k--kato.docomment", name: "XML Documentation Comments", description: "C# XML 文件註解自動產生" },
            { id: "adrianwilczynski.namespace", name: "Namespace", description: "自動解析 C# 命名空間" },
            { id: "adrianwilczynski.add-reference", name: "Add Reference", description: ".NET 專案參考管理" },
            { id: "formulahendry.dotnet", name: ".NET Core Tools", description: ".NET CLI 指令整合" },
        ]
    },
    {
        id: "aspnet-blazor",
        label: "ASP.NET / Blazor 開發",
        description: "Blazor 元件、Razor 切換、C# 轉 TypeScript 等 Web 開發工具",
        extensions: [
            { id: "adrianwilczynski.blazor-snippet-pack", name: "Blazor Snippet Pack", description: "Blazor 元件程式碼片段" },
            { id: "adrianwilczynski.asp-net-core-switcher", name: "ASP.NET Core Switcher", description: "Razor/Controller/View 快速切換" },
            { id: "adrianwilczynski.csharp-to-typescript", name: "C# to TypeScript", description: "C# 模型轉 TypeScript 介面" },
            { id: "adrianwilczynski.user-secrets", name: "User Secrets", description: ".NET User Secrets 管理" },
        ]
    },
    {
        id: "nuget-project",
        label: "NuGet / 專案管理",
        description: "NuGet 套件管理、MSBuild 工具、版本資訊等專案管理工具",
        extensions: [
            { id: "patcx.vscode-nuget-gallery", name: "NuGet Gallery", description: "圖形化 NuGet 套件瀏覽" },
            { id: "jmrog.vscode-nuget-package-manager", name: "NuGet Package Manager", description: "NuGet 套件搜尋與安裝" },
            { id: "tintoy.msbuild-project-tools", name: "MSBuild Project Tools", description: ".csproj 檔案智慧提示" },
            { id: "pflannery.vscode-versionlens", name: "Version Lens", description: "顯示套件版本資訊" },
            { id: "adrianwilczynski.libman", name: "LibMan", description: "前端函式庫管理" },
        ]
    },
    {
        id: "git-tools",
        label: "Git 版控工具",
        description: "GitLens、Git 歷史、分支圖形化等版本控制增強工具",
        extensions: [
            { id: "eamodio.gitlens", name: "GitLens", description: "Git 功能增強（blame、history 等）" },
            { id: "donjayamanne.githistory", name: "Git History", description: "Git 提交歷史視覺化" },
            { id: "mhutchie.git-graph", name: "Git Graph", description: "Git 分支圖形化檢視" },
            { id: "ziyasal.vscode-open-in-github", name: "Open in GitHub", description: "在 GitHub 開啟目前檔案" },
            { id: "codezombiech.gitignore", name: "gitignore", description: ".gitignore 檔案語言支援" },
        ]
    },
    {
        id: "dev-tools",
        label: "開發輔助工具",
        description: "REST Client、TODO 高亮、路徑提示等日常開發輔助工具",
        extensions: [
            { id: "humao.rest-client", name: "REST Client", description: "直接在 VS Code 發送 HTTP 請求" },
            { id: "aaron-bond.better-comments", name: "Better Comments", description: "彩色分類註解" },
            { id: "wayou.vscode-todo-highlight", name: "TODO Highlight", description: "高亮 TODO/FIXME 標記" },
            { id: "christian-kohler.path-intellisense", name: "Path Intellisense", description: "檔案路徑自動完成" },
            { id: "adrianwilczynski.toggle-hidden", name: "Toggle Hidden", description: "切換隱藏檔案顯示" },
            { id: "adrianwilczynski.terminal-commands", name: "Terminal Commands", description: "自訂終端快捷命令" },
        ]
    },
    {
        id: "editor-enhance",
        label: "編輯器增強",
        description: "EditorConfig、Markdown 編輯、中文語言套件等編輯器增強工具",
        extensions: [
            { id: "EditorConfig.EditorConfig", name: "EditorConfig", description: "EditorConfig 規範支援" },
            { id: "doggy8088.netcore-editorconfiggenerator", name: ".NET EditorConfig Generator", description: "產生 .NET EditorConfig 設定" },
            { id: "doggy8088.quicktype-refresh", name: "QuickType Refresh", description: "JSON 轉型別定義" },
            { id: "yzhang.markdown-all-in-one", name: "Markdown All in One", description: "Markdown 編輯增強" },
            { id: "MS-CEINTL.vscode-language-pack-zh-hant", name: "中文(繁體)語言套件", description: "VS Code 繁體中文介面" },
            { id: "kcwang-cgmh.cgmh-vscode-setting-tool", name: "長庚 VS Code 設定工具", description: "一鍵安裝延伸模組與同步編輯器設定" },
        ]
    },
];
