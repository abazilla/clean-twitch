import { useEffect, useState } from "react"

export function useStorageState(key: string, initialValue: boolean = false) {
	const [value, setValue] = useState(false)

	// Initial load
	useEffect(() => {
		chrome.storage.sync.get(key).then((result) => {
			console.log(`Initial load for ${key}:`, result[key])
			setValue(result[key] ?? initialValue)
		})
	}, [key, initialValue])

	// Listen for changes
	useEffect(() => {
		const handleStorageChange = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string
		) => {
			console.log(`Storage change for ${key}:`, changes, areaName)
			if (areaName === "sync" && key in changes) {
				setValue(changes[key].newValue)
			}
		}

		chrome.storage.onChanged.addListener(handleStorageChange)
		return () => chrome.storage.onChanged.removeListener(handleStorageChange)
	}, [key])

	const updateValue = async (newValue: boolean) => {
		console.log(`Setting ${key} to:`, newValue)
		try {
			await chrome.storage.sync.set({ [key]: newValue })
			setValue(newValue)
		} catch (error) {
			console.error(`Error setting ${key}:`, error)
		}
	}

	return [value, updateValue] as const
}
