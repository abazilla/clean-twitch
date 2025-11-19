import { DISPLAY_NONE_STYLES } from "../utils/cssManipulators"
import { storageHandler } from "../utils/storageHandler"
import { BlockedCategories } from "./definitions"

let categoryStyleElement: HTMLStyleElement

export async function initializeBlockedCategories() {
	// Create dedicated style element for blocked categories
	categoryStyleElement = document.createElement("style")
	categoryStyleElement.id = "blocked-categories-styles"
	document.head.appendChild(categoryStyleElement)

	// Load and apply initial blocked categories
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
		.flatMap((c) => [
			...(hideFromSearch
				? [
						`div[role="row"]:has(a[href="/directory/category/${c.category}"])`,
						`div[data-a-target="search-result-category"]:has(a[href="/directory/category/${c.category}"])`,
						`div[data-a-target="search-results-live-channel"]:has(a[href="/directory/category/${c.category}"])`,
						`#search-tray__container a[href="/directory/category/${c.category}"]`,
						`a[data-tray-item="true"][href="/directory/category/${c.category}"]`,
						`a[data-a-target="search-result-live-channel"][href="/directory/category/${c.category}"]`,
						`a[href*="/directory/category/${c.category}"] ~ .search-result`,
						`a[href*="/directory/category/${c.category}"] ~ .search-result-card`,
						`div.efCikq:has(.search-result-card__img-wrapper):has(a[href="/${c.category}"])`,
					]
				: []),
			...(hideFromSidebar
				? [
						`div.side-nav-card:has(a[href*="/directory/category/${c.category}" i])`,
						`div.side-nav-card:has(p[title="${c.name}" i])`,
					]
				: []),
			...(hideFromDirectory
				? [
						`div[data-target="directory-first-item"]:has(a[href="/directory/category/${c.category}"])`,
						`div[data-target=""]:has(a[href="/directory/category/${c.category}"])`,

						`a[href*="/directory/category/${c.category}"] ~ div[data-target="directory-page__card-container"]`,
						`div.game-card:has(a[href="/directory/category/${c.category}"])`,
						`div[data-a-target="shelf-card"]:has(a[href="/directory/category/${c.category}"])`,
						`div > h2 > a[href*="${c.category}"] ~ div`,
						`a[href*="/directory/category/${c.category}"] ~ .shelf-card__impression-wrapper`,
						`div.vertical-selector__wrapper > div.vertical-selector > a[href*="/directory/${c.category}"]`,
					]
				: []),
		])
		.join(",")

	const categoryRuleWithStyling =
		categoryRules.length === 0 ? "" : categoryRules + `{${DISPLAY_NONE_STYLES}}`

	categoryStyleElement.textContent = categoryRuleWithStyling
}
