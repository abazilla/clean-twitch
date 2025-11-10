import { ContentScriptContext } from "#imports"
import $ from "jquery"
import { handleFeatureOnToggle, initializeStylesAndFeatures } from "./featureController"
import { setupUrlChangeListener } from "./utils/urlObserver"

export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	cssInjectionMode: "ui",

	async main(_ctx: ContentScriptContext) {
		// Initial style setup and feature handlers
		await initializeStylesAndFeatures()

		// Main initialization
		const mainInitialization = async () => {
			setupUrlChangeListener()

			handleFeatureOnToggle()
			// TODO: optimize to only run for simple vs advanced mode
			// watchFeatures(toggleableFeatureIDs)
			// storageHandler.onChanged.addListener((changes, areaName) => {
			// 	if (areaName === "local") {
			// 		const key = Object.keys(changes)[0] as FeatureID
			// 		// Should check for simple mode here
			// 		handleFeatureOnToggle(key, changes[key].newValue)
			// 	}
			// })
		}

		$(mainInitialization)
	},
})
