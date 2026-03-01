const SEND_RETRY_DELAY_MS = 250;
const MAX_SEND_ATTEMPTS = 2;

export type ChatSendMessageInput = {
	payload: {
		content: string;
		images?: Array<{ data: string; mimeType: string }>;
	};
	metadata: {
		model?: string;
	};
};

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null
		? (value as Record<string, unknown>)
		: null;
}

function getErrorStatusCode(error: unknown): number | null {
	const errorRecord = asRecord(error);
	const dataRecord = asRecord(errorRecord?.data);
	const dataHttpStatus = dataRecord?.httpStatus;
	if (typeof dataHttpStatus === "number") return dataHttpStatus;

	const shapeRecord = asRecord(errorRecord?.shape);
	const shapeDataRecord = asRecord(shapeRecord?.data);
	const shapeHttpStatus = shapeDataRecord?.httpStatus;
	if (typeof shapeHttpStatus === "number") return shapeHttpStatus;

	return null;
}

function isRetryableSendError(error: unknown): boolean {
	const statusCode = getErrorStatusCode(error);
	if (statusCode !== null) {
		return statusCode === 408 || statusCode === 425 || statusCode === 429
			? true
			: statusCode >= 500;
	}

	const message =
		error instanceof Error
			? error.message.toLowerCase()
			: String(error).toLowerCase();

	return (
		message.includes("network") ||
		message.includes("failed to fetch") ||
		message.includes("timeout") ||
		message.includes("temporarily unavailable") ||
		message.includes("connection reset") ||
		message.includes("socket hang up")
	);
}

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
		normalizedMessage.includes("unauthorized") ||
		normalizedMessage.includes("authentication")
	);
}

export function toSendFailureMessage(error: unknown): string {
	const baseMessage = toBaseErrorMessage(error);
	if (!isLikelyAuthErrorMessage(baseMessage)) return baseMessage;
	return "Model authentication failed. Reconnect OAuth or set an API key in the model picker, then retry.";
}

export async function sendMessageWithRetry<T>(
	send: () => Promise<T>,
): Promise<T> {
	for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
		try {
			return await send();
		} catch (error) {
			const canRetry =
				attempt < MAX_SEND_ATTEMPTS && isRetryableSendError(error);
			if (!canRetry) throw error;
			await delay(SEND_RETRY_DELAY_MS);
		}
	}

	throw new Error("Failed to send message");
}
