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
	async exportAll(): Promise<string> {
		const data = await browser.storage.local.get(null)
		return btoa(JSON.stringify(data))
	},

	async importAll(code: string): Promise<void> {
		const data = JSON.parse(atob(code))
		if (typeof data !== "object" || data === null || Array.isArray(data)) {
			throw new Error("Invalid settings data")
		}
		await browser.storage.local.clear()
		await browser.storage.local.set(data)
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
