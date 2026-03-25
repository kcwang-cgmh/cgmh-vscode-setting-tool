# Changelog

所有版本的重要變更皆記錄於此檔案。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，
版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [0.2.0] - 2026-03-25

### Added
- 單元測試框架（vitest）與 4 個測試檔案
- `.NET SDK` 版本可透過 `cgmh.requiredDotnetSdkVersion` 設定調整
- 設定同步更新機制：延伸模組更新後可推送變更的設定值，同時保留使用者手動修改過的設定
- 延伸模組安裝詳細報告：透過 OutputChannel 顯示每個模組的安裝結果
- 環境檢測通知加入「不再提醒」按鈕
- CI/CD 流程（GitHub Actions）：自動化 lint、test、build 與 VSIX 打包
- CHANGELOG.md 版本變更記錄

## [0.1.0] - 2026-03-24

### Added
- 環境檢測功能：自動檢查 Node.js、Git、.NET SDK 8.0
- 設定檔建立功能：套用 40+ 預設 VS Code 設定（Copilot、Chat、GitLens AI 等）
- 延伸模組安裝功能：33 個推薦模組分 6 大類，批次安裝
- 互動式 Walkthrough 引導四步驟設定流程
- 啟動時自動環境檢測（可透過設定關閉）
