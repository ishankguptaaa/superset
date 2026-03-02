import type { UseMastraChatDisplayReturn } from "@superset/chat-mastra/client";
import type { StartFreshSessionResult } from "./utils/sendMessage";

export interface ChatMastraRawSnapshot {
	sessionId: string | null;
	isRunning: boolean;
	currentMessage: UseMastraChatDisplayReturn["currentMessage"] | null;
	messages: UseMastraChatDisplayReturn["messages"];
	error: unknown;
}

export interface ChatMastraInterfaceProps {
	sessionId: string | null;
	workspaceId: string;
	organizationId: string | null;
	cwd: string;
	isSessionReady: boolean;
	ensureSessionReady: () => Promise<boolean>;
	onStartFreshSession: () => Promise<StartFreshSessionResult>;
	onRawSnapshotChange?: (snapshot: ChatMastraRawSnapshot) => void;
}
