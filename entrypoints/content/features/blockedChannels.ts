import $ from "jquery"
import { toggleElementVisibility, updateElement } from "../utils/dom"
import { storageHandler } from "../utils/storageHandler"
import { BlockedChannels, TwitchURLs } from "./definitions"

let styleElement: HTMLStyleElement

export async function initializeBlockedChannels(style: HTMLStyleElement) {
	styleElement = style

	// Load and apply initial blocked channels
	const blockedChannels = (await storageHandler.get("blocked_channels")) as BlockedChannels
	if (blockedChannels && blockedChannels.usernames) {
		handleBlockedChannels(blockedChannels)
	}
}

export function handleBlockedChannels(blockedChannels: BlockedChannels) {
	const { usernames, enabled, hideFromSidebar, hideFromDirectory, hideFromSearch } = blockedChannels
	const url = window.location.pathname

	// Update global CSS rules for search results (under where you type)
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

	const globalRules = styleElement.textContent?.split("/* Channel Rules */")[0] || ""
	const categoryRules = styleElement.textContent?.split("/* Category Rules */")[1] || ""

	styleElement.textContent = `
		${globalRules}
		/* Channel Rules */
		${searchRules}
		/* Category Rules */
		${categoryRules}
	`

	usernames.forEach((blockedUser) => {
		// Hide from sidebar - recommended channels
		updateElement(
			() => $(`div.side-nav-card:has(a[href="/${blockedUser.username}"])`).parent().parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedUser.enabled),
			10000,
			"stop_on_found",
			"handleBlockedChannels"
		)

		// Hide from homepage
		if (url === TwitchURLs.Home) {
			updateElement(
				() =>
					$(`a[href="/${blockedUser.username}"][data-a-target="preview-card-image-link"]`)
						.closest("div.shelf-card__impression-wrapper")
						.parent(),
				($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled),
				10000,
				"stop_on_found",
				"handleBlockedChannels"
			)
		}

		// Hide from directory (/all?)
		if (url === TwitchURLs.DirectoryAll || url === TwitchURLs.DirectoryGaming) {
			updateElement(
				() =>
					$(`a[data-a-target="preview-card-image-link"][href="/${blockedUser.username}"]`)
						.closest(`div[data-target="directory-game__card_container"]`)
						.parent(),
				($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled),
				"no_timeout",
				"stop_on_found",
				"handleBlockedChannels"
			)

			// Hide from directory
			updateElement(
				() =>
					$(`a[href="/${blockedUser.username}"][data-a-target="preview-card-image-link"]`)
						.closest(`div[data-target="directory-game__card_container"]`)
						.parent(),
				($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled),
				10000,
				"stop_on_found",
				"handleBlockedChannels"
			)
		}

		if (url.includes(TwitchURLs.DirectoryCategory)) {
			updateElement(
				() => $(`a[href="/${blockedUser.username}"]`).parents().eq(10),
				($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled),
				10000,
				"stop_on_found",
				"handleBlockedChannels"
			)
		}

		// Hide from recommended channels
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-test-selector="recommended-channel"]`).closest(
					"div.recommended-channel"
				),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedUser.enabled),
			10000,
			"stop_on_found",
			"handleBlockedChannels"
		)

		// Hide from search results (online)
		updateElement(
			() =>
				$(
					`div[data-a-target="search-results-live-channel"]:has(a[href="/${blockedUser.username}"])`
				),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedUser.enabled),
			"no_timeout",
			"stop_on_found",
			"handleBlockedChannels"
		)

		if (TwitchURLs.Search) {
			// Hide from search results (offline)
			updateElement(
				() =>
					$(`div.search-result-offline_channel--body:has(a[href="/${blockedUser.username}"])`)
						.parents()
						.eq(1),
				($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedUser.enabled),
				"no_timeout",
				"stop_on_found",
				"handleBlockedChannels"
			)
		}

		// Hide from search dropdown
		updateElement(
			() =>
				$(`a[href="/${blockedUser.username}"][data-a-target="search-result-live-channel"]`).closest(
					".search-result"
				),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedUser.enabled),
			"no_timeout",
			"stop_on_found",
			"handleBlockedChannels"
		)
	})
}
