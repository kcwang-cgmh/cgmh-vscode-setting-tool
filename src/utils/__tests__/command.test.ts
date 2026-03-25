import { describe, it, expect } from "vitest";
import { runCommand } from "../command";

describe("runCommand", () => {
    it("should return stdout for successful command", async () => {
        const result = await runCommand("echo", ["hello"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe("hello");
        expect(result.stderr).toBe("");
    });

    it("should return exit code for failed command", async () => {
        const result = await runCommand("node", ["-e", "process.exit(42)"]);
        expect(result.exitCode).toBe(42);
    });

    it("should return exit code 1 for non-existent command", async () => {
        const result = await runCommand("this-command-does-not-exist-xyz", []);
        expect(result.exitCode).not.toBe(0);
    });

    it("should trim stdout and stderr", async () => {
        const result = await runCommand("echo", ["  hello  "]);
        expect(result.stdout).toBe("hello");
    });

    it("should capture stderr", async () => {
        const result = await runCommand("node", ["-e", "console.error('err msg')"]);
        expect(result.stderr).toBe("err msg");
    });
});
