import simpleGit from "simple-git";
import type { CredentialProvider, GitFactory } from "../types";
import { getRemoteUrl } from "./utils/utils";

export function createGitFactory(provider: CredentialProvider): GitFactory {
	return async (repoPath: string, remoteUrl?: string) => {
		const git = simpleGit(repoPath);
		const resolvedUrl = remoteUrl ?? (await getRemoteUrl(git));
		const creds = await provider.getCredentials(resolvedUrl);
		return git.env(creds.env);
	};
}
