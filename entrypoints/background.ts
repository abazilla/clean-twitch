import { browser } from "wxt/browser"

export default defineBackground(() => {
	// Debounced sync to avoid hammering sync storage
	const syncTimeouts = new Map<string, NodeJS.Timeout>()

	function scheduleSync<T>(key: string, value: T) {
		// Clear existing timeout for this key
		const existingTimeout = syncTimeouts.get(key)
		if (existingTimeout) {
			clearTimeout(existingTimeout)
		}

		// Schedule new sync after 2 seconds of inactivity
		const timeout = setTimeout(() => {
			try {
				console.log(`Syncing ${key} to sync storage`)
				browser.storage.sync.set({ [key]: value })
				syncTimeouts.delete(key)
			} catch (error) {
				console.error(`Error syncing ${key} to cloud:`, error)
			}
		}, 2000)

		syncTimeouts.set(key, timeout)
	}

	// Listen for local storage changes and sync them to sync storage
	browser.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "local") {
			Object.keys(changes).forEach((key) => {
				const change = changes[key]
				if (change.newValue !== undefined) {
					scheduleSync(key, change.newValue)
				}
			})
		}
	})
})
