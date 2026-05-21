import { BLOCKED_CATEGORIES_STYLE_ID, DISPLAY_NONE_STYLES } from "../dom/cssManager"
import { storageHandler } from "../storage/handler"
import { BlockedCategories } from "./definitions"
import {
	blockedCategoryDirectorySelectors,
	blockedCategorySearchSelectors,
	blockedCategorySidebarSelectors,
} from "./selectors"

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
			...(hideFromSearch ? blockedCategorySearchSelectors(c.category) : []),
			...(hideFromSidebar ? blockedCategorySidebarSelectors(c.category, c.name) : []),
			...(hideFromDirectory ? blockedCategoryDirectorySelectors(c.category) : []),
		])
		.join(",")

	const categoryRuleWithStyling =
		categoryRules.length === 0 ? "" : categoryRules + `{${DISPLAY_NONE_STYLES}}`

	categoryStyleElement.textContent = categoryRuleWithStyling
}
