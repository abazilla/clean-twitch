import { storage } from "@/entrypoints/content/storage"

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
			if (areaName === "local" && key in changes) {
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
