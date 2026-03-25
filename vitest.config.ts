import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["src/**/__tests__/**/*.test.ts"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/**/__tests__/**", "src/__mocks__/**", "src/extension.ts", "src/commands/**"],
        },
    },
    resolve: {
        alias: {
            vscode: new URL("./src/__mocks__/vscode.ts", import.meta.url).pathname,
        },
    },
});
