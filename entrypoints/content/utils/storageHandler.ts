import { browser } from "wxt/browser"

/**
 * Hybrid storage system: writes to local for performance, syncs to sync storage periodically
 */
export const storageHandler = {
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
			// Always write to local immediately (fast)
			await browser.storage.local.set({ [key]: value })
			
			// Schedule sync to cloud storage (debounced)
			this._scheduleSync(key, value)
		} catch (error) {
			console.error(`Error setting ${key} in storage:`, error)
			throw error
		}
	},

	async getMultiple(keys: string[]): Promise<Record<string, any>> {
		try {
			// Try local first
			const localResult = await browser.storage.local.get(keys)
			const missingKeys = keys.filter(key => localResult[key] === undefined)
			
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

	// Debounced sync to avoid hammering sync storage
	_syncTimeouts: new Map<string, NodeJS.Timeout>(),
	
	_scheduleSync<T>(key: string, value: T) {
		// Clear existing timeout for this key
		const existingTimeout = this._syncTimeouts.get(key)
		if (existingTimeout) {
			clearTimeout(existingTimeout)
		}
		
		// Schedule new sync after 2 seconds of inactivity
		const timeout = setTimeout(async () => {
			try {
				await browser.storage.sync.set({ [key]: value })
				this._syncTimeouts.delete(key)
			} catch (error) {
				console.error(`Error syncing ${key} to cloud:`, error)
			}
		}, 2000)
		
		this._syncTimeouts.set(key, timeout)
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
