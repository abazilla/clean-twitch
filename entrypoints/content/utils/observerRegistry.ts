// Observer Registry - manages MutationObserver lifecycle by feature ID
const observers = new Map<string, MutationObserver>()

export function registerObserver(featureId: string, observer: MutationObserver): void {
	// console.log(`[Observer] Registering: ${featureId}`)
	// Clean up existing observer for this feature first
	disposeObserver(featureId)
	observers.set(featureId, observer)
}

export function disposeObserver(featureId: string): void {
	const existing = observers.get(featureId)
	if (existing) {
		// console.log(`[Observer] Disposing: ${featureId}`)
		existing.disconnect()
		observers.delete(featureId)
	}
}

export function disposeAllObservers(): void {
	observers.forEach((observer) => observer.disconnect())
	observers.clear()
}

// Debug helper - access via __observerRegistry in DevTools console
// if (typeof window !== "undefined") {
// 	;(window as any).__observerRegistry = {
// 		list: () => Array.from(observers.keys()),
// 		count: () => observers.size,
// 	}
// }
