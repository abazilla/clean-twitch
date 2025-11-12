import { browser } from "wxt/browser"

// Note: does not run if popup is closed before timeout
// Batched sync storage writer - accumulates all pending changes and writes them together
let syncTimeout: NodeJS.Timeout | null = null
const pendingSyncChanges: Record<string, any> = {}

function scheduleBatchedSync(key: string, value: any) {
	const hadPendingChanges = Object.keys(pendingSyncChanges).length > 0

	// Add to pending changes
	pendingSyncChanges[key] = value
	console.log(
		`Scheduling batched sync for ${key} (${Object.keys(pendingSyncChanges).length} keys pending${hadPendingChanges ? ", extending timeout" : ""})`
	)
	console.log(`Value being synced for ${key}:`, value)

	// Clear existing timeout
	if (syncTimeout) {
		console.log("Clearing existing sync timeout")
		clearTimeout(syncTimeout)
	}

	// Schedule batched write
	console.log("Setting new sync timeout for 3 seconds")
	syncTimeout = setTimeout(async () => {
		console.log("TIMEOUT FIRED - starting batched sync")
		try {
			const keysToSync = Object.keys(pendingSyncChanges)
			const changesToSync = { ...pendingSyncChanges }

			// Clear pending changes
			keysToSync.forEach((key) => delete pendingSyncChanges[key])
			syncTimeout = null

			console.log(`Running batched sync for ${keysToSync.length} keys: ${keysToSync.join(", ")}`)
			await browser.storage.sync.set(changesToSync)
			console.log(`Successfully synced ${keysToSync.length} keys to sync storage`)
		} catch (error) {
			console.error("Error in batched sync to sync storage:", error)
		}
	}, 300)
}

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
			// Write to local storage immediately for fast access
			await browser.storage.local.set({ [key]: value })
			// Batched write to sync storage for cross-device sync
			scheduleBatchedSync(key, value)
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
	async pullFromSync(): Promise<void> {
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
