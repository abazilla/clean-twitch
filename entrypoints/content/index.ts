import { ContentScriptContext } from "#imports"
import $ from "jquery"
import { handleFeatureOnToggle, handleModeSwitch } from "./featureController"
import { initializeBlockedCategories } from "./features/blockedCategories"
import { initializeBlockedChannels } from "./features/blockedChannels"
import { FeatureID } from "./features/definitions"
import { NORMAL_CSS, UNIVERSAL_STYLE_ID } from "./features/domManipulators"
import { storageHandler } from "./utils/storageHandler"
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
			let isSimpleMode = await storageHandler.get<boolean>("is_simple_mode")

			// First time setup
			if (isSimpleMode === undefined || isSimpleMode === null) {
				await storageHandler.set("is_simple_mode", true)
				isSimpleMode = true
			}

			// Apply correct mode on load
			await handleModeSwitch(isSimpleMode)

			setupUrlChangeListener()

			storageHandler.onChanged.addListener((changes, areaName) => {
				if (areaName === "local") {
					const key = Object.keys(changes)[0] as FeatureID
					// Should check for simple mode here
					handleFeatureOnToggle(key, changes[key].newValue)
				}
			})
		}

		$(mainInitialization)
	},
})
