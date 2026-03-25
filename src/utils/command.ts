import { execFile, ExecFileException } from "child_process";

export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

/**
 * 安全地執行外部命令（使用 execFile 避免 shell injection）
 */
export function runCommand(command: string, args: string[]): Promise<CommandResult> {
    return new Promise((resolve) => {
        execFile(command, args, { timeout: 10000 }, (error: ExecFileException | null, stdout: string, stderr: string) => {
            resolve({
                stdout: stdout?.trim() ?? "",
                stderr: stderr?.trim() ?? "",
                exitCode: error?.code as number ?? (error ? 1 : 0),
            });
        });
    });
}
