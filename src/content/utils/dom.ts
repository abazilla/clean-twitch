function updateElementAsync(
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void,
	timeoutMs: number | "no_timeout",
	persistenceSetting: "always_on" | "stop_on_found"
) {
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
}

export const withToggle =
	(toggled: boolean, fn: ($el: JQuery<HTMLElement>, toggled: boolean) => void) =>
	($el: JQuery<HTMLElement>) => {
		fn($el, toggled)
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
	toggled
		? $element.addClass("twitch-declutter-hidden")
		: $element.removeClass("twitch-declutter-hidden")
}
