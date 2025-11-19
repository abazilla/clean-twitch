import { handleBlockedCategories, initializeBlockedCategories } from "./features/blockedCategories"
import { handleBlockedChannels, initializeBlockedChannels } from "./features/blockedChannels"
import {
	FeatureID,
	getFeaturesForMode,
	SimplePresetMode,
	toggleableFeatureIDs,
} from "./features/definitions"
import { toggleGrayscale, toggleTestMode } from "./features/domManipulators"
import { featureToggleMap } from "./features/toggleMap"
import {
	BLOCKED_CATEGORIES_STYLE_ID,
	BLOCKED_CHANNELS_STYLE_ID,
	DISPLAY_DISABLED_STYLES,
	DISPLAY_DISABLED_TEST,
	DISPLAY_NONE_STYLES,
	GRAYSCALE_CLASS_NAME,
	GRAYSCALE_DISABLED,
	GRAYSCALE_FILTER_ON,
	initializeStyleElement,
	TEST_MODE_STYLES,
	UNIVERSAL_STYLE_ID_CSS,
	UNIVERSAL_STYLE_ID_JS,
} from "./utils/cssManipulators"
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
		case "grayscale_all":
			await toggleGrayscale(value)
			return
		case "extension_enabled":
			await toggleExtensionEnabled(value as boolean)
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

// Toggle the entire extension on/off
export async function toggleExtensionEnabled(enabled: boolean) {
	const styleIds = [UNIVERSAL_STYLE_ID_JS, UNIVERSAL_STYLE_ID_CSS, BLOCKED_CHANNELS_STYLE_ID, BLOCKED_CATEGORIES_STYLE_ID]
	
	for (const styleId of styleIds) {
		const style = document.getElementById(styleId)
		if (style) {
			const currentContent = style.textContent || ""
			if (enabled) {
				// Replace invalid display values back to "display: none !important;"
				let enabledContent = currentContent.replaceAll(DISPLAY_DISABLED_STYLES, DISPLAY_NONE_STYLES)
				// Also replace test mode disabled back to test mode styles
				enabledContent = enabledContent.replaceAll(DISPLAY_DISABLED_TEST, TEST_MODE_STYLES)
				// Also replace grayscale disabled back to grayscale active
				enabledContent = enabledContent.replaceAll(GRAYSCALE_DISABLED, GRAYSCALE_FILTER_ON)
				style.textContent = enabledContent
			} else {
				// Replace "display: none !important;" with invalid value to disable hiding
				let disabledContent = currentContent.replaceAll(DISPLAY_NONE_STYLES, DISPLAY_DISABLED_STYLES)
				// Also replace test mode styling with disabled test value
				disabledContent = disabledContent.replaceAll(TEST_MODE_STYLES, DISPLAY_DISABLED_TEST)
				// Also replace grayscale filter with disabled grayscale
				disabledContent = disabledContent.replaceAll(GRAYSCALE_FILTER_ON, GRAYSCALE_DISABLED)
				style.textContent = disabledContent
			}
		}
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
	// Sync from sync storage
	storageHandler.pullFromSync()

	await initializeBlockedChannels()
	await initializeBlockedCategories()
	await initializeStyleElement()

	// Apply correct mode on load
	let isSimpleMode = await storageHandler.get<boolean>("is_simple_mode")

	// First time setup
	if (isSimpleMode === undefined || isSimpleMode === null) {
		await storageHandler.set("is_simple_mode", true)
		isSimpleMode = true
	}
	await handleModeSwitch(isSimpleMode)

	// Handle grayscale setting
	document.documentElement.classList.add(GRAYSCALE_CLASS_NAME)
	const grayscaleMode = await storageHandler.get<boolean>("grayscale_all")
	toggleGrayscale(grayscaleMode || false)

	// Handle test mode setting
	document.documentElement.classList.add(GRAYSCALE_CLASS_NAME)
	const testMode = await storageHandler.get<boolean>("test_mode")
	toggleTestMode(testMode || false)
}
