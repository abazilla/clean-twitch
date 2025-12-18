import { UNIVERSAL_CLASS_NAME } from "./cssManipulators"

type PersistenceSettingType = "always_on" | "stop_on_found" | "stop_after_timeout"

type ElementCollection = NodeListOf<Element> | Element | null

// Helper to check if collection has elements
export function hasElements(elements: ElementCollection): boolean {
	if (!elements) return false
	if ('length' in elements) return elements.length > 0
	return true // single Element
}

// JS Manip
function updateElementAsync(
	getElement: () => ElementCollection,
	action: (element: ElementCollection) => void,
	timeoutMs: number | "no_timeout",
	persistenceSetting: PersistenceSettingType,
	functionName?: string
): MutationObserver {
	const observer = new MutationObserver((mutations, obs) => {
		const element = getElement()
		if (hasElements(element)) {
			action(element)
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
	getElement: () => ElementCollection,
	action: (element: ElementCollection) => void,
	timeoutMs: number | "no_timeout" = 10000,
	persistenceSetting: PersistenceSettingType = "stop_on_found",
	functionName?: string
) => {
	const element = getElement()
	if (hasElements(element)) action(element)
	else updateElementAsync(getElement, action, timeoutMs, persistenceSetting, functionName)
}

export function toggleElementVisibility(element: ElementCollection, toggled: boolean) {
	if (!element) return
	
	if ('length' in element) {
		// NodeListOf<Element>
		element.forEach(el => {
			toggled ? el.classList.add(UNIVERSAL_CLASS_NAME) : el.classList.remove(UNIVERSAL_CLASS_NAME)
		})
	} else {
		// Single Element
		toggled ? element.classList.add(UNIVERSAL_CLASS_NAME) : element.classList.remove(UNIVERSAL_CLASS_NAME)
	}
}
