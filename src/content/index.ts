import $ from "jquery"
import { BlockedChannels, FeatureId, features } from "../pages/popup/types"

const style = document.createElement("style")
style.textContent = `
.twitch-declutter-hidden {
    display: none !important;
}
`
document.head.appendChild(style)

$(function () {
	// Initial setup
	features.forEach((f) => {
		chrome.storage.sync.get(f.id).then((result) => {
			handleToggle(f.id, true, result[f.id])
		})
		if (f.children.length > 0) {
			f.children.forEach((cf) => {
				chrome.storage.sync.get(cf.id).then((result) => {
					handleToggle(f.id, true, result[f.id])
				})
			})
		}
	})

	// Listen for changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "sync") {
			const key = Object.keys(changes)[0] as FeatureId
			handleToggle(key, false, changes[key].newValue)
		}
	})
})

function handleToggle(id: FeatureId, onLoad: boolean, value: any) {
	switch (id) {
		case "greyscale_all":
			toggleGreyscale(value)
			break
		case "hide_prime_gaming_button":
			hidePrimeGamingButton(value)
			break
		case "hide_left_sidebar":
			if (value) {
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
				withToggle(value, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_followed_channels":
			updateElement(
				() => $("div[aria-label='Followed Channels']"),
				withToggle(value, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_live_channels":
			updateElement(
				() => $("div[aria-label='Live Channels']"),
				withToggle(value, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_viewers_also_watch":
			updateElement(
				() => $("div[aria-label='Live Channels']").next(),
				withToggle(value, toggleElementVisibility)
			)
			break
		case "hide_chat_highlights":
			updateElement(
				() => $("div.chat-room__content > div").not("[class='Layout-sc-1xcs6mc-0']").eq(0),
				withToggle(value, toggleElementVisibility)
			)
			break
		case "hide_sticky_footer":
			// todo also click the button
			updateElement(
				() => $("#twilight-sticky-footer-root"),
				withToggle(value, toggleElementVisibility)
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
		case "blocked_channels":
			handleBlockedChannels(value)
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
	toggled
		? $element.addClass("twitch-declutter-hidden")
		: $element.removeClass("twitch-declutter-hidden")
}

// function toggleElementWidth($element: JQuery<HTMLElement>, toggled: boolean) {
// 	toggled ? $element.attr("style", "width: 0 !important;") : $element.removeAttr("style")
// }

function hidePrimeGamingButton(isHidden: boolean) {
	const $primeButton = $(".top-nav__prime")
	$primeButton.each(function () {
		$(this).toggle(!isHidden)
	})
}

function handleBlockedChannels(blockedChannels: BlockedChannels) {
	const { usernames, enabled, hideFromSidebar, hideFromDirectory, hideFromSearch } = blockedChannels

	// Update global CSS rules for search results
	// We do this because we can't use a MutationObserver to watch for changes in
	// the search results after the first render of the results

	const searchRules = usernames
		.filter((u) => u.enabled && enabled && hideFromSearch)
		.map(
			(u) => `
			#search-tray__container a[href="/${u.username}"],
			a[data-tray-item="true"][href="/${u.username}"],
			a[data-a-target="search-result-live-channel"][href="/${u.username}"] {
				display: none !important;
			}
	 `
		)
		.join("\n")

	style.textContent = `
		.twitch-declutter-hidden {
			display: none !important;
		}
		${searchRules}
	`

	usernames.forEach((blockedUser) => {
		// Hide from sidebar - recommended channels
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-test-selector="recommended-channel"]`)
					.parent()
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedUser.enabled)
		)
		// Hide from sidebar - similar channels
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-test-selector="similarity-channel"]`)
					.parent()
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedUser.enabled)
		)
		// Hide from sidebar - followed channels
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-test-selector="followed-channel"]`)
					.parent()
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedUser.enabled)
		)

		// Hide from mobile sidebar
		updateElement(
			() => $(`a[href="/${blockedUser.username}"].side-nav-card`).parent().parent().parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedUser.enabled)
		)

		// Hide from homepage
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-a-target="preview-card-image-link"]`)
					.closest("div.shelf-card__impression-wrapper")
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled)
		)
		// Hide from directory
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-a-target="preview-card-image-link"]`)
					.closest(`div[data-target="directory-game__card_container"]`)
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled)
		)
		// Hide from recommended channels
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-test-selector="recommended-channel"]`).closest(
					"div.recommended-channel"
				),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled)
		)

		// Hide from search results
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-tray-item="true"]`).parent().parent().parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedUser.enabled)
		)

		// Hide from search dropdown
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-a-target="search-result-live-channel"]`).closest(
					".search-result"
				),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedUser.enabled)
		)
	})
}
