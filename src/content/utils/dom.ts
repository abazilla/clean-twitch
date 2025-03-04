export function updateElementAsync(
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void
) {
	const observer = new MutationObserver((mutations, obs) => {
		const $element = getElement()
		if ($element.length) {
			action($element)
			obs.disconnect()
		}
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})
}

export const withToggle =
	(toggled: boolean, fn: ($el: JQuery<HTMLElement>, toggled: boolean) => void) =>
	($el: JQuery<HTMLElement>) => {
		fn($el, toggled)
	}

export const updateElement = (
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void
) => {
	const $element = getElement()
	if ($element.length) action($element)
	else updateElementAsync(getElement, action)
}

export function toggleElementVisibility($element: JQuery<HTMLElement>, toggled: boolean) {
	toggled
		? $element.addClass("twitch-declutter-hidden")
		: $element.removeClass("twitch-declutter-hidden")
}
