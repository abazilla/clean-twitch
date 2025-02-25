import { useEffect, useState } from "react"

export function useStorageState<T>(key: string, initialValue: T) {
	// Initialize with initialValue right away
	const [value, setValue] = useState<T>(initialValue)
	const [isInitialized, setIsInitialized] = useState(false)

	// Initial load
	useEffect(() => {
		chrome.storage.sync.get(key).then((result) => {
			console.log(`Initial load for ${key}:`, result[key])
			if (result[key] !== undefined) {
				setValue(result[key])
			}
			setIsInitialized(true)
		})
	}, [key])

	// Listen for changes
	useEffect(() => {
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
	}, [key, initialValue])

	const updateValue = async (newValue: T) => {
		console.log(`Setting ${key} to:`, newValue)
		try {
			await chrome.storage.sync.set({ [key]: newValue })
			setValue(newValue)
		} catch (error) {
			console.error(`Error setting ${key}:`, error)
		}
	}

	return [value, updateValue, isInitialized] as const
}
