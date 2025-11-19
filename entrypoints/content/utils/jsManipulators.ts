import { UNIVERSAL_CLASS_NAME } from "./cssManipulators"

type PersistenceSettingType = "always_on" | "stop_on_found" | "stop_after_timeout"

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
