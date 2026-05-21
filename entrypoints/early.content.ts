import { CSS_CACHE_KEY, EARLY_STYLE_ID } from "./content/dom/cssCache"

// Runs before Twitch paints. Re-injects the stylesheet cached by the main
// content script so hidden elements (left sidebar, etc.) never flash on cold
// load. The main script removes this once its real stylesheet is built.
export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	runAt: "document_start",
	main() {
		try {
			const cached = localStorage.getItem(CSS_CACHE_KEY)
			if (!cached) return
			const style = document.createElement("style")
			style.id = EARLY_STYLE_ID
			style.textContent = cached
			;(document.head ?? document.documentElement).appendChild(style)
		} catch {
			// localStorage unavailable — skip early inject, main script still applies.
		}
	},
})
