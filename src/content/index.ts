import $ from "jquery"
import { isChrome, storage } from "../utils/storage"
import { handleBlockedCategories, initializeBlockedCategories } from "./features/blockedCategories"
import { handleBlockedChannels, initializeBlockedChannels } from "./features/blockedChannels"
import { setupUrlChangeListener } from "./observers/urlObserver"
import { FeatureId, FeatureItem, features, getFeaturesForMode, SimplePresetMode } from "./types"

// Initialize global styles
const style = document.createElement("style")
style.textContent = `
/* Global Rules */
.twitch-declutter-hidden {
    display: none !important;
}
/* Category Rules */
/* Channel Rules */
`
document.head.appendChild(style)

// Initialize feature handlers
initializeBlockedChannels(style)
initializeBlockedCategories(style)

// Main initialization
$(function () {
	// Check if we're in simple mode first
	storage.get<boolean>("is_simple_mode").then(async (isSimpleMode) => {
		// If not set, default to simple mode (first time use)
		if (isSimpleMode === undefined || isSimpleMode === null) {
			await storage.set("is_simple_mode", true)
			isSimpleMode = true
		}

		if (isSimpleMode) {
			// We're in simple mode - apply the preset
			const preset = (await storage.get<SimplePresetMode>("simple_mode_preset")) || "show_all"
			await handleSimpleModePreset(preset)
		} else {
			// We're in advanced mode - load individual feature settings
			features.forEach((f) => {
				storage.get(f.id).then((result) => {
					// console.log("parent", f.id)
					handleToggle(f.id, true, result)
				})
				if (f.children && f.children.length > 0) {
					f.children.forEach((cf) => {
						storage.get(cf.id).then((result) => {
							// console.log("child", cf.id)
							handleToggle(cf.id, true, result)
						})
					})
				}
			})
		}
	})

	// Watch for URL changes
	setupUrlChangeListener()

	// Listen for changes
	storage.onChanged.addListener((changes, areaName) => {
		const expectedArea = isChrome ? "sync" : "local"
		if (areaName === expectedArea) {
			const key = Object.keys(changes)[0] as FeatureId
			handleToggle(key, false, changes[key].newValue)
		}
	})
})

function findFeatureById(id: FeatureId): FeatureItem | undefined {
	const findInItems = (items: readonly FeatureItem[]): FeatureItem | undefined => {
		for (const item of items) {
			if (item.id === id) return item
			if (item.children) {
				const found = findInItems(item.children)
				if (found) return found
			}
		}
		return undefined
	}
	return findInItems(features)
}

async function handleToggle(id: FeatureId, onLoad: boolean, value: any) {
	// Handle special cases that don't have on_toggle functions
	switch (id) {
		case "blocked_channels":
			handleBlockedChannels(value)
			return
		case "blocked_categories":
			handleBlockedCategories(value)
			return
		case "simple_mode_preset":
			await handleSimpleModePreset(value as SimplePresetMode)
			return
		case "is_simple_mode":
			await handleModeSwitch(value as boolean)
			return
	}

	// Check if we're in simple mode - if so, ignore individual feature toggles
	const isInSimpleMode = await storage.get<boolean>("is_simple_mode")
	if (isInSimpleMode) {
		console.log(`Ignoring individual feature toggle for ${id} - in simple mode`)
		return
	}

	// Find the feature and call its on_toggle function
	const feature = findFeatureById(id)
	if (feature?.on_toggle) {
		try {
			feature.on_toggle(value)
		} catch (error) {
			console.error(`Error calling on_toggle for ${id}:`, error)
		}
	} else {
		console.warn(`No on_toggle function found for feature: ${id}`)
	}
}

async function handleModeSwitch(isSimpleMode: boolean) {
	console.log(`Switching to ${isSimpleMode ? "simple" : "advanced"} mode`)

	if (isSimpleMode) {
		// Switched to simple mode - apply the current preset
		const preset = (await storage.get<SimplePresetMode>("simple_mode_preset")) || "show_all"
		await applySimpleModeFeatures(preset)
	} else {
		// Switched to advanced mode - restore individual settings
		await restoreAdvancedModeSettings()
	}
}

async function handleSimpleModePreset(preset: SimplePresetMode) {
	console.log(`Applying simple mode preset: ${preset}`)

	// Only apply if we're actually in simple mode (or if not set, assume simple mode)
	const isInSimpleMode = await storage.get<boolean>("is_simple_mode")
	if (isInSimpleMode === false) {
		console.log("Ignoring preset change - not in simple mode")
		return
	}

	if (preset === "show_all") {
		// When switching to "show_all", restore individual feature settings
		await restoreAdvancedModeSettings()
	} else {
		// Apply simple mode features
		await applySimpleModeFeatures(preset)
	}
}

async function applySimpleModeFeatures(preset: SimplePresetMode) {
	// Get all features that should be enabled for this preset
	const featuresToEnable = getFeaturesForMode(preset)

	// Get all possible feature IDs
	const allFeatureIds: string[] = []
	const collectAllIds = (items: readonly FeatureItem[]) => {
		for (const item of items) {
			if (!item.hidden) {
				allFeatureIds.push(item.id)
				if (item.children) {
					collectAllIds(item.children)
				}
			}
		}
	}
	collectAllIds(features)

	// Apply preset: disable all, then enable selected features
	allFeatureIds.forEach((featureId) => {
		const feature = findFeatureById(featureId)
		if (feature?.on_toggle) {
			try {
				const shouldEnable = featuresToEnable.includes(featureId)
				feature.on_toggle(shouldEnable)
			} catch (error) {
				console.error(`Error toggling feature ${featureId}:`, error)
			}
		}
	})
}

async function restoreAdvancedModeSettings() {
	// Restore individual feature settings from storage
	const allFeatureIds: string[] = []
	const collectAllIds = (items: readonly FeatureItem[]) => {
		for (const item of items) {
			if (!item.hidden) {
				allFeatureIds.push(item.id)
				if (item.children) {
					collectAllIds(item.children)
				}
			}
		}
	}
	collectAllIds(features)

	// Apply each feature's stored setting
	for (const featureId of allFeatureIds) {
		const storedValue = await storage.get(featureId)
		const feature = findFeatureById(featureId)
		if (feature?.on_toggle && storedValue !== undefined && storedValue !== null) {
			try {
				feature.on_toggle(Boolean(storedValue))
			} catch (error) {
				console.error(`Error restoring feature ${featureId}:`, error)
			}
		}
	}
}
