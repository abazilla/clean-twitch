import { storageHandler } from "../utils/storageHandler"
import { BlockedChannels } from "./definitions"
import { DISPLAY_NONE_STYLES } from "./domManipulators"

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

	// Update global CSS rules for all blocked channels
	const channelRules = usernames
		.filter((u) => u.enabled && enabled)
		.flatMap((u) => [
			...(hideFromSearch
				? [
						`#search-tray__container a[href="/${u.username}"]`,
						`a[data-tray-item="true"][href="/${u.username}"]`,
						`a[data-a-target="search-result-live-channel"][href="/${u.username}"]`,
						`div[data-a-target="search-results-live-channel"]:has(a[href="/${u.username}"])`,
						`div.search-result-offline_channel--body:has(a[href="/${u.username}"]) .search-result`,
						`a[href="/${u.username}"][data-a-target="search-result-live-channel"] ~ .search-result`,
					]
				: []),
			...(hideFromSidebar ? [`div.side-nav-card:has(a[href="/${u.username}"])`] : []),
			...(hideFromDirectory
				? [
						`a[href="/${u.username}"][data-a-target="preview-card-image-link"] ~ div.shelf-card__impression-wrapper`,
						`a[data-a-target="preview-card-image-link"][href="/${u.username}"] ~ div[data-target="directory-game__card_container"]`,
						`a[href="/${u.username}"] ~ .recommended-channel`,
						`a[href="/${u.username}"][data-test-selector="recommended-channel"] ~ div.recommended-channel`,
						`div.tw-col:has(a[href="/${u.username}"])`,
					]
				: []),
		])
		.join(",")

	const channelRuleWithStyling =
		channelRules.length === 0 ? "" : channelRules + `{${DISPLAY_NONE_STYLES}}`

	const globalRules = styleElement.textContent?.split("/* Channel Rules */")[0] || ""
	const categoryRules = styleElement.textContent?.split("/* Category Rules */")[1] || ""

	styleElement.textContent = `${globalRules.trim()}\n/* Channel Rules */${channelRuleWithStyling.trim()}\n/* Category Rules */${categoryRules.trim()}`
}
