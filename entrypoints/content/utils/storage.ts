import { browser } from "wxt/browser"

/**
 * Unified storage API that works across Chrome and Firefox
 */
export const storage = {
	async get<T>(key: string): Promise<T | undefined> {
		try {
			const result = await browser.storage.local.get(key)
			return result[key]
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
			return await browser.storage.local.get(keys)
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
