export const UNIVERSAL_CLASS_NAME = "clean-twitch-clutter"
export const GRAYSCALE_CLASS_NAME = "clean-twitch-grayscale"
export const UNIVERSAL_STYLE_ID_JS = "clean-twitch-id-js"
export const UNIVERSAL_STYLE_ID_CSS = "clean-twitch-id-css"
export const BLOCKED_CHANNELS_STYLE_ID = "clean-twitch-blocked-channels-styles"
export const BLOCKED_CATEGORIES_STYLE_ID = "clean-twitch-blocked-categories-styles"
export const TEST_MODE_STYLES =
	"background-color: red !important; border: 1px solid yellow !important; opacity: 0.5 !important;"
export const DISPLAY_NONE_STYLES = "display: none !important;"
export const DISPLAY_DISABLED_STYLES = "display: clean-twitch-disabled !important;"
export const DISPLAY_DISABLED_TEST = "display: clean-twitch-test-disabled !important;"
export const GRAYSCALE_FILTER_OFF = "filter: grayscale(0) !important;"
export const GRAYSCALE_FILTER_ON = "filter: grayscale(1) !important;"
export const GRAYSCALE_DISABLED = "filter: clean-twitch-grayscale-disabled !important;"
export const GRAYSCALE_CSS = `.${GRAYSCALE_CLASS_NAME} { ${GRAYSCALE_FILTER_OFF} } `
export const NORMAL_CSS = `.${UNIVERSAL_CLASS_NAME} { ${DISPLAY_NONE_STYLES} } `

let globalStyleElementCSS: HTMLStyleElement

// CSS Manip
export function initializeStyleElement() {
	// Create dedicated style element for global styles
	const globalStyleElementJS = document.createElement("style")
	globalStyleElementJS.id = UNIVERSAL_STYLE_ID_JS
	globalStyleElementJS.textContent = NORMAL_CSS + GRAYSCALE_CSS
	document.head.appendChild(globalStyleElementJS)

	globalStyleElementCSS = document.createElement("style")
	globalStyleElementCSS.id = UNIVERSAL_STYLE_ID_CSS
	globalStyleElementCSS.textContent =
		"/* DISPLAY_NONE_STYLES_START */\n/* DISPLAY_NONE_STYLES_END */" +
		"\n/* GRAYSCALE_STYLES_START */\n/* GRAYSCALE_STYLES_END */"
	document.head.appendChild(globalStyleElementCSS)
}

export function toggleCSSHidden(selector: string, toggled: boolean) {
	if (!globalStyleElementCSS) {
		console.warn("Global style element not initialized. Call initializeStyleElement first.")
		return
	}
	const currentContent = globalStyleElementCSS.textContent || ""
	const startMarker = "/* DISPLAY_NONE_STYLES_START */"
	const endMarker = "/* DISPLAY_NONE_STYLES_END */"

	const startIndex = currentContent.indexOf(startMarker)
	const endIndex = currentContent.indexOf(endMarker)

	if (startIndex === -1 || endIndex === -1) {
		console.warn("DISPLAY_NONE_STYLES markers not found in style element")
		return
	}

	const beforeSection = currentContent.substring(0, startIndex + startMarker.length)
	const afterSection = currentContent.substring(endIndex)
	const currentSection = currentContent.substring(startIndex + startMarker.length, endIndex)

	// Find the existing CSS rule with display:none styles
	const braceIndex = currentSection.indexOf(`{${DISPLAY_NONE_STYLES}}`)
	const hasExistingRule = braceIndex !== -1

	let newSection = ""

	if (hasExistingRule) {
		const selectorsString = currentSection.substring(0, braceIndex)

		if (toggled) {
			// Add selector if not already present
			if (!selectorsString.includes(selector)) {
				const newSelectors = selectorsString ? `${selectorsString}, ${selector}` : selector
				newSection = `${newSelectors}{${DISPLAY_NONE_STYLES}}`
			} else {
				newSection = currentSection
			}
		} else {
			// Remove selector
			const updatedSelectors = selectorsString
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s !== selector)
				.join(", ")

			if (updatedSelectors) {
				newSection = `${updatedSelectors}{${DISPLAY_NONE_STYLES}}`
			}
		}
	} else if (toggled) {
		// Create new rule
		newSection = `${selector}{${DISPLAY_NONE_STYLES}}`
	}

	globalStyleElementCSS.textContent = beforeSection + newSection + afterSection
}

export function toggleCSSGrayscale(selector: string, toggled: boolean) {
	if (!globalStyleElementCSS) {
		console.warn("Global style element not initialized. Call initializeStyleElement first.")
		return
	}
	const currentContent = globalStyleElementCSS.textContent || ""
	const startMarker = "/* GRAYSCALE_STYLES_START */"
	const endMarker = "/* GRAYSCALE_STYLES_END */"

	const startIndex = currentContent.indexOf(startMarker)
	const endIndex = currentContent.indexOf(endMarker)

	if (startIndex === -1 || endIndex === -1) {
		console.warn("GRAYSCALE_STYLES_END markers not found in style element")
		return
	}

	const beforeSection = currentContent.substring(0, startIndex + startMarker.length)
	const afterSection = currentContent.substring(endIndex)
	const currentSection = currentContent.substring(startIndex + startMarker.length, endIndex)

	// Find the existing CSS rule with grayscale styles
	const braceIndex = currentSection.indexOf(`{${GRAYSCALE_FILTER_ON}}`)
	const hasExistingRule = braceIndex !== -1

	let newSection = ""

	if (hasExistingRule) {
		const selectorsString = currentSection.substring(0, braceIndex)

		if (toggled) {
			// Add selector if not already present
			if (!selectorsString.includes(selector)) {
				const newSelectors = selectorsString ? `${selectorsString}, ${selector}` : selector
				newSection = `${newSelectors}{${GRAYSCALE_FILTER_ON}}`
			} else {
				newSection = currentSection
			}
		} else {
			// Remove selector
			const updatedSelectors = selectorsString
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s !== selector)
				.join(", ")

			if (updatedSelectors) {
				newSection = `${updatedSelectors}{${GRAYSCALE_FILTER_ON}}`
			}
		}
	} else if (toggled) {
		// Create new rule
		newSection = `${selector}{${GRAYSCALE_FILTER_ON}}`
	}

	globalStyleElementCSS.textContent = beforeSection + newSection + afterSection
}
