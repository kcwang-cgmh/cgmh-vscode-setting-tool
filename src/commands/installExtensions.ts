import { installExtensionsByCategory } from "../services/extensionService";

export async function installExtensionsCommand(): Promise<void> {
    await installExtensionsByCategory();
}
