import $ from "jquery"
import { BlockedCategories } from "../../pages/popup/types"
import { toggleElementVisibility, updateElement } from "../utils/dom"

let styleElement: HTMLStyleElement

export function initializeBlockedCategories(style: HTMLStyleElement) {
	styleElement = style
}

export function handleBlockedCategories(blockedCategories: BlockedCategories) {
	const { categories, enabled, hideFromSidebar, hideFromDirectory, hideFromSearch } =
		blockedCategories

	// Update global CSS rules for search results
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

	const globalAndChannelRules = styleElement.textContent?.split("/* Category Rules */")[0] || ""
	styleElement.textContent = `
		${globalAndChannelRules}
		/* Category Rules */
		${categoryRules}
	`

	categories.forEach((blockedCategory) => {
		// Hide from left sidebar
		updateElement(
			() =>
				$(`p`)
					.filter((_, el) =>
						$(el).text().toLocaleLowerCase().includes(blockedCategory.name.toLocaleLowerCase())
					)
					.closest("div.side-nav-card")
					.parent()
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedCategory.enabled)
		)

		// Directory section cards
		updateElement(
			() =>
				$(`a[href*="/directory/category/${blockedCategory.category}"]`)
					.closest(`div[data-target="directory-page__card-container"]`)
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Hide whole directory results page
		updateElement(
			() =>
				$(`p`)
					.filter((_, el) =>
						$(el).text().toLocaleLowerCase().includes(`${blockedCategory.name.toLocaleLowerCase()}`)
					)
					.closest(`div.switcher-shell__container--grid`),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)

		if (enabled && hideFromSearch && blockedCategory.enabled) {
			$('div[aria-label="Play/Pause"]').closest("button").trigger("click")
		}

		// Homepage sections
		updateElement(
			() => $(`div > h2 > a[href*="${blockedCategory.category}"]`).parent().parent().parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Homepage cards
		updateElement(
			() =>
				$(`a[href*="/directory/category/${blockedCategory.category}"]`)
					.closest(".shelf-card__impression-wrapper")
					.parent(),
			($el) => toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled)
		)

		// Purple Homepage buttons
		updateElement(
			() =>
				$(
					`div.vertical-selector__wrapper > div.vertical-selector > a[href*="/directory/${blockedCategory.category}"]`
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
					.filter((_, el) =>
						$(el)
							.text()
							.toLocaleLowerCase()
							.includes(
								`people searching for "${blockedCategory.name.toLocaleLowerCase()}" also watch:`
							)
					)
					.closest(`div.search-results`),
			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled)
		)
	})
}
