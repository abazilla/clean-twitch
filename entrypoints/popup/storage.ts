import { useEffect, useState } from "react"

/**
 * React hook for managing storage state with automatic sync
 */
export function useStorageState<T>(key: string, initialValue: T) {
	const [value, setValue] = useState<T>(initialValue)
	const [isInitialized, setIsInitialized] = useState(false)

	// Initial load
	useEffect(() => {
		storage.getItem<T>(`sync:${key}`).then((result) => {
			// console.log(`Initial load for ${key}:`, result)
			if (result) {
				setValue(result)
			}
			setIsInitialized(true)
		})
	}, [key])

	// Listen for changes
	useEffect(() => {
		const handleStorageChange = (newValue: T | null, oldValue: T | null) => {
			// console.log(`Storage change for ${key}: from ${oldValue} to ${newValue}`)
			setValue(newValue ?? initialValue)
		}

		// const unwatch =
		storage.watch(`sync:${key}`, handleStorageChange)
		// return unwatch
	}, [key, initialValue])

	const updateValue = async (newValue: T) => {
		// console.log(`Setting ${key} to:`, newValue, typeof newValue)
		try {
			await storage.setItem(`sync:${key}`, newValue)
			setValue(newValue)
		} catch (error) {
			console.error(`Error setting ${key}:`, error)
		}
	}

	return [value, updateValue, isInitialized] as const
}
