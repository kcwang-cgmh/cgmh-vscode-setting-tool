# Changelog

所有版本的重要變更皆記錄於此檔案。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，
版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [0.3.0](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/compare/v0.2.0...v0.3.0) (2026-03-26)


### Features

* 側邊欄新增環境檢測狀態即時顯示 ([4c1c619](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/commit/4c1c619875387175efb70872898485bf5727385e))
* 安裝延伸模組時跳過同步提示，移除 markdown formatter 與 GitLens AI 設定 ([5f67cb9](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/commit/5f67cb90a9434042c1c1741e5f159704f4654a08))
* 延伸模組清單加入本工具自身 ([975b6c3](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/commit/975b6c3d154b5a481956b1743dcbeeec2f429787))

## [0.2.0](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/compare/v0.1.0...v0.2.0) (2026-03-25)

### Features

* 新增 Activity Bar 側邊欄面板，顯示三大功能入口 ([e540c70](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/commit/e540c7044aedcdd990603feea8612789e1690080))
* 單元測試框架（vitest）與 5 個測試檔案
* `.NET SDK` 版本可透過 `cgmh.requiredDotnetSdkVersion` 設定調整
* 設定同步更新機制：延伸模組更新後可推送變更的設定值，同時保留使用者手動修改過的設定
* 延伸模組安裝詳細報告：透過 OutputChannel 顯示每個模組的安裝結果
* 環境檢測通知加入「不再提醒」按鈕
* CI/CD 流程（GitHub Actions）：自動化 lint、test、build、發佈至 Marketplace
* release-please 自動化版本管理
* README.md 與 MIT LICENSE

### Bug Fixes

* 修正側邊欄圖示垂直置中 ([355ba90](https://github.com/kcwang-cgmh/cgmh-vscode-setting-tool/commit/355ba90ea0475ef392cea06de971379f17ede244))
* 修正 `vitest.config.ts` 導致 CI 型別檢查失敗
* 修正 `engines.vscode` 與 `@types/vscode` 版本不一致

## [0.1.0] - 2026-03-24

### Features

* 環境檢測功能：自動檢查 Node.js、Git、.NET SDK 8.0
* 設定檔建立功能：套用 40+ 預設 VS Code 設定（Copilot、Chat、GitLens AI 等）
* 延伸模組安裝功能：33 個推薦模組分 6 大類，批次安裝
* 互動式 Walkthrough 引導四步驟設定流程
* 啟動時自動環境檢測（可透過設定關閉）
