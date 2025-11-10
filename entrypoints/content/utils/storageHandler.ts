import { browser } from "wxt/browser"

/**
 * Hybrid storage system: writes to local for performance, syncs to sync storage periodically
 */
export const storageHandler = {
	async init<T>(): Promise<void> {
		// init function that gets ran on first load for storage
		// gets all storage keys
		// if they don't exist, set default values?
		// set default values in features list
		// remove fallbacks from get
	},
	async get<T>(key: string): Promise<T | undefined> {
		try {
			// Try local first (faster)
			const localResult = await browser.storage.local.get(key)
			if (localResult[key] !== undefined) {
				return localResult[key]
			}

			// Fallback to sync storage
			const syncResult = await browser.storage.sync.get(key)
			if (syncResult[key] !== undefined) {
				// Cache in local for next time
				await browser.storage.local.set({ [key]: syncResult[key] })
				return syncResult[key]
			}
		} catch (error) {
			console.error(`Error getting ${key} from storage:`, error)
		}
		return undefined
	},

	async set<T>(key: string, value: T): Promise<void> {
		try {
			// Write to local storage - background script will handle sync
			await browser.storage.local.set({ [key]: value })
		} catch (error) {
			console.error(`Error setting ${key} in storage:`, error)
			throw error
		}
	},

	async getMultiple(keys: string[]): Promise<Record<string, any>> {
		try {
			// Try local first
			const localResult = await browser.storage.local.get(keys)
			const missingKeys = keys.filter((key) => localResult[key] === undefined)

			if (missingKeys.length === 0) {
				return localResult
			}

			// Get missing keys from sync
			const syncResult = await browser.storage.sync.get(missingKeys)

			// Cache missing data in local
			if (Object.keys(syncResult).length > 0) {
				await browser.storage.local.set(syncResult)
			}

			return { ...localResult, ...syncResult }
		} catch (error) {
			console.error(`Error getting multiple keys from storage:`, error)
		}
		return {}
	},
	async pullFromSync<T>(): Promise<void> {
		// gets sync storage keys.
		console.log("Pulling from sync storage")
		const syncResult = await browser.storage.sync.get()
		console.log("Setting local storage from sync:")
		await browser.storage.local.set(syncResult)
		// if they exist,
		// check if they're different from local
		// then update local storage keys
	},


	onChanged: {
		addListener(callback: (changes: Record<string, any>, areaName: string) => void) {
			browser.storage.onChanged.addListener(callback)
		},

		removeListener(callback: (changes: Record<string, any>, areaName: string) => void) {
			browser.storage.onChanged.removeListener(callback)
		},
	},
}
