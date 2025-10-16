// This file contains all feature definitions and their toggle functions
// Import the actual toggle functions from uiFeatures
import {
	hideBrowseButton,
	hideDotsButton,
	hideFollowingButton,
	hideNotificationsButton,
	hidePrimeGamingButton,
	hideTopBitsButton,
	hideTopTurboButton,
	hideWhispersButton,
	toggleChatMonetizationButtons,
	toggleCommunityHighlightStack,
	toggleFeaturedStreamPlayByDefault,
	toggleGreyscale,
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
} from "./features/uiFeatures"

export type SimplePresetMode = "show_all" | "no_monetization" | "minimalist"

export interface FeatureItem {
	id: string
	label: string
	conflicts: readonly string[]
	children?: readonly FeatureItem[]
	hidden?: boolean
	hideToggle?: boolean
	mode?: readonly SimplePresetMode[]
	on_toggle?: (enabled: boolean) => void
}

export type FeatureId = string

// todo convert FeatureItem to type of features?
export const features = [
	// {
	// 	id: "block_gql",
	// 	label: "Block GQL Requests",
	// 	conflicts: [],
	// 	children: [],
	// },
	{
		id: "greyscale_all",
		label: "Grayscale Site",
		conflicts: [],
		children: [],
		on_toggle: (value: boolean) => toggleGreyscale(value)
	},
	{
		id: "hide_left_sidebar",
		label: "Hide left sidebar",
		conflicts: [],
		mode: [],
		on_toggle: (value: boolean) => toggleLeftSidebar(value),
		children: [
			{
				id: "hide_left_sidebar_stories",
				label: 'Hide "Stories"',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => {
					toggleLeftSidebarStories(value)
					toggleLeftSidebarStoriesXS(value)
				}
			},
			{
				id: "hide_left_sidebar_followed_channels",
				label: 'Hide "Followed Channels"',
				conflicts: [],
				on_toggle: (value: boolean) => toggleLeftSidebarFollowedChannels(value)
			},
			{
				id: "hide_left_sidebar_offline_channels",
				label: 'Hide "Offline Channels"',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => toggleLeftSidebarOfflineChannels(value)
			},
			{
				id: "hide_left_sidebar_live_channels",
				label: 'Hide "Live Channels"',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => toggleLeftSidebarLiveChannels(value)
			},
			{
				id: "hide_left_sidebar_viewers_also_watch",
				label: 'Hide "Viewers Also Watch"',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => toggleLeftSidebarViewersAlsoWatch(value)
			},
			{
				id: "hide_left_sidebar_recommended_categories",
				label: 'Hide "Recommended Categories"',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => toggleLeftSidebarRecommendedCategories(value)
			},
			{
				id: "left_sidebar_always_show_more",
				label: 'Automatically "Show More"',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => toggleLeftSidebarAlwaysShowMore(value)
			},
		],
	},
	{
		id: "no_chat_section",
		label: "Chat Section",
		conflicts: [],
		hideToggle: true,
		children: [
			{
				id: "hide_chat_monetization",
				label: "Hide Chat Monetization",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
				on_toggle: (value: boolean) => toggleChatMonetizationButtons(value)
			},
			{
				id: "hide_top_gifters",
				label: "Hide Top Gifters",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				on_toggle: (value: boolean) => toggleTopGifters(value)
			},
			{
				id: "hide_chat_highlights",
				label: "Hide Chat Highlights",
				conflicts: [],
				mode: ["minimalist"],
				on_toggle: (value: boolean) => toggleCommunityHighlightStack(value)
			},
		],
	},
	{
		id: "no_chat",
		label: "Hide Chat",
		conflicts: ["chat_only"],
		children: [],
	},
	// {
	// 	id: "chat_only",
	// 	label: "Chat Only Mode",
	// 	conflicts: ["no_chat"],
	// 	children: [
	// 		{
	// 			id: "chat_minimal",
	// 			label: "Minimal Chat",
	// 			conflicts: [],
	// 		},
	// 		{
	// 			id: "hide_chat_highlights",
	// 			label: "Hide Chat Highlights (predictions, pinned messages, etc)",
	// 			conflicts: [],
	// 		},
	// 		// {
	// 		// 	id: "hide_chat_community_highlight",
	// 		// 	label: "Hide chat Community Highlights (Predictions etc.)",
	// 		// 	conflicts: [],
	// 		// },
	// 	],
	// },
	// {
	// 	id: "no_recommendations",
	// 	label: 'Hide "Recommendations"',
	// 	conflicts: [],
	// 	children: [],
	// },
	{
		id: "hide_topbar",
		label: "Top Bar Section",
		hideToggle: true,
		conflicts: [],
		children: [
			{
				id: "hide_topbar_following_button",
				label: 'Hide "Following" Button',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => hideFollowingButton(value)
			},
			{
				id: "hide_topbar_browse_button",
				label: 'Hide "Browse" Button',
				conflicts: [],
				on_toggle: (value: boolean) => hideBrowseButton(value)
			},
			{
				id: "hide_topbar_dots_button",
				label: 'Hide "Dots" Button',
				mode: ["minimalist"],
				conflicts: [],
				on_toggle: (value: boolean) => hideDotsButton(value)
			},
			{
				id: "hide_prime_gaming_button",
				label: 'Hide "Prime Gaming" Button',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
				on_toggle: (value: boolean) => hidePrimeGamingButton(value)
			},
			{
				id: "hide_notifications_button",
				label: 'Hide "Notifications" Button',
				conflicts: [],
				mode: ["minimalist"],
				children: [],
				on_toggle: (value: boolean) => hideNotificationsButton(value)
			},
			{
				id: "hide_whispers_button",
				label: 'Hide "Whispers" Button',
				conflicts: [],
				mode: ["minimalist"],
				children: [],
				on_toggle: (value: boolean) => hideWhispersButton(value)
			},
			{
				id: "hide_top_bits_button",
				label: 'Hide "Bits" Button',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
				on_toggle: (value: boolean) => hideTopBitsButton(value)
			},
			{
				id: "hide_top_turbo_button",
				label: 'Hide "Turbo" Button',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
				on_toggle: (value: boolean) => hideTopTurboButton(value)
			},
		],
	},
	{
		id: "hide_sticky_footer",
		label: "Remove Purple Footer",
		conflicts: [],
		mode: ["minimalist"],
		children: [],
		on_toggle: (value: boolean) => toggleStickyFooter(value)
	},
	{
		id: "hide_info",
		label: "Below Video Section",
		hideToggle: true,
		conflicts: [],
		children: [
			{
				id: "hide_info_monetization_buttons",
				label: "Hide Monetization Buttons",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
				on_toggle: (value: boolean) => toggleInfoMonetizationButtons(value)
			},
			{
				id: "hide_info_viral_clip_section",
				label: "Hide Viral Clip Section",
				conflicts: [],
				mode: ["minimalist"],
				children: [],
				on_toggle: (value: boolean) => toggleInfoViralClipSection(value)
			},
			{
				id: "hide_info_about_section",
				label: "Hide About Section",
				conflicts: [],
				mode: ["minimalist"],
				children: [],
				on_toggle: (value: boolean) => toggleInfoAboutSection(value)
			},
			{
				id: "hide_info_channel_panel_section",
				label: "Hide Channel Panel Section",
				conflicts: [],
				mode: ["minimalist"],
				children: [],
				on_toggle: (value: boolean) => toggleInfoChannelPanelSection(value)
			},
		],
	},
	{
		id: "featured_stream_play_by_default",
		label: "Prevent Homepage Stream from Auto-Playing",
		conflicts: [],
		mode: ["no_monetization", "minimalist"],
		children: [],
		on_toggle: (value: boolean) => toggleFeaturedStreamPlayByDefault(value)
	},
	// {
	// 	id: "blocked_channels",
	// 	label: "Channel Blocking",
	// 	conflicts: [],
	// 	children: [],
	// 	hidden: true,
	// },
	// {
	// 	id: "blocked_categories",
	// 	label: "Category Blocking",
	// 	conflicts: [],
	// 	children: [],
	// 	hidden: true,
	// },
] as const

