import { useEffect, useState } from "preact/hooks"

export const isFirefox = typeof browser !== "undefined"
export const isChrome = typeof chrome !== "undefined" && !isFirefox

/**
 * Unified storage API that works across Chrome and Firefox
 */
export const storage = {
	async get<T>(key: string): Promise<T | undefined> {
		try {
			if (isChrome) {
				const result = await chrome.storage.sync.get(key)
				return result[key]
			} else if (isFirefox) {
				const result = await browser.storage.local.get(key)
				return result[key]
			}
		} catch (error) {
			console.error(`Error getting ${key} from storage:`, error)
		}
		return undefined
	},

	async set<T>(key: string, value: T): Promise<void> {
		try {
			if (isChrome) {
				await chrome.storage.sync.set({ [key]: value })
			} else if (isFirefox) {
				await browser.storage.local.set({ [key]: value })
			}
		} catch (error) {
			console.error(`Error setting ${key} in storage:`, error)
			throw error
		}
	},

	async getMultiple(keys: string[]): Promise<Record<string, any>> {
		try {
			if (isChrome) {
				return await chrome.storage.sync.get(keys)
			} else if (isFirefox) {
				return await browser.storage.local.get(keys)
			}
		} catch (error) {
			console.error(`Error getting multiple keys from storage:`, error)
		}
		return {}
	},

	onChanged: {
		addListener(callback: (changes: Record<string, any>, areaName: string) => void) {
			if (isChrome) {
				chrome.storage.onChanged.addListener(callback)
			} else if (isFirefox) {
				browser.storage.onChanged.addListener(callback)
			}
		},

		removeListener(callback: (changes: Record<string, any>, areaName: string) => void) {
			if (isChrome) {
				chrome.storage.onChanged.removeListener(callback)
			} else if (isFirefox) {
				browser.storage.onChanged.removeListener(callback)
			}
		},
	},
}

/**
 * React hook for managing storage state with automatic sync
 */
export function useStorageState<T>(key: string, initialValue: T) {
	const [value, setValue] = useState<T>(initialValue)
	const [isInitialized, setIsInitialized] = useState(false)

	// Initial load
	useEffect(() => {
		storage.get<T>(key).then((result) => {
			console.log(`Initial load for ${key}:`, result)
			if (result !== undefined) {
				setValue(result)
			}
			setIsInitialized(true)
		})
	}, [key])

	// Listen for changes
	useEffect(() => {
		const handleStorageChange = (changes: Record<string, any>, areaName: string) => {
			const expectedArea = isChrome ? "sync" : "local"
			if (areaName === expectedArea && key in changes) {
				console.log(`Storage change for ${key}:`, changes, areaName)
				setValue(changes[key].newValue ?? initialValue)
			}
		}

		storage.onChanged.addListener(handleStorageChange)
		return () => storage.onChanged.removeListener(handleStorageChange)
	}, [key, initialValue])

	const updateValue = async (newValue: T) => {
		console.log(`Setting ${key} to:`, newValue)
		try {
			await storage.set(key, newValue)
			setValue(newValue)
		} catch (error) {
			console.error(`Error setting ${key}:`, error)
		}
	}

	return [value, updateValue, isInitialized] as const
}
