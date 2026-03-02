export type ChatSendMessageInput = {
	payload: {
		content: string;
		images?: Array<{ data: string; mimeType: string }>;
	};
	metadata: {
		model?: string;
	};
};

export type StartFreshSessionResult = {
	created: boolean;
	sessionId?: string;
	errorMessage?: string;
};

const SESSION_CREATE_ERROR_MESSAGE =
	"Failed to create a chat session. Please retry.";
const SESSION_PERSIST_ERROR_MESSAGE =
	"Chat session failed to initialize. Please wait a moment and retry.";

function toBaseErrorMessage(error: unknown): string {
	if (typeof error === "string" && error.trim().length > 0) return error;
	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message;
	}
	return "Failed to send message";
}

function isLikelyAuthErrorMessage(message: string): boolean {
	const normalizedMessage = message.toLowerCase();
	return (
		normalizedMessage.includes("oauth") ||
		normalizedMessage.includes("invalid bearer token") ||
		normalizedMessage.includes("invalid x-api-key") ||
		normalizedMessage.includes("invalid api key") ||
		normalizedMessage.includes("api key is missing") ||
		(normalizedMessage.includes("anthropic") &&
			(normalizedMessage.includes("api key") ||
				normalizedMessage.includes("bearer token"))) ||
		(normalizedMessage.includes("openai") &&
			(normalizedMessage.includes("api key") ||
				normalizedMessage.includes("bearer token")))
	);
}

export function toSendFailureMessage(error: unknown): string {
	const baseMessage = toBaseErrorMessage(error);
	if (!isLikelyAuthErrorMessage(baseMessage)) return baseMessage;
	return "Model authentication failed. Reconnect OAuth or set an API key in the model picker, then retry.";
}

export async function sendMessageOnce<T>(send: () => Promise<T>): Promise<T> {
	return send();
}

export async function sendMessageForSession<T>({
	currentSessionId,
	isSessionReady,
	ensureSessionReady,
	onStartFreshSession,
	sendToCurrentSession,
	sendToSession,
}: {
	currentSessionId: string | null;
	isSessionReady: boolean;
	ensureSessionReady: () => Promise<boolean>;
	onStartFreshSession: () => Promise<StartFreshSessionResult>;
	sendToCurrentSession: () => Promise<T>;
	sendToSession: (sessionId: string) => Promise<T>;
}): Promise<{ targetSessionId: string; value: T }> {
	let targetSessionId = currentSessionId;

	if (!targetSessionId) {
		const startResult = await onStartFreshSession();
		if (!startResult.created || !startResult.sessionId) {
			throw new Error(startResult.errorMessage ?? SESSION_CREATE_ERROR_MESSAGE);
		}
		targetSessionId = startResult.sessionId;
	}

	if (
		currentSessionId &&
		targetSessionId === currentSessionId &&
		!isSessionReady
	) {
		const ensured = await ensureSessionReady();
		if (!ensured) throw new Error(SESSION_PERSIST_ERROR_MESSAGE);
	}

	const value =
		currentSessionId && targetSessionId === currentSessionId
			? await sendToCurrentSession()
			: await sendToSession(targetSessionId);

	return { targetSessionId, value };
}
