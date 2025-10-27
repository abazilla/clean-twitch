import { ContentScriptContext } from "#imports"
import $ from "jquery"
import { handleBlockedCategories, initializeBlockedCategories } from "./features/blockedCategories"
import { handleBlockedChannels, initializeBlockedChannels } from "./features/blockedChannels"
import {
	NORMAL_CSS,
	toggleGreyscale,
	toggleTestMode,
	UNIVERSAL_STYLE_ID,
} from "./features/uiFeatures"
import { storage } from "./storage"
import { toggleMap } from "./toggleMap"
import { FeatureId, FeatureItem, features, getFeaturesForMode, SimplePresetMode } from "./toggles"
import { setupUrlChangeListener } from "./utils/urlObserver"

export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	cssInjectionMode: "ui",

	async main(_ctx: ContentScriptContext) {
		// Initial style setup
		const style = document.createElement("style")
		style.id = UNIVERSAL_STYLE_ID
		style.textContent = NORMAL_CSS
		document.head.appendChild(style)

		// Initialize feature handlers
		await initializeBlockedChannels(style)
		await initializeBlockedCategories(style)

		// Main initialization
		const mainInitialization = async () => {
			let isSimpleMode = await storage.get<boolean>("is_simple_mode")

			// First time setup
			if (isSimpleMode === undefined || isSimpleMode === null) {
				await storage.set("is_simple_mode", true)
				isSimpleMode = true
			}

			if (isSimpleMode) {
				const preset = (await storage.get<SimplePresetMode>("simple_mode_preset")) || "show_all"
				await handleSimpleModePreset(preset)
			} else {
				await loadAdvancedModeSettings()
			}

			setupUrlChangeListener()

			storage.onChanged.addListener((changes, areaName) => {
				if (areaName === "local") {
					const key = Object.keys(changes)[0] as FeatureId
					handleToggle(key, changes[key].newValue)
				}
			})
		}

		async function loadAdvancedModeSettings() {
			const promises: Promise<void>[] = []

			features.forEach((f) => {
				promises.push(
					storage.get(f.id).then((result) => {
						handleToggle(f.id, result)
					})
				)

				if (f.children && f.children.length > 0) {
					f.children.forEach((cf) => {
						promises.push(
							storage.get(cf.id).then((result) => {
								handleToggle(cf.id, result)
							})
						)
					})
				}
			})

			await Promise.all(promises)
		}

		$(mainInitialization)

		async function handleToggle(id: FeatureId, value: any) {
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
				case "test_mode":
					await toggleTestMode(value)
					return
				case "greyscale_all":
					await toggleGreyscale(value)
					return
			}

			// Check if we're in simple mode - if so, ignore individual feature toggles
			const isInSimpleMode = await storage.get<boolean>("is_simple_mode")
			if (isInSimpleMode) {
				console.log(`Ignoring individual feature toggle for ${id} - in simple mode`)
				return
			}

			// Find the toggle function in the map and call it
			const toggleFunction = toggleMap[id]
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

			// Apply simple mode features for any preset (including "show_all")
			await applySimpleModeFeatures(preset)
		}

		function collectAllFeatureIds(): string[] {
			const allFeatureIds: string[] = []
			const collectAllIds = (items: readonly FeatureItem[]) => {
				for (const item of items) {
					allFeatureIds.push(item.id)
					if (item.children) {
						collectAllIds(item.children)
					}
				}
			}
			collectAllIds(features)
			return allFeatureIds
		}

		async function applySimpleModeFeatures(preset: SimplePresetMode) {
			const featuresToEnable = getFeaturesForMode(preset)
			const allFeatureIds = collectAllFeatureIds()

			allFeatureIds.forEach((featureId) => {
				const toggleFunction = toggleMap[featureId]
				if (toggleFunction) {
					try {
						const shouldEnable = featuresToEnable.includes(featureId)
						toggleFunction(shouldEnable)
					} catch (error) {
						console.error(`Error toggling feature ${featureId}:`, error)
					}
				}
			})
		}

		async function restoreAdvancedModeSettings() {
			const allFeatureIds = collectAllFeatureIds()

			for (const featureId of allFeatureIds) {
				const storedValue = await storage.get(featureId)
				const toggleFunction = toggleMap[featureId]
				if (toggleFunction) {
					try {
						// Use stored value if it exists, otherwise default to false (disabled)
						const shouldEnable =
							storedValue !== undefined && storedValue !== null ? Boolean(storedValue) : false
						toggleFunction(shouldEnable)
					} catch (error) {
						console.error(`Error restoring feature ${featureId}:`, error)
					}
				}
			}
		}
	},
})
