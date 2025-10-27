import { UNIVERSAL_CLASS_NAME } from "../features/domManipulators"

function updateElementAsync(
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void,
	timeoutMs: number | "no_timeout",
	persistenceSetting: "always_on" | "stop_on_found"
): MutationObserver {
	const observer = new MutationObserver((mutations, obs) => {
		const $element = getElement()
		if ($element.length) {
			action($element)
			if (persistenceSetting === "stop_on_found") {
				obs.disconnect()
				console.log("disconnecting observer for", $element)
			}
		}
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})

	if (persistenceSetting === "stop_on_found") {
		if (timeoutMs !== "no_timeout" && timeoutMs > 0) {
			setTimeout(() => {
				console.log("timing out observer")
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
	persistenceSetting: "always_on" | "stop_on_found" = "stop_on_found"
) => {
	const $element = getElement()
	if ($element.length) action($element)
	else updateElementAsync(getElement, action, timeoutMs, persistenceSetting)
}

export function toggleElementVisibility($element: JQuery<HTMLElement>, toggled: boolean) {
	toggled ? $element.addClass(UNIVERSAL_CLASS_NAME) : $element.removeClass(UNIVERSAL_CLASS_NAME)
}
