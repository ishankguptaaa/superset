// Global registry so CMD+D hotkey handler can access focused pane dimensions
// without prop-drilling refs through the component tree
const paneRefs = new Map<string, HTMLElement>();
const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function registerPaneRef(paneId: string, element: HTMLElement) {
	paneRefs.set(paneId, element);
	emitChange();
}

export function unregisterPaneRef(paneId: string) {
	if (!paneRefs.delete(paneId)) return;
	emitChange();
}

export function getPaneRef(paneId: string): HTMLElement | null {
	return paneRefs.get(paneId) ?? null;
}

export function subscribePaneRefs(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function getPaneDimensions(
	paneId: string,
): { width: number; height: number } | null {
	const element = getPaneRef(paneId);
	if (!element) return null;
	const { width, height } = element.getBoundingClientRect();
	return { width, height };
}
