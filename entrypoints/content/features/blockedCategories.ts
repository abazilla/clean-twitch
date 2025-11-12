import { storageHandler } from "../utils/storageHandler"
import { BlockedCategories } from "./definitions"

let styleElement: HTMLStyleElement

export async function initializeBlockedCategories(style: HTMLStyleElement) {
	styleElement = style

	// Load and apply initial blocked categories
	// const { storageHandler: storage } = await import("../utils/storage")
	const blockedCategories = (await storageHandler.get("blocked_categories")) as BlockedCategories
	if (blockedCategories && blockedCategories.categories) {
		handleBlockedCategories(blockedCategories)
	}
}

export function handleBlockedCategories(blockedCategories: BlockedCategories) {
	const { enabled, hideFromSidebar, hideFromDirectory, hideFromSearch } = blockedCategories

	const categories = blockedCategories.categories || []

	// Update global CSS rules for all blocked categories
	const categoryRules = categories
		.filter((c) => c.enabled && enabled)
		.map(
			(c) => `
			/* Search results */
			${
				hideFromSearch
					? `
			div[data-target="directory-first-item"]:has(a[href="/directory/category/${c.category}"]),
			div[data-target=""]:has(a[href="/directory/category/${c.category}"]),
			div[data-a-target="search-result-live-channel"]:has(a[href="/directory/category/${c.category}"]),
			#search-tray__container a[href="/directory/category/${c.category}"],
			a[data-tray-item="true"][href="/directory/category/${c.category}"],
			a[data-a-target="search-result-live-channel"][href="/directory/category/${c.category}"],
			a[href*="/directory/category/${c.category}"] ~ .search-result,
			a[href*="/directory/category/${c.category}"] ~ .search-result-card,
			div.efCikq:has(.search-result-card__img-wrapper):has(a[href="/${c.category}"]) {
				display: none !important;
			}`
					: ""
			}
			
			/* Sidebar recommended categories */
			${
				hideFromSidebar
					? `
			div.side-nav-card:has(a[href*="/directory/category/${c.category}"]),
			/* div.side-nav-card:has(p[title="${c.category}"]), */
			/* div.side-nav-card:has(p[title="${c.category.toLowerCase()}"]), */
			div.side-nav-card:has(p[title="${c.category.toUpperCase()}"])
			 {
				display: none !important;
			}`
					: ""
			}
			
			/* Homepage and directory */
			${
				hideFromDirectory
					? `
			a[href*="/directory/category/${c.category}"] ~ div[data-target="directory-page__card-container"],
			div.game-card:has(a[href="/directory/category/${c.category}"]),
			div[data-a-target="shelf-card"]:has(a[href="/directory/category/${c.category}"]),
			div > h2 > a[href*="${c.category}"] ~ div,
			a[href*="/directory/category/${c.category}"] ~ .shelf-card__impression-wrapper,
			div.vertical-selector__wrapper > div.vertical-selector > a[href*="/directory/${c.category}"] {
				display: none !important;
			}`
					: ""
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

	// categories.forEach((blockedCategory) => {
	// 	// Hide from left sidebar
	// 	updateElement(
	// 		() =>
	// 			$("p")
	// 				.filter((_, el) => parseCategory($(el).text()) === blockedCategory.category)
	// 				.closest("div.side-nav-card")
	// 				.parent()
	// 				.parent(),
	// 		($el) => toggleElementVisibility($el, enabled && hideFromSidebar && blockedCategory.enabled),
	// 		5000,
	// 		"stop_on_found",
	// 		"handleBlockedCategories"
	// 	)

	// 	// Directory section cards
	// 	if (url === TwitchURLs.Directory || url === TwitchURLs.DirectoryGaming) {
	// 		updateElement(
	// 			() =>
	// 				$(`a[href*="/directory/category/${blockedCategory.category}"]`)
	// 					.closest(`div[data-target="directory-page__card-container"]`)
	// 					.parent(),
	// 			($el) =>
	// 				toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)
	// 	}

	// 	if (url.includes(TwitchURLs.DirectoryFollowingGames)) {
	// 		updateElement(
	// 			() =>
	// 				$(`div.game-card:has(a[href="/directory/category/${blockedCategory.category}"])`)
	// 					.parents()
	// 					.eq(1),
	// 			($el) =>
	// 				toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)
	// 	}

	// 	if (url.includes(TwitchURLs.DirectoryGaming)) {
	// 		updateElement(
	// 			() =>
	// 				$(
	// 					`div[data-a-target="shelf-card"]:has(a[href="/directory/category/${blockedCategory.category}"])`
	// 				).parent(),
	// 			($el) =>
	// 				toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)
	// 	}

	// 	// Homepage sections
	// 	if (url === TwitchURLs.Home) {
	// 		updateElement(
	// 			() => $(`div > h2 > a[href*="${blockedCategory.category}"]`).parent().parent().parent(),
	// 			($el) =>
	// 				toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)

	// 		// Homepage cards
	// 		updateElement(
	// 			() =>
	// 				$(`a[href*="/directory/category/${blockedCategory.category}"]`)
	// 					.closest(".shelf-card__impression-wrapper")
	// 					.parent(),
	// 			($el) =>
	// 				toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)

	// 		// Purple Homepage buttons
	// 		updateElement(
	// 			() =>
	// 				$(
	// 					`div.vertical-selector__wrapper > div.vertical-selector > a[href*="/directory/${blockedCategory.category}"]`
	// 				)
	// 					.parent()
	// 					.parent(),
	// 			($el) =>
	// 				toggleElementVisibility($el, enabled && hideFromDirectory && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)
	// 	}

	// 	// Search dropdown results
	// 	updateElement(
	// 		() =>
	// 			$(`a[href*="/directory/category/${blockedCategory.category}"]`).closest(".search-result"),
	// 		($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled),
	// 		"no_timeout",
	// 		"stop_on_found",
	// 		"handleBlockedCategories"
	// 	)

	// 	if (url.includes(TwitchURLs.Search)) {
	// 		// Search page results
	// 		updateElement(
	// 			() =>
	// 				$(`a[href*="/directory/category/${blockedCategory.category}"]`)
	// 					.closest(".search-result-card")
	// 					.parent(),
	// 			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled),
	// 			"no_timeout",
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)
	// 		updateElement(
	// 			() => $(`a[href*="/directory/category/${blockedCategory.category}"]`).closest(".tw-col"),
	// 			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled),
	// 			"no_timeout",
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)

	// 		// Hide whole search results page
	// 		updateElement(
	// 			() =>
	// 				$(`h3`)
	// 					.filter((_, el) =>
	// 						$(el)
	// 							.text()
	// 							.toLocaleLowerCase()
	// 							.includes(
	// 								`people searching for "${blockedCategory.name.toLocaleLowerCase()}" also watch:`
	// 							)
	// 					)
	// 					.closest(`div.search-results`),
	// 			($el) => toggleElementVisibility($el, enabled && hideFromSearch && blockedCategory.enabled),
	// 			5000,
	// 			"stop_on_found",
	// 			"handleBlockedCategories"
	// 		)
	// 	}
	// })
}
