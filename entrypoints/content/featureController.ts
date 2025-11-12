import { handleBlockedCategories, initializeBlockedCategories } from "./features/blockedCategories"
import { handleBlockedChannels, initializeBlockedChannels } from "./features/blockedChannels"
import {
	FeatureID,
	getFeaturesForMode,
	SimplePresetMode,
	toggleableFeatureIDs,
} from "./features/definitions"
import {
	DISPLAY_DISABLED_STYLES,
	DISPLAY_DISABLED_TEST,
	DISPLAY_NONE_STYLES,
	GREYSCALE_CLASS_NAME,
	GREYSCALE_CSS,
	GREYSCALE_DISABLED,
	GREYSCALE_FILTER_ON,
	NORMAL_CSS,
	TEST_MODE_STYLES,
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
	const style = document.getElementById(UNIVERSAL_STYLE_ID)
	if (style) {
		const currentContent = style.textContent || ""
		if (enabled) {
			// Replace invalid display values back to "display: none !important;"
			let enabledContent = currentContent.replaceAll(DISPLAY_DISABLED_STYLES, DISPLAY_NONE_STYLES)
			// Also replace test mode disabled back to test mode styles
			enabledContent = enabledContent.replaceAll(DISPLAY_DISABLED_TEST, TEST_MODE_STYLES)
			// Also replace greyscale disabled back to greyscale active
			enabledContent = enabledContent.replaceAll(GREYSCALE_DISABLED, GREYSCALE_FILTER_ON)
			style.textContent = enabledContent
		} else {
			// Replace "display: none !important;" with invalid value to disable hiding
			let disabledContent = currentContent.replaceAll(DISPLAY_NONE_STYLES, DISPLAY_DISABLED_STYLES)
			// Also replace test mode styling with disabled test value
			disabledContent = disabledContent.replaceAll(TEST_MODE_STYLES, DISPLAY_DISABLED_TEST)
			// Also replace greyscale filter with disabled greyscale
			disabledContent = disabledContent.replaceAll(GREYSCALE_FILTER_ON, GREYSCALE_DISABLED)
			style.textContent = disabledContent
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

	// create styles
	const style = document.createElement("style")
	style.id = UNIVERSAL_STYLE_ID
	style.textContent = NORMAL_CSS + GREYSCALE_CSS
	document.head.appendChild(style)

	// Apply correct mode on load
	let isSimpleMode = await storageHandler.get<boolean>("is_simple_mode")

	// First time setup
	if (isSimpleMode === undefined || isSimpleMode === null) {
		await storageHandler.set("is_simple_mode", true)
		isSimpleMode = true
	}
	await handleModeSwitch(isSimpleMode)

	// Handle greyscale setting
	document.documentElement.classList.add(GREYSCALE_CLASS_NAME)
	const greyscaleMode = await storageHandler.get<boolean>("greyscale_all")
	toggleGreyscale(greyscaleMode || false)

	// Handle test mode setting
	document.documentElement.classList.add(GREYSCALE_CLASS_NAME)
	const testMode = await storageHandler.get<boolean>("test_mode")
	toggleTestMode(testMode || false)

	await initializeBlockedChannels(style)
	await initializeBlockedCategories(style)
}
