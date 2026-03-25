/**
 * 設定版本號：每次修改 defaultSettings 的值時遞增此版本號，
 * 讓已安裝的使用者在更新延伸模組後能接收到變更的設定值。
 */
export const settingsVersion = 1;

/**
 * 預設 VS Code 設定，來源為 docs/settings.json
 * 使用 key-value 格式，便於用 workspace.getConfiguration().update() 逐一套用
 */
export const defaultSettings: Record<string, unknown> = {
    // 🤖 Copilot 核心設定
    "github.copilot.enable": {
        "*": true,
        "plaintext": false,
        "markdown": true,
        "scminput": true,
        "yaml": true,
        "html": true,
        "powershell": true,
        "javascript": true,
        "aspnetcorerazor": true
    },
    "github.copilot.selectedCompletionModel": "gpt-41-copilot",

    // 📝 Copilot 編輯器功能
    "github.copilot.editor.enableCodeActions": true,
    "github.copilot.renameSuggestions.triggerAutomatically": true,
    "github.copilot.nextEditSuggestions.enabled": true,
    "editor.inlineSuggest.edits.showCollapsed": true,

    // 💬 Copilot Chat 設定
    "github.copilot.chat.localeOverride": "zh-TW",
    "github.copilot.chat.useProjectTemplates": true,
    "github.copilot.chat.scopeSelection": true,
    "github.copilot.chat.languageContext.typescript.enabled": true,
    "github.copilot.chat.reviewSelection.enabled": true,
    "github.copilot.chat.copilotDebugCommand.enabled": true,
    "github.copilot.chat.setupTests.enabled": true,
    "github.copilot.chat.codeGeneration.useInstructionFiles": true,
    "github.copilot.chat.codesearch.enabled": true,
    "github.copilot.chat.newWorkspaceCreation.enabled": true,
    "github.copilot.chat.reviewSelection.instructions": [
        { "text": "Always response in #zh-tw." }
    ],
    "github.copilot.chat.commitMessageGeneration.instructions": [
        { "text": "# Use Conventional Commits 1.0.0 for commit messages." },
        { "text": "請一律使用正體中文來撰寫記錄" }
    ],
    "github.copilot.chat.pullRequestDescriptionGeneration.instructions": [
        { "text": "請一律使用正體中文來撰寫記錄" }
    ],

    // 🎯 Chat 通用設定
    "chat.agent.enabled": true,
    "chat.agent.maxRequests": 100,
    "chat.detectParticipant.enabled": false,
    "inlineChat.finishOnType": false,

    // 🖥️ VS Code UI 設定
    "window.commandCenter": true,
    "workbench.commandPalette.experimental.askChatLocation": "chatView",
    "search.searchView.semanticSearchBehavior": "runOnEmpty",

    // ⌨️ 終端設定
    "terminal.integrated.scrollback": 50000,

    // 📄 格式化設定
    "[markdown]": {
        "editor.defaultFormatter": "yzhang.markdown-all-in-one"
    },

    // GitLens AI 設定
    "gitlens.ai.model": "vscode",
    "gitlens.ai.vscode.model": "copilot:gpt-4.1"
};
