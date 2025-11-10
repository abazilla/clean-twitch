import { ContentScriptContext } from "#imports"
import { handleFeatureOnToggle, initializeStylesAndFeatures } from "./featureController"
import { FeatureID } from "./features/definitions"
import { storageHandler } from "./utils/storageHandler"
import { setupUrlChangeListener } from "./utils/urlObserver"

export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	cssInjectionMode: "ui",

	async main(_ctx: ContentScriptContext) {
		// Initial style setup and feature handlers
		await initializeStylesAndFeatures()

		// Set up listeners after initialization is complete
		setupUrlChangeListener()

		storageHandler.onChanged.addListener((changes, areaName) => {
			if (areaName === "local") {
				const key = Object.keys(changes)[0] as FeatureID
				// Should check for simple mode here
				handleFeatureOnToggle(key, changes[key].newValue)
			}
		})
	},
})
