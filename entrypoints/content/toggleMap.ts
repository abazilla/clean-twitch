// Map of feature IDs to their toggle functions
import {
	hideBrowseButton,
	hideDotsButton,
	hideFollowingButton,
	hideNotificationsButton,
	hidePrimeGamingButton,
	hideTopBitsButton,
	hideTopTurboButton,
	hideWhispersButton,
	toggleBelowVideoAdSection,
	toggleChatMonetizationButtons,
	toggleCommunityHighlightStack,
	toggleFeaturedStreamPlayByDefault,
	toggleInfoAboutSection,
	toggleInfoChannelPanelSection,
	toggleInfoMonetizationButtons,
	toggleInfoViralClipSection,
	toggleLeftSidebar,
	toggleLeftSidebarAlwaysShowMore,
	toggleLeftSidebarFollowedChannels,
	toggleLeftSidebarLiveChannels,
	toggleLeftSidebarOfflineChannels,
	toggleLeftSidebarRecommendedCategories,
	toggleLeftSidebarStories,
	toggleLeftSidebarStoriesXS,
	toggleLeftSidebarViewersAlsoWatch,
	toggleStickyFooter,
	toggleTopGifters,
	toggleVideoAdWrapper,
	toggleVideoGiftButtonSection,
} from "./features/uiFeatures"

export const toggleMap: Record<string, (enabled: boolean) => void> = {
	hide_topbar_following_button: (value: boolean) => hideFollowingButton(value),
	hide_topbar_browse_button: (value: boolean) => hideBrowseButton(value),
	hide_topbar_dots_button: (value: boolean) => hideDotsButton(value),
	hide_prime_gaming_button: (value: boolean) => hidePrimeGamingButton(value),
	hide_notifications_button: (value: boolean) => hideNotificationsButton(value),
	hide_whispers_button: (value: boolean) => hideWhispersButton(value),
	hide_top_bits_button: (value: boolean) => hideTopBitsButton(value),
	hide_top_turbo_button: (value: boolean) => hideTopTurboButton(value),
	hide_left_sidebar: (value: boolean) => toggleLeftSidebar(value),
	hide_left_sidebar_stories: (value: boolean) => {
		toggleLeftSidebarStories(value)
		toggleLeftSidebarStoriesXS(value)
	},
	hide_left_sidebar_followed_channels: (value: boolean) => toggleLeftSidebarFollowedChannels(value),
	hide_left_sidebar_offline_channels: (value: boolean) => toggleLeftSidebarOfflineChannels(value),
	hide_left_sidebar_live_channels: (value: boolean) => toggleLeftSidebarLiveChannels(value),
	hide_left_sidebar_viewers_also_watch: (value: boolean) =>
		toggleLeftSidebarViewersAlsoWatch(value),
	hide_left_sidebar_recommended_categories: (value: boolean) =>
		toggleLeftSidebarRecommendedCategories(value),
	left_sidebar_always_show_more: (value: boolean) => toggleLeftSidebarAlwaysShowMore(value),
	hide_chat_monetization: (value: boolean) => toggleChatMonetizationButtons(value),
	hide_top_gifters: (value: boolean) => toggleTopGifters(value),
	hide_chat_highlights: (value: boolean) => toggleCommunityHighlightStack(value),
	featured_stream_play_by_default: (value: boolean) => toggleFeaturedStreamPlayByDefault(value),
	hide_video_gift_section: (value: boolean) => toggleVideoGiftButtonSection(value),
	hide_video_ad_wrapper: (value: boolean) => {
		toggleVideoAdWrapper(value)
		toggleBelowVideoAdSection(value)
	},
	hide_info_monetization_buttons: (value: boolean) => toggleInfoMonetizationButtons(value),
	hide_info_viral_clip_section: (value: boolean) => toggleInfoViralClipSection(value),
	hide_info_about_section: (value: boolean) => toggleInfoAboutSection(value),
	hide_info_channel_panel_section: (value: boolean) => toggleInfoChannelPanelSection(value),
	hide_sticky_footer: (value: boolean) => toggleStickyFooter(value),
}
