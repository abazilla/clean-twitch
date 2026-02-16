import { BLOCKED_CHANNELS_STYLE_ID, DISPLAY_NONE_STYLES } from "../utils/cssManipulators"
import { storageHandler } from "../utils/storageHandler"
import { BlockedChannels } from "./definitions"

let channelStyleElement: HTMLStyleElement

const DEFAULT_BLOCKED_CHANNELS: BlockedChannels = {
	enabled: true,
	hideFromSidebar: true,
	hideFromDirectory: true,
	hideFromSearch: true,
	usernames: [],
}

export async function initializeBlockedChannels() {
	// Create dedicated style element for blocked channels
	channelStyleElement = document.createElement("style")
	channelStyleElement.id = BLOCKED_CHANNELS_STYLE_ID
	document.head.appendChild(channelStyleElement)

	// Load and apply initial blocked channels, merging with defaults for missing fields
	const stored = (await storageHandler.get("blocked_channels")) as Partial<BlockedChannels> | undefined
	const blockedChannels: BlockedChannels = {
		enabled: stored?.enabled ?? DEFAULT_BLOCKED_CHANNELS.enabled,
		hideFromSidebar: stored?.hideFromSidebar ?? DEFAULT_BLOCKED_CHANNELS.hideFromSidebar,
		hideFromDirectory: stored?.hideFromDirectory ?? DEFAULT_BLOCKED_CHANNELS.hideFromDirectory,
		hideFromSearch: stored?.hideFromSearch ?? DEFAULT_BLOCKED_CHANNELS.hideFromSearch,
		usernames: stored?.usernames ?? DEFAULT_BLOCKED_CHANNELS.usernames,
	}

	// Save back if we had to fill in any defaults
	if (!stored || Object.keys(DEFAULT_BLOCKED_CHANNELS).some((key) => stored[key as keyof BlockedChannels] === undefined)) {
		await storageHandler.set("blocked_channels", blockedChannels)
	}

	handleBlockedChannels(blockedChannels)
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
						`div[data-a-target="search-result-live-channel"]:has(a[href="/${u.username}"])`,
						`div[data-a-target="search-result-video"]:has(a[href*="/${u.username}/"])`,
					]
				: []),
			...(hideFromSidebar ? [`div.side-nav-card:has(a[href="/${u.username}"])`] : []),
			...(hideFromDirectory
				? [
						`div[data-target="directory-first-item"]:has(a[href="/${u.username}"])`,
						`div[data-target=""]:has(a[href="/${u.username}"])`,
						`a[href="/${u.username}"][data-a-target="preview-card-image-link"] ~ div.shelf-card__impression-wrapper`,
						`a[data-a-target="preview-card-image-link"][href="/${u.username}"] ~ div[data-target="directory-game__card_container"]`,
						`a[href="/${u.username}"] ~ .recommended-channel`,
						`a[href="/${u.username}"][data-test-selector="recommended-channel"] ~ div.recommended-channel`,
						`div.tw-col:has(a[href="/${u.username}"])`,
						`div.tw-transition:has(> .shelf-card__impression-wrapper):has(a[href="/${u.username}"])`,
					]
				: []),
		])
		.join(",")

	const channelRuleWithStyling =
		channelRules.length === 0 ? "" : channelRules + `{${DISPLAY_NONE_STYLES}}`

	channelStyleElement.textContent = channelRuleWithStyling
}
