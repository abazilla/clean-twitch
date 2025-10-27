import { handleBlockedCategories, initializeBlockedCategories } from "./features/blockedCategories"
import { handleBlockedChannels, initializeBlockedChannels } from "./features/blockedChannels"
import {
	FeatureID,
	getFeaturesForMode,
	SimplePresetMode,
	toggleableFeatureIDs,
} from "./features/definitions"
import {
	NORMAL_CSS,
	toggleGreyscale,
	toggleTestMode,
	UNIVERSAL_STYLE_ID,
} from "./features/domManipulators"
import { featureToggleMap } from "./features/toggleMap"
import { storageHandler } from "./utils/storageHandler"

// Toggle feature functionality
export async function handleFeatureOnToggle(id: FeatureID, value: any) {
	// Handle special cases that don't have on_toggle functions
	switch (id) {
		case "blocked_channels":
			handleBlockedChannels(value)
			return
		case "blocked_categories":
			handleBlockedCategories(value)
			return
		case "simple_mode_preset":
			await applySimpleModeFeatures(value as SimplePresetMode)
			return
		case "is_simple_mode":
			await handleModeSwitch(value as boolean)
			return
		case "test_mode":
			await toggleTestMode(value)
			return
		case "greyscale_all":
			await toggleGreyscale(value)
			return
	}

	// Find the toggle function in the map and call it
	const toggleFunction = featureToggleMap[id]
	if (toggleFunction) {
		try {
			toggleFunction(value)
		} catch (error) {
			console.error(`Error calling toggle function for ${id}:`, error)
		}
	} else {
		console.warn(`No toggle function found for feature: ${id}`)
	}
}

// Handle switching between Simple and Advanced modes, and on init.
export async function handleModeSwitch(isSimpleMode: boolean) {
	console.log(`Switching to ${isSimpleMode ? "simple" : "advanced"} mode`)

	if (isSimpleMode) {
		// apply the current preset
		const preset = (await storageHandler.get<SimplePresetMode>("simple_mode_preset")) || "show_all"
		await applySimpleModeFeatures(preset)
	} else {
		// restore individual settings
		await applyAdvancedModeFeatures()
	}
}

export async function applySimpleModeFeatures(preset: SimplePresetMode) {
	const featuresToEnable = getFeaturesForMode(preset)
	toggleableFeatureIDs.forEach((featureId) => {
		try {
			const shouldEnable = featuresToEnable.includes(featureId)
			handleFeatureOnToggle(featureId, shouldEnable)
		} catch (error) {
			console.error(`Error toggling feature ${featureId}:`, error)
		}
	})
}

export async function applyAdvancedModeFeatures() {
	for (const featureId of toggleableFeatureIDs) {
		const storedValue = await storageHandler.get(featureId)
		try {
			// Use stored value if it exists, otherwise default to false (disabled)
			const shouldEnable =
				storedValue !== undefined && storedValue !== null ? Boolean(storedValue) : false
			handleFeatureOnToggle(featureId, shouldEnable)
		} catch (error) {
			console.error(`Error restoring feature ${featureId}:`, error)
		}
	}
}

export async function initializeStylesAndFeatures() {
	let isSimpleMode = await storageHandler.get<boolean>("is_simple_mode")

	// First time setup
	if (isSimpleMode === undefined || isSimpleMode === null) {
		await storageHandler.set("is_simple_mode", true)
		isSimpleMode = true
	}

	// Apply correct mode on load
	await handleModeSwitch(isSimpleMode)

	const style = document.createElement("style")
	style.id = UNIVERSAL_STYLE_ID
	style.textContent = NORMAL_CSS
	document.head.appendChild(style)

	await initializeBlockedChannels(style)
	await initializeBlockedCategories(style)
}
