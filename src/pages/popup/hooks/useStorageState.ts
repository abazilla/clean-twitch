import { useEffect, useState } from "react"

export const isFirefox = typeof browser !== "undefined"
export const isChrome = typeof chrome !== "undefined" && !isFirefox

export function useStorageState<T>(key: string, initialValue: T) {
	// Initialize with initialValue right away
	const [value, setValue] = useState<T>(initialValue)
	const [isInitialized, setIsInitialized] = useState(false)

	// Initial load
	useEffect(() => {
		if (isChrome) {
			chrome.storage.sync.get(key).then((result) => {
				console.log(`Initial load for ${key}:`, result[key])
				if (result[key] !== undefined) {
					setValue(result[key])
				}
				setIsInitialized(true)
			})
		} else if (isFirefox) {
			browser.storage.local.get(key).then((result) => {
				console.log(`Initial load for ${key}:`, result[key])
				if (result[key] !== undefined) {
					setValue(result[key])
				}
				setIsInitialized(true)
			})
		}
	}, [key])

	// Listen for changes
	useEffect(() => {
		if (isChrome) {
			const handleStorageChange = (
				changes: { [key: string]: chrome.storage.StorageChange },
				areaName: string
			) => {
				if (areaName === "sync" && key in changes) {
					console.log(`Storage change for ${key}:`, changes, areaName)
					setValue(changes[key].newValue ?? initialValue)
				}
			}

			chrome.storage.onChanged.addListener(handleStorageChange)
			return () => chrome.storage.onChanged.removeListener(handleStorageChange)
		} else if (isFirefox) {
			const handleStorageChange = (
				changes: { [key: string]: browser.storage.StorageChange },
				areaName: string
			) => {
				if (areaName === "local" && key in changes) {
					console.log(`Storage change for ${key}:`, changes, areaName)
					setValue(changes[key].newValue ?? initialValue)
				}
			}

			browser.storage.onChanged.addListener(handleStorageChange)
			return () => browser.storage.onChanged.removeListener(handleStorageChange)
		}
	}, [key, initialValue])

	const updateValue = async (newValue: T) => {
		console.log(`Setting ${key} to:`, newValue)
		try {
			if (isChrome) {
				await chrome.storage.sync.set({ [key]: newValue })
			} else if (isFirefox) {
				await browser.storage.local.set({ [key]: newValue })
			}
			setValue(newValue)
		} catch (error) {
			console.error(`Error setting ${key}:`, error)
		}
	}

	return [value, updateValue, isInitialized] as const
}
