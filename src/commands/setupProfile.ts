import { setupProfile } from "../services/profileService";

export async function setupProfileCommand(): Promise<void> {
    await setupProfile();
}
