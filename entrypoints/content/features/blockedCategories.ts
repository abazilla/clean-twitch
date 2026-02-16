import { BLOCKED_CATEGORIES_STYLE_ID, DISPLAY_NONE_STYLES } from "../dom/cssManager"
import { storageHandler } from "../storage/handler"
import { BlockedCategories } from "./definitions"

let categoryStyleElement: HTMLStyleElement

const DEFAULT_BLOCKED_CATEGORIES: BlockedCategories = {
	enabled: true,
	hideFromSidebar: true,
	hideFromDirectory: true,
	hideFromSearch: true,
	categories: [],
}

export async function initializeBlockedCategories() {
	// Create dedicated style element for blocked categories
	categoryStyleElement = document.createElement("style")
	categoryStyleElement.id = BLOCKED_CATEGORIES_STYLE_ID
	document.head.appendChild(categoryStyleElement)

	// Load and apply initial blocked categories, merging with defaults for missing fields
	const stored = (await storageHandler.get("blocked_categories")) as
		| Partial<BlockedCategories>
		| undefined
	const blockedCategories: BlockedCategories = {
		enabled: stored?.enabled ?? DEFAULT_BLOCKED_CATEGORIES.enabled,
		hideFromSidebar: stored?.hideFromSidebar ?? DEFAULT_BLOCKED_CATEGORIES.hideFromSidebar,
		hideFromDirectory: stored?.hideFromDirectory ?? DEFAULT_BLOCKED_CATEGORIES.hideFromDirectory,
		hideFromSearch: stored?.hideFromSearch ?? DEFAULT_BLOCKED_CATEGORIES.hideFromSearch,
		categories: stored?.categories ?? DEFAULT_BLOCKED_CATEGORIES.categories,
	}

	// Save back if we had to fill in any defaults
	if (
		!stored ||
		Object.keys(DEFAULT_BLOCKED_CATEGORIES).some(
			(key) => stored[key as keyof BlockedCategories] === undefined
		)
	) {
		await storageHandler.set("blocked_categories", blockedCategories)
	}

	handleBlockedCategories(blockedCategories)
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
						`div[data-a-target="search-result-live-channel"]:has(a[href="/directory/category/${c.category}"])`,
						`div[data-a-target="search-result-video"]:has(a[href="/directory/category/${c.category}"])`,
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
						// `.ScTransitionBase-sc-hx4quq-0.ldiLWn:has(a[href="/directory/category/${c.category}"])`, // caused a bug on channels vod list if category existed in vods, may be removed in future
						`a[href*="/directory/category/${c.category}"] ~ div[data-target="directory-page__card-container"]`, // /directory
						`div.game-card:has(a[href="/directory/category/${c.category}"])`,
						`div[data-a-target="shelf-card"]:has(a[href="/directory/category/${c.category}"])`,
						`div > h2 > a[href*="${c.category}"] ~ div`,
						// `a[href*="/directory/category/${c.category}"] ~ .shelf-card__impression-wrapper`,
						`div.tw-transition:has(> .shelf-card__impression-wrapper):has(a[href="/directory/category/${c.category}"])`, // home
						`div.vertical-selector__wrapper:has(a[href*="/directory/${c.category}"])`, // long purp button on directory
					]
				: []),
		])
		.join(",")

	const categoryRuleWithStyling =
		categoryRules.length === 0 ? "" : categoryRules + `{${DISPLAY_NONE_STYLES}}`

	categoryStyleElement.textContent = categoryRuleWithStyling
}
