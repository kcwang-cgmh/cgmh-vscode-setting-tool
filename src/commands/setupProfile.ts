import * as vscode from "vscode";
import { setupProfile } from "../services/profileService";

export async function setupProfileCommand(globalState: vscode.Memento): Promise<void> {
    await setupProfile(globalState);
}
