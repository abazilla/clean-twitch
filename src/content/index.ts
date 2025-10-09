import $ from "jquery"
import { FeatureId, features } from "../pages/popup/types"
import { handleBlockedCategories, initializeBlockedCategories } from "./features/blockedCategories"
import { handleBlockedChannels, initializeBlockedChannels } from "./features/blockedChannels"
import {
	hideBrowseButton,
	hideDotsButton,
	hideFollowingButton,
	hideNotificationsButton,
	hidePrimeGamingButton,
	hideTopBitsButton,
	hideTopTurboButton,
	hideWhispersButton,
	toggleChatHighlights,
	toggleFeaturedStreamPlayByDefault,
	toggleGreyscale,
	toggleLeftSidebar,
	toggleLeftSidebarFollowedChannels,
	toggleLeftSidebarLiveChannels,
	toggleLeftSidebarOfflineChannels,
	toggleLeftSidebarRecommendedCategories,
	toggleLeftSidebarStories,
	toggleLeftSidebarViewersAlsoWatch,
	toggleStickyFooter,
} from "./features/uiFeatures"
import { setupUrlChangeListener } from "./observers/urlObserver"

// Initialize global styles
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

// Initialize feature handlers
initializeBlockedChannels(style)
initializeBlockedCategories(style)

// Main initialization
$(function () {
	// Initial setup
	features.forEach((f) => {
		chrome.storage.sync.get(f.id).then((result) => {
			// console.log("parent", f.id)
			handleToggle(f.id, true, result[f.id])
		})
		if (f.children.length > 0) {
			f.children.forEach((cf) => {
				chrome.storage.sync.get(cf.id).then((result) => {
					// console.log("child", cf.id)
					handleToggle(cf.id, true, result[cf.id])
				})
			})
		}
	})

	// Watch for URL changes
	setupUrlChangeListener()

	// Listen for changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "sync") {
			const key = Object.keys(changes)[0] as FeatureId
			handleToggle(key, false, changes[key].newValue)
		}
	})
})

function handleToggle(id: FeatureId, onLoad: boolean, value: any) {
	switch (id) {
		case "greyscale_all":
			toggleGreyscale(value)
			break
		// case "hide_topbar":
		// 	break
		case "hide_topbar_following_button":
			hideFollowingButton(value)
			break
		case "hide_topbar_browse_button":
			hideBrowseButton(value)
			break
		case "hide_topbar_dots_button":
			hideDotsButton(value)
			break
		case "hide_prime_gaming_button":
			hidePrimeGamingButton(value)
			break
		case "hide_notifications_button":
			hideNotificationsButton(value)
			break
		case "hide_whispers_button":
			hideWhispersButton(value)
			break
		case "hide_top_bits_button":
			hideTopBitsButton(value)
			break
		case "hide_top_turbo_button":
			hideTopTurboButton(value)
			break
		case "hide_left_sidebar":
			toggleLeftSidebar(value)
			break
		case "hide_left_sidebar_stories":
			toggleLeftSidebarStories(value)
			break
		case "hide_left_sidebar_followed_channels":
			toggleLeftSidebarFollowedChannels(value)
			break
		case "hide_left_sidebar_offline_channels":
			toggleLeftSidebarOfflineChannels(value)
			break
		case "hide_left_sidebar_live_channels":
			toggleLeftSidebarLiveChannels(value)
			break
		case "hide_left_sidebar_viewers_also_watch":
			toggleLeftSidebarViewersAlsoWatch(value)
			break
		case "hide_left_sidebar_recommended_categories":
			toggleLeftSidebarRecommendedCategories(value)
			break
		case "hide_chat_highlights":
			toggleChatHighlights(value)
			break
		case "hide_sticky_footer":
			toggleStickyFooter(value)
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
		case "featured_stream_play_by_default":
			toggleFeaturedStreamPlayByDefault(value)
			break
		default:
			return
	}
}
