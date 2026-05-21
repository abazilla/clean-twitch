import { coupledFeatures, FeatureID } from "@/entrypoints/content/features/definitions"
import { storageHandler } from "@/entrypoints/content/storage/handler"
import { useEffect, useState } from "react"

// Suffix for stashing a dependent's value before a controller forces it on, so
// it can be restored when the controller is turned off.
const COUPLED_PREV_SUFFIX = "__prev_before_coupled"

/**
 * Cascade a user-initiated toggle to its coupled dependents.
 * Controller ON  -> stash each dependent's current value, force it true.
 * Controller OFF -> restore each dependent's stashed value (default false).
 */
export async function applyCoupledFeatures(id: string, value: boolean) {
	const deps = coupledFeatures[id as FeatureID]
	if (!deps) return

	for (const dep of deps) {
		if (value) {
			const current = (await storageHandler.get<boolean>(dep)) ?? false
			await storageHandler.set(`${dep}${COUPLED_PREV_SUFFIX}`, current)
			await storageHandler.set(dep, true)
		} else {
			const prev = (await storageHandler.get<boolean>(`${dep}${COUPLED_PREV_SUFFIX}`)) ?? false
			await storageHandler.set(dep, prev)
		}
	}
}

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
