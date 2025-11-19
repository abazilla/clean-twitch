import {
	DISPLAY_NONE_STYLES,
	GREYSCALE_CSS,
	NORMAL_CSS,
	UNIVERSAL_CLASS_NAME,
	UNIVERSAL_STYLE_ID,
} from "../features/domManipulators"

type PersistenceSettingType = "always_on" | "stop_on_found" | "stop_after_timeout"

let globalStyleElement: HTMLStyleElement

// JS Manip
function updateElementAsync(
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void,
	timeoutMs: number | "no_timeout",
	persistenceSetting: PersistenceSettingType,
	functionName?: string
): MutationObserver {
	const observer = new MutationObserver((mutations, obs) => {
		const $element = getElement()
		if ($element.length) {
			action($element)
			if (persistenceSetting === "stop_on_found") {
				obs.disconnect()
				// console.log(
				// 	functionName || "unknown function",
				// 	"found!, disconnecting obs",
				// 	persistenceSetting
				// )
			}
		}
	})

	observer.observe(document, {
		childList: true,
		subtree: true,
	})

	if (persistenceSetting === "stop_on_found" || persistenceSetting === "stop_after_timeout") {
		if (timeoutMs !== "no_timeout" && timeoutMs > 0) {
			setTimeout(() => {
				// console.log(
				// 	"disconnecting observer for",
				// 	functionName || "unknown function",
				// 	"after",
				// 	timeoutMs,
				// 	"ms",
				// 	persistenceSetting
				// )
				observer.disconnect()
			}, timeoutMs)
		}
	}

	return observer
}

export const updateElement = (
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void,
	timeoutMs: number | "no_timeout" = 10000,
	persistenceSetting: PersistenceSettingType = "stop_on_found",
	functionName?: string
) => {
	const $element = getElement()
	if ($element.length) action($element)
	else updateElementAsync(getElement, action, timeoutMs, persistenceSetting, functionName)
}

export function toggleElementVisibility($element: JQuery<HTMLElement>, toggled: boolean) {
	toggled ? $element.addClass(UNIVERSAL_CLASS_NAME) : $element.removeClass(UNIVERSAL_CLASS_NAME)
}

// CSS Manip
export function initializeStyleElement() {
	// Create dedicated style element for global styles
	globalStyleElement = document.createElement("style")
	globalStyleElement.id = UNIVERSAL_STYLE_ID
	globalStyleElement.textContent = NORMAL_CSS + GREYSCALE_CSS + "\n/* DISPLAY_NONE_STYLES_START */\n/* DISPLAY_NONE_STYLES_END */"
	document.head.appendChild(globalStyleElement)
}

export function toggleCSSSelector(
	selector: string,
	toggled: boolean,
	styles: string = DISPLAY_NONE_STYLES
) {
	if (!globalStyleElement) {
		console.warn("Global style element not initialized. Call initializeStyleElement first.")
		return
	}
	const currentContent = globalStyleElement.textContent || ""
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
	const braceIndex = currentSection.indexOf(`{${styles}}`)
	const hasExistingRule = braceIndex !== -1
	
	let newSection = ""
	
	if (hasExistingRule) {
		const selectorsString = currentSection.substring(0, braceIndex)
		
		if (toggled) {
			// Add selector if not already present
			if (!selectorsString.includes(selector)) {
				const newSelectors = selectorsString ? `${selectorsString}, ${selector}` : selector
				newSection = `${newSelectors}{${styles}}`
			} else {
				newSection = currentSection
			}
		} else {
			// Remove selector
			const updatedSelectors = selectorsString
				.split(',')
				.map(s => s.trim())
				.filter(s => s !== selector)
				.join(', ')
			
			if (updatedSelectors) {
				newSection = `${updatedSelectors}{${styles}}`
			}
		}
	} else if (toggled) {
		// Create new rule
		newSection = `${selector}{${styles}}`
	}
	
	globalStyleElement.textContent = beforeSection + newSection + afterSection
}
