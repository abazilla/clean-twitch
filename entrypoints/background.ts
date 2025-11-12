import { browser } from "wxt/browser"

// Specific comparison functions for complex storage types
function compareBlockedChannels(oldValue: any, newValue: any): boolean {
	if (oldValue === newValue) return false
	if (oldValue === undefined || newValue === undefined) return true
	
	// Compare boolean properties
	if (oldValue.enabled !== newValue.enabled ||
		oldValue.hideFromSidebar !== newValue.hideFromSidebar ||
		oldValue.hideFromDirectory !== newValue.hideFromDirectory ||
		oldValue.hideFromSearch !== newValue.hideFromSearch) {
		return true
	}
	
	// Compare usernames array
	const oldUsernames = oldValue.usernames || []
	const newUsernames = newValue.usernames || []
	
	if (oldUsernames.length !== newUsernames.length) return true
	
	return oldUsernames.some((oldUser: any, index: number) => {
		const newUser = newUsernames[index]
		return oldUser.username !== newUser.username || oldUser.enabled !== newUser.enabled
	})
}

function compareBlockedCategories(oldValue: any, newValue: any): boolean {
	if (oldValue === newValue) return false
	if (oldValue === undefined || newValue === undefined) return true
	
	// Compare boolean properties
	if (oldValue.enabled !== newValue.enabled ||
		oldValue.hideFromSidebar !== newValue.hideFromSidebar ||
		oldValue.hideFromDirectory !== newValue.hideFromDirectory ||
		oldValue.hideFromSearch !== newValue.hideFromSearch) {
		return true
	}
	
	// Compare categories array
	const oldCategories = oldValue.categories || []
	const newCategories = newValue.categories || []
	
	if (oldCategories.length !== newCategories.length) return true
	
	return oldCategories.some((oldCat: any, index: number) => {
		const newCat = newCategories[index]
		return oldCat.category !== newCat.category || 
			   oldCat.name !== newCat.name || 
			   oldCat.enabled !== newCat.enabled
	})
}

export default defineBackground(() => {
	// Debounced sync to avoid hammering sync storage
	const syncTimeouts = new Map<string, NodeJS.Timeout>()

	function scheduleSync<T>(key: string, value: T) {
		// Clear existing timeout for this key
		const existingTimeout = syncTimeouts.get(key)
		if (existingTimeout) {
			clearTimeout(existingTimeout)
		}

		// Schedule new sync after 2 seconds of inactivity
		const timeout = setTimeout(() => {
			try {
				console.log(`Syncing ${key} to sync storage`)
				browser.storage.sync.set({ [key]: value })
				syncTimeouts.delete(key)
			} catch (error) {
				console.error(`Error syncing ${key} to cloud:`, error)
			}
		}, 2000)

		syncTimeouts.set(key, timeout)
	}


	// Listen for local storage changes and sync them to sync storage
	browser.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "local") {
			Object.keys(changes).forEach((key) => {
				const change = changes[key]
				if (change.newValue === undefined) return
				
				let hasChanges = false
				if (key === 'blocked_channels') {
					hasChanges = compareBlockedChannels(change.oldValue, change.newValue)
				} else if (key === 'blocked_categories') {
					hasChanges = compareBlockedCategories(change.oldValue, change.newValue)
				} else {
					// Simple comparison for other storage keys
					hasChanges = change.oldValue !== change.newValue
				}
				
				if (hasChanges) {
					scheduleSync(key, change.newValue)
				}
			})
		}
	})
})
