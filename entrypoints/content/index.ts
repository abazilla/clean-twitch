import { ContentScriptContext } from "#imports"
import { setupUrlChangeListener } from "./dom/urlObserver"
import { handleFeatureOnToggle, initializeStylesAndFeatures } from "./featureController"
import { FeatureID } from "./features/definitions"
import { storageHandler } from "./storage/handler"
import { initializeButtonManager } from "./ui/hideButton/manager"
import { injectFallbackStyles } from "./ui/hideButton/styles"

export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	cssInjectionMode: "ui",

	async main(ctx: ContentScriptContext) {
		// Initial style setup and feature handlers
		await initializeStylesAndFeatures()

		// Inject button styles
		injectFallbackStyles()

		// Initialize button injection system
		await initializeButtonManager(ctx)

		// Set up listeners after initialization is complete
		setupUrlChangeListener()

		// TODO: Hook into URL changes to reinject buttons
		// For now, buttons will be reinjected via existing URL observer

		storageHandler.onChanged.addListener((changes, areaName) => {
			if (areaName === "local") {
				const key = Object.keys(changes)[0] as FeatureID
				// Should check for simple mode here
				handleFeatureOnToggle(key, changes[key].newValue)
			}
		})
	},
})
