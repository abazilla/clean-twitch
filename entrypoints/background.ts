import { browser } from "wxt/browser"

export default defineBackground(() => {
	// Periodic sync from sync storage to local storage
	setInterval(async () => {
		try {
			// First, check only the lastSync timestamp
			const { lastSync: syncTimestamp } = await browser.storage.sync.get("lastSync")
			const { lastSync: localTimestamp } = await browser.storage.local.get("lastSync")

			// Only pull full data if sync storage is newer
			if ((syncTimestamp || 0) > (localTimestamp || 0)) {
				console.log("Pulling newer data from sync storage")
				const fullSyncData = await browser.storage.sync.get()
				await browser.storage.local.set(fullSyncData)
			}
		} catch (error) {
			console.error("Periodic sync error:", error)
		}
	}, 60000) // 60 seconds
})
