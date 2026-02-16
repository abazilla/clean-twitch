import { storageHandler } from "@/entrypoints/content/storage/handler"
import { useEffect, useState } from "react"

/**
 * React hook for managing storage state with automatic sync
 */
export function useStorageState<T>(key: string, initialValue: T) {
	const [value, setValue] = useState<T>(initialValue)
	const [isInitialized, setIsInitialized] = useState(false)

	// Initial load
	useEffect(() => {
		storageHandler.get<T>(key).then((result) => {
			if (result !== undefined) {
				setValue(result)
			}
			setIsInitialized(true)
		})
	}, [key])

	// Listen for changes
	useEffect(() => {
		const handleStorageChange = (changes: Record<string, any>, areaName: string) => {
			if (areaName === "local" && key in changes) {
				setValue(changes[key].newValue ?? initialValue)
			}
		}

		storageHandler.onChanged.addListener(handleStorageChange)
		return () => storageHandler.onChanged.removeListener(handleStorageChange)
	}, [key, initialValue])

	const updateValue = async (newValue: T) => {
		// console.log(`Setting ${key} to:`, newValue)
		try {
			await storageHandler.set(key, newValue)
			setValue(newValue)
		} catch (error) {
			console.error(`Error setting ${key}:`, error)
		}
	}

	return [value, updateValue, isInitialized] as const
}
