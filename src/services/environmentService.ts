import * as vscode from "vscode";
import { runCommand } from "../utils/command";

export type ToolStatus = "installed" | "missing" | "misconfigured";

export interface ToolCheckResult {
    name: string;
    status: ToolStatus;
    version?: string;
    detail?: string;
    downloadUrl?: string;
}

export interface EnvironmentReport {
    results: ToolCheckResult[];
    allPassed: boolean;
}

async function checkNode(): Promise<ToolCheckResult> {
    const result = await runCommand("node", ["--version"]);
    if (result.exitCode !== 0 || !result.stdout) {
        return {
            name: "Node.js",
            status: "missing",
            detail: "未偵測到 Node.js，請安裝後重試",
            downloadUrl: "https://nodejs.org/",
        };
    }
    return {
        name: "Node.js",
        status: "installed",
        version: result.stdout,
    };
}

async function checkGit(): Promise<ToolCheckResult> {
    const result = await runCommand("git", ["--version"]);
    if (result.exitCode !== 0 || !result.stdout) {
        return {
            name: "Git",
            status: "missing",
            detail: "未偵測到 Git，請安裝後重試",
            downloadUrl: "https://git-scm.com/downloads",
        };
    }

    const version = result.stdout.replace("git version ", "");

    // 檢查 user.name 和 user.email
    const nameResult = await runCommand("git", ["config", "--global", "user.name"]);
    const emailResult = await runCommand("git", ["config", "--global", "user.email"]);

    const missingConfigs: string[] = [];
    if (!nameResult.stdout) { missingConfigs.push("user.name"); }
    if (!emailResult.stdout) { missingConfigs.push("user.email"); }

    if (missingConfigs.length > 0) {
        return {
            name: "Git",
            status: "misconfigured",
            version,
            detail: `Git 已安裝，但尚未設定 ${missingConfigs.join(" 和 ")}`,
        };
    }

    return {
        name: "Git",
        status: "installed",
        version,
        detail: `${nameResult.stdout} <${emailResult.stdout}>`,
    };
}

async function checkDotnetSdk(): Promise<ToolCheckResult> {
    const requiredVersion = vscode.workspace
        .getConfiguration("cgmh")
        .get<string>("requiredDotnetSdkVersion", "8");

    const result = await runCommand("dotnet", ["--list-sdks"]);
    if (result.exitCode !== 0 || !result.stdout) {
        return {
            name: `.NET SDK ${requiredVersion}.0`,
            status: "missing",
            detail: `未偵測到 .NET SDK，請安裝 .NET ${requiredVersion}.0 SDK`,
            downloadUrl: `https://dotnet.microsoft.com/download/dotnet/${requiredVersion}.0`,
        };
    }

    const sdkLines = result.stdout.split("\n");
    const matchedSdk = sdkLines.find((line) => line.trim().startsWith(`${requiredVersion}.`));

    if (!matchedSdk) {
        const installed = sdkLines.map((l) => l.trim().split(" ")[0]).join(", ");
        return {
            name: `.NET SDK ${requiredVersion}.0`,
            status: "missing",
            detail: `已安裝 .NET SDK (${installed})，但缺少 ${requiredVersion}.0 版本`,
            downloadUrl: `https://dotnet.microsoft.com/download/dotnet/${requiredVersion}.0`,
        };
    }

    const version = matchedSdk.trim().split(" ")[0];
    return {
        name: `.NET SDK ${requiredVersion}.0`,
        status: "installed",
        version,
    };
}

export async function checkEnvironment(): Promise<EnvironmentReport> {
    const results = await Promise.all([checkNode(), checkGit(), checkDotnetSdk()]);
    const allPassed = results.every((r) => r.status === "installed");
    return { results, allPassed };
}
