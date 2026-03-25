import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkEnvironment } from "../environmentService";
import * as commandModule from "../../utils/command";
import * as vscode from "vscode";

vi.mock("../../utils/command");
vi.mock("vscode");

const mockRunCommand = vi.mocked(commandModule.runCommand);

describe("checkEnvironment", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // 預設 SDK 版本為 "8"
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn().mockReturnValue("8"),
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);
    });

    it("should return allPassed when all tools are installed", async () => {
        mockRunCommand.mockImplementation(async (cmd, args) => {
            if (cmd === "node") {
                return { stdout: "v20.10.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[0] === "--version") {
                return { stdout: "git version 2.43.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[2] === "user.name") {
                return { stdout: "Test User", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[2] === "user.email") {
                return { stdout: "test@example.com", stderr: "", exitCode: 0 };
            }
            if (cmd === "dotnet") {
                return { stdout: "8.0.100 [/usr/share/dotnet/sdk]", stderr: "", exitCode: 0 };
            }
            return { stdout: "", stderr: "", exitCode: 1 };
        });

        const report = await checkEnvironment();

        expect(report.allPassed).toBe(true);
        expect(report.results).toHaveLength(3);
        expect(report.results[0]).toMatchObject({ name: "Node.js", status: "installed", version: "v20.10.0" });
        expect(report.results[1]).toMatchObject({ name: "Git", status: "installed", version: "2.43.0" });
        expect(report.results[2]).toMatchObject({ name: ".NET SDK 8.0", status: "installed", version: "8.0.100" });
    });

    it("should report missing Node.js", async () => {
        mockRunCommand.mockImplementation(async (cmd, args) => {
            if (cmd === "node") {
                return { stdout: "", stderr: "", exitCode: 1 };
            }
            if (cmd === "git" && args[0] === "--version") {
                return { stdout: "git version 2.43.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git") {
                return { stdout: "value", stderr: "", exitCode: 0 };
            }
            if (cmd === "dotnet") {
                return { stdout: "8.0.100 [/usr/share/dotnet/sdk]", stderr: "", exitCode: 0 };
            }
            return { stdout: "", stderr: "", exitCode: 1 };
        });

        const report = await checkEnvironment();

        expect(report.allPassed).toBe(false);
        expect(report.results[0]).toMatchObject({ name: "Node.js", status: "missing" });
        expect(report.results[0].downloadUrl).toBeDefined();
    });

    it("should report misconfigured Git when user.name is missing", async () => {
        mockRunCommand.mockImplementation(async (cmd, args) => {
            if (cmd === "node") {
                return { stdout: "v20.10.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[0] === "--version") {
                return { stdout: "git version 2.43.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[2] === "user.name") {
                return { stdout: "", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[2] === "user.email") {
                return { stdout: "test@example.com", stderr: "", exitCode: 0 };
            }
            if (cmd === "dotnet") {
                return { stdout: "8.0.100 [/usr/share/dotnet/sdk]", stderr: "", exitCode: 0 };
            }
            return { stdout: "", stderr: "", exitCode: 1 };
        });

        const report = await checkEnvironment();

        expect(report.allPassed).toBe(false);
        expect(report.results[1]).toMatchObject({ name: "Git", status: "misconfigured" });
        expect(report.results[1].detail).toContain("user.name");
    });

    it("should report missing .NET SDK when no 8.x SDK found", async () => {
        mockRunCommand.mockImplementation(async (cmd, args) => {
            if (cmd === "node") {
                return { stdout: "v20.10.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[0] === "--version") {
                return { stdout: "git version 2.43.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git") {
                return { stdout: "value", stderr: "", exitCode: 0 };
            }
            if (cmd === "dotnet") {
                return { stdout: "7.0.400 [/usr/share/dotnet/sdk]", stderr: "", exitCode: 0 };
            }
            return { stdout: "", stderr: "", exitCode: 1 };
        });

        const report = await checkEnvironment();

        expect(report.allPassed).toBe(false);
        expect(report.results[2]).toMatchObject({ name: ".NET SDK 8.0", status: "missing" });
        expect(report.results[2].detail).toContain("7.0.400");
    });

    it("should use configurable SDK version", async () => {
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn().mockReturnValue("9"),
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        mockRunCommand.mockImplementation(async (cmd, args) => {
            if (cmd === "node") {
                return { stdout: "v20.10.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[0] === "--version") {
                return { stdout: "git version 2.43.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git") {
                return { stdout: "value", stderr: "", exitCode: 0 };
            }
            if (cmd === "dotnet") {
                return { stdout: "9.0.100 [/usr/share/dotnet/sdk]", stderr: "", exitCode: 0 };
            }
            return { stdout: "", stderr: "", exitCode: 1 };
        });

        const report = await checkEnvironment();

        expect(report.allPassed).toBe(true);
        expect(report.results[2]).toMatchObject({ name: ".NET SDK 9.0", status: "installed", version: "9.0.100" });
    });

    it("should report missing .NET SDK when dotnet is not installed", async () => {
        mockRunCommand.mockImplementation(async (cmd, args) => {
            if (cmd === "node") {
                return { stdout: "v20.10.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git" && args[0] === "--version") {
                return { stdout: "git version 2.43.0", stderr: "", exitCode: 0 };
            }
            if (cmd === "git") {
                return { stdout: "value", stderr: "", exitCode: 0 };
            }
            if (cmd === "dotnet") {
                return { stdout: "", stderr: "", exitCode: 1 };
            }
            return { stdout: "", stderr: "", exitCode: 1 };
        });

        const report = await checkEnvironment();

        expect(report.results[2]).toMatchObject({ name: ".NET SDK 8.0", status: "missing" });
    });
});
