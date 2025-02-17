import $ from "jquery"
import { FeatureId, features } from "../pages/popup/types"

$(function () {
	// Initial setup
	features.forEach((f) => {
		chrome.storage.sync.get(f.id).then((result) => {
			const toggled = result[f.id] === true
			handleToggle(f.id, true, toggled)
		})
		if (f.children.length > 0) {
			f.children.forEach((cf) => {
				chrome.storage.sync.get(cf.id).then((result) => {
					const toggled = result[cf.id] === true
					handleToggle(cf.id, true, toggled)
				})
			})
		}
	})
	// $(`nav#side-nav div[role='group']:has(a[data-test-selector='recommended-channel'])`).attr(
	// 	"style",
	// 	"display: none !important;"
	// )

	// Listen for changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "sync") {
			const key = Object.keys(changes)[0] as FeatureId
			handleToggle(key, false, changes[key].newValue)
		}
	})
})

function handleToggle(id: FeatureId, onLoad: boolean, toggled: boolean) {
	switch (id) {
		case "greyscale_all":
			toggleGreyscale(toggled)
			break
		case "hide_prime_gaming_button":
			hidePrimeGamingButton(toggled)
			break
		case "hide_left_sidebar":
			if (toggled) {
				$('div[data-a-target="side-nav-bar"').attr("style", "width: 0 !important;")
				$('div[data-a-target="side-nav-bar-collapsed"').attr("style", "width: 0 !important;")
				$('button[aria-label="Collapse Side Nav"]').trigger("click")
			} else {
				$('div[data-a-target="side-nav-bar"').removeAttr("style")
				$('div[data-a-target="side-nav-bar-collapsed"').removeAttr("style")
				$('button[aria-label="Expand Side Nav"]').trigger("click")
			}
			break
		case "hide_left_sidebar_stories":
			updateElement(
				() => $("div[aria-label='Followed Channels']").prev(),
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_followed_channels":
			updateElement(
				() => $("div[aria-label='Followed Channels']"),
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_live_channels":
			updateElement(
				() => $("div[aria-label='Live Channels']"),
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_viewers_also_watch":
			updateElement(
				() => $("div[aria-label='Live Channels']").next(),
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_sticky_footer":
			updateElement(
				() => $("#twilight-sticky-footer-root"),
				withToggle(toggled, toggleElementVisibility)
			)
			break

		case "hide_chat_highlights":
			updateElement(
				() => $("div.chat-room__content > div").not("[class='Layout-sc-1xcs6mc-0']").eq(0),
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "no_recommendations":
			break
		case "block_gql":
			break
		case "chat_minimal":
			break
		case "chat_only":
			break
		case "no_chat":
			break
		default:
			return
	}
}

function updateElementAsync(
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void
) {
	// Create observer to watch for changes
	const observer = new MutationObserver((mutations, obs) => {
		const $element = getElement()
		if ($element.length) {
			action($element)
			obs.disconnect() // Stop observing once we've found and handled the element
		}
	})

	// Start observing the document for changes
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})
}

// Curry the toggled parameter
const withToggle =
	(toggled: boolean, fn: ($el: JQuery<HTMLElement>, toggled: boolean) => void) =>
	($el: JQuery<HTMLElement>) => {
		fn($el, toggled)
	}

// Curry the toggled parameter for element updates
const updateElement = (
	getElement: () => JQuery<HTMLElement>,
	action: (element: JQuery<HTMLElement>) => void
) => {
	const $element = getElement()
	if ($element.length) action($element)
	else updateElementAsync(getElement, action)
}

function toggleGreyscale(toggled: boolean) {
	toggled
		? $("html").attr("style", "filter: grayscale(1) !important;")
		: $("html").removeAttr("style")
}

function toggleElementVisibility($element: JQuery<HTMLElement>, toggled: boolean) {
	toggled ? $element.attr("style", "display: none !important;") : $element.removeAttr("style")
}

function toggleElementWidth($element: JQuery<HTMLElement>, toggled: boolean) {
	toggled ? $element.attr("style", "width: 0 !important;") : $element.removeAttr("style")
}

function hidePrimeGamingButton(isHidden: boolean) {
	const $primeButton = $(".top-nav__prime")
	$primeButton.each(function () {
		$(this).toggle(!isHidden)
	})
}
