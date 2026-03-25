# 長庚醫科開發設定工具

快速設定長庚醫院系統開發環境：自動檢測工具、套用標準設定、安裝推薦延伸模組。

## 功能

### 環境檢測

自動檢查開發必要工具是否已安裝與正確設定：

- **Node.js** — JavaScript 執行環境
- **Git** — 版本控制（含 `user.name` / `user.email` 設定檢查）
- **.NET SDK 8.0** — ASP.NET Core / Blazor 開發（版本號可自訂）

每個項目顯示 ✅ 已安裝 / ⚠️ 設定不完整 / ❌ 未安裝，並提供下載連結。

### 建立設定檔

套用 40+ 項標準 VS Code 設定，涵蓋：

- **GitHub Copilot** — 各語言啟用/停用、Chat 語系(繁體中文)、Code Review 與 Commit 指令範本
- **Editor / Terminal** — 行內建議、指令中心、終端回捲行數
- **GitLens AI** — Copilot GPT-4.1 整合

支援智慧更新：首次安裝只補缺少的設定，後續更新只覆蓋未被使用者手動修改的項目。

### 安裝推薦延伸模組

33 個精選延伸模組，分為 6 大類供勾選安裝：

| 分類 | 數量 | 說明 |
|------|------|------|
| C# / .NET Core | 8 | C# Dev Kit、語言支援、XML 文件等 |
| ASP.NET / Blazor | 4 | Blazor Snippets、ASP.NET Core Switcher 等 |
| NuGet / 專案管理 | 5 | NuGet Gallery、Version Lens 等 |
| Git 工具 | 5 | GitLens、Git Graph、Git History 等 |
| 開發輔助 | 6 | REST Client、Better Comments、TODO Highlight 等 |
| 編輯器增強 | 5 | EditorConfig、Markdown All in One、繁體中文語言包等 |

安裝完成後產出詳細報告，列出成功、失敗與已安裝的模組。

## 使用方式

### 互動式引導

安裝後會自動顯示 Walkthrough 引導，依序完成：

1. 環境檢測
2. 建立設定檔
3. 安裝推薦延伸模組
4. 設定完成

### 命令面板

按 `Ctrl+Shift+P`（macOS: `Cmd+Shift+P`），搜尋「長庚醫科」：

- `長庚醫科: 檢測開發環境`
- `長庚醫科: 建立設定檔`
- `長庚醫科: 安裝推薦延伸模組`

## 設定選項

| 設定 | 預設值 | 說明 |
|------|--------|------|
| `cgmh.skipEnvironmentCheck` | `false` | 啟動時略過自動環境檢測 |
| `cgmh.requiredDotnetSdkVersion` | `"8"` | 必要的 .NET SDK 主版本號 |

## 開發

```bash
# 安裝依賴
npm install

# 開發模式（自動重新打包）
npm run watch

# 執行測試
npm test

# 型別檢查
npm run lint

# 打包 VSIX
npx @vscode/vsce package --no-dependencies
```

## License

MIT