export interface BlockedUsername {
	username: string
	enabled: boolean
}

export interface BlockedChannels {
	enabled: boolean
	hideFromSidebar: boolean
	hideFromDirectory: boolean
	hideFromSearch: boolean
	usernames: BlockedUsername[]
}

export interface BlockedCategory {
	category: string // The URL-friendly version
	name: string // The original user input
	enabled: boolean
}

export interface BlockedCategories {
	enabled: boolean
	hideFromSidebar: boolean
	hideFromDirectory: boolean
	hideFromSearch: boolean
	categories: BlockedCategory[]
}

export const getFeaturesForMode = (mode: SimplePresetMode): string[] => {
	const featureIds: string[] = []

	const collectFeatures = (items: readonly FeatureItem[]) => {
		for (const item of items) {
			if (item.mode?.includes(mode)) {
				featureIds.push(item.id)
			}
			if (item.children) {
				collectFeatures(item.children)
			}
		}
	}

	collectFeatures(features)
	return featureIds
}

export const getPresetLabels = () => ({
	show_all: {
		label: "Show All",
		description: "Show everything (default)",
	},
	no_monetization: {
		label: "No Monetization",
		description: "Hide ads, bits, subs, donations",
	},
	minimalist: {
		label: "Minimalist",
		description: "Clean, distraction-free viewing",
	},
})
