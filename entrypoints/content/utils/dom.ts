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
	globalStyleElement.textContent = NORMAL_CSS + GREYSCALE_CSS
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
	const ruleToFind = `${selector}{${styles}}`

	if (toggled) {
		if (!currentContent.includes(ruleToFind)) {
			globalStyleElement.textContent = `${currentContent}\n${ruleToFind}`
		}
	} else {
		globalStyleElement.textContent = currentContent
			.replace(ruleToFind, "")
			.replace(/\n\s*\n/g, "\n")
	}
}
