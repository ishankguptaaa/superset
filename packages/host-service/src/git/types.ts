import type { SimpleGit } from "simple-git";

export interface CredentialProvider {
	getCredentials(
		remoteUrl: string | null,
	): Promise<{ env: Record<string, string> }>;
}

export type GitFactory = (
	path: string,
	remoteUrl?: string,
) => Promise<SimpleGit>;
