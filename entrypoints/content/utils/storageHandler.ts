import { browser } from "wxt/browser"

/**
 * Hybrid storage system: writes to local
 */
export const storageHandler = {
	// async init<T>(): Promise<void> {},
	async get<T>(key: string): Promise<T | undefined> {
		try {
			const localResult: Record<string, T | undefined> = await browser.storage.local.get(key)
			if (localResult[key] !== undefined) {
				return localResult[key]
			}
		} catch (error) {
			console.error(`Error getting ${key} from storage:`, error)
		}
		return undefined
	},

	async set<T>(key: string, value: T): Promise<void> {
		try {
			await browser.storage.local.set({ [key]: value })
		} catch (error) {
			console.error(`Error setting ${key} in storage:`, error)
			throw error
		}
	},

	async getMultiple(keys: string[]): Promise<Record<string, any>> {
		try {
			const localResult = await browser.storage.local.get(keys)
			return localResult
		} catch (error) {
			console.error(`Error getting multiple keys from storage:`, error)
		}
		return {}
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
