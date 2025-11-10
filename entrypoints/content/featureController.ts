import { initializeBlockedCategories } from "./features/blockedCategories"
import { initializeBlockedChannels } from "./features/blockedChannels"
import {
	allFeatureIDs,
	FeatureID,
	getFeaturesForMode,
	SimplePresetMode,
	toggleableFeatureIDs,
} from "./features/definitions"
import { NORMAL_CSS, UNIVERSAL_STYLE_ID } from "./features/domManipulators"
import { featureToggleMap } from "./features/toggleMap"

// Toggle feature functionality
export async function handleFeatureOnToggle() {
	// Handle special cases that don't have on_toggle functions
	// storage.watch<BlockedChannels>("sync:blocked_channels", (value) => handleBlockedChannels(value))
	// storage.watch<BlockedCategories>("sync:blocked_categories", (value) =>
	// 	handleBlockedCategories(value)
	// )
	// storage.watch<SimplePresetMode>("sync:simple_mode_preset", (value) =>
	// 	applySimpleModeFeatures(value || "show_all")
	// )
	// storage.watch<boolean>("sync:is_simple_mode", (value) => handleModeSwitch(!!value))
	// storage.watch<boolean>("sync:test_mode", (value) => toggleTestMode(!!value))
	// storage.watch<boolean>("sync:greyscale_all", (value) => toggleGreyscale(!!value))

	// initialize items
	watchFeatures(allFeatureIDs)
	runFeatures(allFeatureIDs)
}

export function watchFeatures(featureIDs: FeatureID[]) {
	// Find the toggle function in the map and call it
	featureIDs.forEach((featureId) => {
		storage.watch<boolean>(`sync:${featureId}`, (value) => {
			// console.log("watchFeatures", { featureId, value })
			const toggleFunction = featureToggleMap[featureId]
			if (toggleFunction) {
				try {
					toggleFunction(!!value)
				} catch (error) {
					console.error(`Error calling toggle function for ${featureId}:`, error)
				}
			}
		})
	})
}

async function runFeatures(featureIDs: FeatureID[]) {
	const syncIDs = featureIDs.map((id) => `sync:${id}`) as `local:${string}`[]
	// Find the toggle function in the map and call it
	await storage.getItems(syncIDs).then((results) => {
		results.forEach(({ key, value }) => {
			const featureId = key.replace("sync:", "") as FeatureID
			// console.log("runFeatures", { key, value, featureId })
			const toggleFunction = featureToggleMap[featureId]
			if (toggleFunction) {
				try {
					toggleFunction(!!value)
				} catch (error) {
					console.error(`Error calling toggle function for ${featureId}:`, error)
				}
			}
		})
	})
	// featureIDs.forEach((featureId) => {
	// 	await storage.getItem<boolean>(`sync:${featureId}`).then((value) => {
	// 		console.log("runFeatures", { featureId, value })
	// 		const toggleFunction = featureToggleMap[featureId]
	// 		if (toggleFunction) {
	// 			try {
	// 				toggleFunction(!!value)
	// 			} catch (error) {
	// 				console.error(`Error calling toggle function for ${featureId}:`, error)
	// 			}
	// 		}
	// 	})
	// })
}

// Handle switching between Simple and Advanced modes, and on init.
export async function handleModeSwitch(isSimpleMode: boolean) {
	console.log(`Switching to ${isSimpleMode ? "simple" : "advanced"} mode`)

	if (isSimpleMode) {
		// apply the current preset
		await storage
			.getItem<SimplePresetMode>("sync:simple_mode_preset")
			.then((value) => applySimpleModeFeatures(value || "show_all"))
	} else {
		// restore individual settings
		await applyAdvancedModeFeatures()
	}
}

export function applySimpleModeFeatures(preset: SimplePresetMode) {
	const featuresToEnable = getFeaturesForMode(preset)
	runFeatures(featuresToEnable)
}

export function applyAdvancedModeFeatures() {
	runFeatures(toggleableFeatureIDs)
}

export async function initializeStylesAndFeatures() {
	await storage.getItem<boolean>("sync:is_simple_mode").then(async (isSimpleMode) => {
		// First time setup
		if (isSimpleMode === undefined || isSimpleMode === null) {
			await storage.setItem("sync:is_simple_mode", true)
			isSimpleMode = true
		}

		// Apply correct mode on load
		await handleModeSwitch(isSimpleMode)
	})

	const style = document.createElement("style")
	style.id = UNIVERSAL_STYLE_ID
	style.textContent = NORMAL_CSS
	document.head.appendChild(style)

	await initializeBlockedChannels(style)
	await initializeBlockedCategories(style)
}
