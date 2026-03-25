import { vi } from "vitest";

export const TreeItemCollapsibleState = {
    None: 0,
    Collapsed: 1,
    Expanded: 2,
};

export class TreeItem {
    label: string;
    collapsibleState: number;
    description?: string;
    iconPath?: unknown;
    command?: unknown;
    contextValue?: string;

    constructor(label: string, collapsibleState?: number) {
        this.label = label;
        this.collapsibleState = collapsibleState ?? TreeItemCollapsibleState.None;
    }
}

export class ThemeIcon {
    id: string;
    constructor(id: string) {
        this.id = id;
    }
}

export const ConfigurationTarget = {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3,
};

export const ProgressLocation = {
    Notification: 15,
    SourceControl: 1,
    Window: 10,
};

const mockConfigStore: Record<string, unknown> = {};

export const workspace = {
    getConfiguration: vi.fn((_section?: string, _scope?: unknown) => ({
        get: vi.fn((key: string, defaultValue?: unknown) => mockConfigStore[key] ?? defaultValue),
        inspect: vi.fn((key: string) => {
            const val = mockConfigStore[key];
            return val !== undefined ? { globalValue: val } : { globalValue: undefined };
        }),
        update: vi.fn(async (key: string, value: unknown, _target?: unknown, _overrideInLanguage?: boolean) => {
            mockConfigStore[key] = value;
        }),
    })),
};

export const window = {
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showQuickPick: vi.fn(),
    withProgress: vi.fn(async (_options: unknown, task: (progress: unknown) => Promise<unknown>) => {
        return task({ report: vi.fn() });
    }),
    createOutputChannel: vi.fn(() => ({
        appendLine: vi.fn(),
        clear: vi.fn(),
        show: vi.fn(),
        dispose: vi.fn(),
    })),
};

export const commands = {
    executeCommand: vi.fn(),
    registerCommand: vi.fn(),
};

export const extensions = {
    getExtension: vi.fn(),
};

export const env = {
    openExternal: vi.fn(),
};

export const Uri = {
    parse: vi.fn((url: string) => ({ toString: () => url })),
};

export function _resetMockConfigStore() {
    for (const key of Object.keys(mockConfigStore)) {
        delete mockConfigStore[key];
    }
}
