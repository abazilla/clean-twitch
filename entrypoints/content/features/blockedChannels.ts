import { BLOCKED_CHANNELS_STYLE_ID, DISPLAY_NONE_STYLES } from "../dom/cssManager"
import { storageHandler } from "../storage/handler"
import { BlockedChannels } from "./definitions"
import {
	blockedChannelDirectorySelectors,
	blockedChannelSearchSelectors,
	blockedChannelSidebarSelectors,
} from "./selectors"

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
	const stored = (await storageHandler.get("blocked_channels")) as
		| Partial<BlockedChannels>
		| undefined
	const blockedChannels: BlockedChannels = {
		enabled: stored?.enabled ?? DEFAULT_BLOCKED_CHANNELS.enabled,
		hideFromSidebar: stored?.hideFromSidebar ?? DEFAULT_BLOCKED_CHANNELS.hideFromSidebar,
		hideFromDirectory: stored?.hideFromDirectory ?? DEFAULT_BLOCKED_CHANNELS.hideFromDirectory,
		hideFromSearch: stored?.hideFromSearch ?? DEFAULT_BLOCKED_CHANNELS.hideFromSearch,
		usernames: stored?.usernames ?? DEFAULT_BLOCKED_CHANNELS.usernames,
	}

	// Save back if we had to fill in any defaults
	if (
		!stored ||
		Object.keys(DEFAULT_BLOCKED_CHANNELS).some(
			(key) => stored[key as keyof BlockedChannels] === undefined
		)
	) {
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
			...(hideFromSearch ? blockedChannelSearchSelectors(u.username) : []),
			...(hideFromSidebar ? blockedChannelSidebarSelectors(u.username) : []),
			...(hideFromDirectory ? blockedChannelDirectorySelectors(u.username) : []),
		])
		.join(",")

	const channelRuleWithStyling =
		channelRules.length === 0 ? "" : channelRules + `{${DISPLAY_NONE_STYLES}}`

	channelStyleElement.textContent = channelRuleWithStyling
}
