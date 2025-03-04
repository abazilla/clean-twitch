import $ from "jquery"
import { BlockedCategories, BlockedChannels, FeatureId, features } from "../pages/popup/types"

const style = document.createElement("style")
style.textContent = `
/* Global Rules */
.twitch-declutter-hidden {
    display: none !important;
}
/* Category Rules */
/* Channel Rules */
`
document.head.appendChild(style)

$(function () {
	// Initial setup
	features.forEach((f) => {
		chrome.storage.sync.get(f.id).then((result) => {
			handleToggle(f.id, true, result[f.id])
			console.log("parent", f.id)
		})
		if (f.children.length > 0) {
			f.children.forEach((cf) => {
				chrome.storage.sync.get(cf.id).then((result) => {
					handleToggle(cf.id, true, result[cf.id])
					console.log("child", cf.id)
				})
			})
		}
	})

	// Watch for browser back/forward
	setupUrlChangeListener()

	// Listen for changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "sync") {
			const key = Object.keys(changes)[0] as FeatureId
			handleToggle(key, false, changes[key].newValue)
		}
	})
})

function setupUrlChangeListener() {
	// Store initial URL
	let lastUrl = window.location.href

	// Check for URL changes frequently
	const observer = new MutationObserver(function (mutations) {
		if (window.location.href !== lastUrl) {
			lastUrl = window.location.href
			handleUrlChange(lastUrl)
		}
	})

	// Observe the whole document for changes
	observer.observe(document, {
		subtree: true,
		childList: true,
	})

	// Also keep the history watchers
	window.addEventListener("popstate", () => handleUrlChange(lastUrl))

	const originalPushState = history.pushState
	history.pushState = function (...args) {
		originalPushState.apply(this, args)
		handleUrlChange(lastUrl)
	}

	const originalReplaceState = history.replaceState
	history.replaceState = function (...args) {
		originalReplaceState.apply(this, args)
		handleUrlChange(lastUrl)
	}
}

function handleUrlChange(lastUrl: string) {
	console.log("URL changed to:", window.location.href)
	// Run URL-dependent code here
	if (lastUrl.includes("search"))
		$("div.search-results")?.removeClass("twitch-declutter-hidden") || $()
	if (lastUrl.includes("/directory/category/"))
		$("div.switcher-shell__container--grid")?.removeClass("twitch-declutter-hidden") || $()
}

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
				$('div[data-a-target="side-nav-bar"').attr("style", "width: 0 !important;")
			} else {
				$('div[data-a-target="side-nav-bar"').removeAttr("style")
				$('div[data-a-target="side-nav-bar-collapsed"').removeAttr("style")
				$('button[aria-label="Expand Side Nav"]').trigger("click")
			}
			break
		case "hide_left_sidebar_stories":
			updateElement(
				() => $("div.storiesLeftNavSection--csO9S"),
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
		case "blocked_categories":
			handleBlockedCategories(value)
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

	const globalRules = style.textContent?.split("/* Channel Rules */")[0] || ""
	const categoryRules = style.textContent?.split("/* Category Rules */")[1] || ""

	style.textContent = `
		${globalRules}
		/* Channel Rules */
		${searchRules}
		/* Category Rules */
		${categoryRules}
	`

	usernames.forEach((blockedUser) => {
		// Hide from sidebar - recommended channels
		updateElement(
			() => $(`a[href="/${blockedUser.username}"]`).parent().parent(),
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

function handleBlockedCategories(blockedCategories: BlockedCategories) {
	const { categories, enabled, hideFromSidebar, hideFromDirectory, hideFromSearch } =
		blockedCategories

	// Update global CSS rules for search results
	// We do this because we can't use a MutationObserver to watch for changes in
	// the search results after the first render of the results
	const categoryRules = categories
		.filter((c) => c.enabled && enabled && hideFromSearch)
		.map(
			(c) => `
			div[data-a-target="search-result-live-channel"]:has(a[href="/directory/category/${c.category}"]),
			#search-tray__container a[href="/directory/category/${c.category}"],
			a[data-tray-item="true"][href="/directory/category/${c.category}"],
			a[data-a-target="search-result-live-channel"][href="/directory/category/${c.category}"] {
				display: none !important;
			}
	 `
		)
		.join("\n")

	const globalAndChannelRules = style.textContent?.split("/* Category Rules */")[0] || ""
	style.textContent = `
		${globalAndChannelRules}
		/* Category Rules */
		${categoryRules}
	`

	categories.forEach((blockedCategory) => {
		// Hide from left sidebar (desktop, mobile only applies when moving from desktop -> mobile as there is no game data)
		updateElement(
			() =>
				$(`p`)
					.filter(
						(_, el) => $(el).text().toLocaleLowerCase() === blockedCategory.name.toLocaleLowerCase()
					)
					.closest("div.side-nav-card")
					.parent()
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedCategory.enabled)
		)

		// Directory section cards
		updateElement(
			() =>
				$(`a[href="/directory/category/${blockedCategory.category}"]`)
					.closest(`div[data-target="directory-page__card-container"]`)
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Hide whole directory results page
		updateElement(
			() =>
				$(`p`)
					.filter(
						(_, el) =>
							$(el).text().toLocaleLowerCase() === `${blockedCategory.name.toLocaleLowerCase()}`
					)
					.closest(`div.switcher-shell__container--grid`),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)

		if (enabled && hideFromSearch && blockedCategory.enabled) {
			$('div[aria-label="Play/Pause"]').closest("button").trigger("click")
		}

		// Homepage sections (often merges directories)
		updateElement(
			() => $(`div > h2 > a[href*="${blockedCategory.category}"]`).parent().parent().parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Homepage cards
		updateElement(
			() =>
				$(`a[href="/directory/category/${blockedCategory.category}"]`)
					.closest(".shelf-card__impression-wrapper")
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Purple Homepage buttons
		updateElement(
			() =>
				$(
					`div.vertical-selector__wrapper > div.vertical-selector > a[href="/directory/${blockedCategory.category}"]`
				)
					.parent()
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Search dropdown results
		updateElement(
			() =>
				$(`a[href*="/directory/category/${blockedCategory.category}"]`).closest(".search-result"),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)

		// Search page results
		updateElement(
			() =>
				$(`a[href*="/directory/category/${blockedCategory.category}"]`)
					.closest(".search-result-card")
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)
		updateElement(
			() => $(`a[href*="/directory/category/${blockedCategory.category}"]`).closest(".tw-col"),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)

		// Hide whole search results page
		updateElement(
			() =>
				$(`h3`)
					.filter(
						(_, el) =>
							$(el).text().toLocaleLowerCase() ===
							`people searching for "${blockedCategory.name.toLocaleLowerCase()}" also watch:`
					)
					.closest(`div.search-results`),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)
	})
}
