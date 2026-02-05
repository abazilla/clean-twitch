import { browser } from "wxt/browser"
import { mergeStorageData } from "./content/utils/storageHandler"

export default defineBackground(() => {
	// Periodic sync from sync storage to local storage
	setInterval(async () => {
		try {
			// First, check only the lastSync timestamp
			const { lastSync: syncTimestamp } = await browser.storage.sync.get("lastSync")
			const { lastSync: localTimestamp } = await browser.storage.local.get("lastSync")

			// Only pull full data if sync storage is newer
			if ((syncTimestamp || 0) > (localTimestamp || 0)) {
				// console.log("Pulling newer data from sync storage")
				const [syncResult, localResult] = await Promise.all([
					browser.storage.sync.get(),
					browser.storage.local.get(),
				])
				const merged = mergeStorageData(syncResult, localResult)
				await browser.storage.local.set(merged)
			}
		} catch (error) {
			console.error("Periodic sync error:", error)
		}
	}, 60000) // 60 seconds
})
