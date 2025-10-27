// This file contains all feature definitions without toggle functions
export type SimplePresetMode = "show_all" | "no_monetization" | "minimalist"

export interface FeatureItem {
	id: string
	label: string
	conflicts: readonly string[]
	children?: readonly FeatureItem[]
	hideToggle?: boolean
	renderSimpleOrAdvanced?: "always_show" | "always_hide" | "advanced_only"
	simpleModeActive?: readonly SimplePresetMode[]
}

export type FeatureId = string

// Feature definitions without toggle functions - lightweight for popup imports
export const features = [
	{
		id: "test_mode",
		label: "Test Mode (for debugging)",
		conflicts: [],
		children: [],
		hidden: "always_show",
	},
	{
		id: "greyscale_all",
		label: "Grayscale Site",
		conflicts: [],
		children: [],
		hidden: "always_show",
	},
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
			},
			{
				id: "hide_topbar_browse_button",
				label: 'Hide "Browse" Button',
				conflicts: [],
			},
			{
				id: "hide_topbar_dots_button",
				label: 'Hide "Dots" Button',
				mode: ["minimalist"],
				conflicts: [],
			},
			{
				id: "hide_prime_gaming_button",
				label: 'Hide "Prime Gaming" Button',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_notifications_button",
				label: 'Hide "Notifications" Button',
				conflicts: [],
				mode: ["minimalist"],
				children: [],
			},
			{
				id: "hide_whispers_button",
				label: 'Hide "Whispers" Button',
				conflicts: [],
				mode: ["minimalist"],
				children: [],
			},
			{
				id: "hide_top_bits_button",
				label: 'Hide "Bits" Button',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_top_turbo_button",
				label: 'Hide "Turbo" Button',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
		],
	},
	{
		id: "hide_left_sidebar",
		label: "Left sidebar",
		conflicts: [],
		mode: [],
		children: [
			{
				id: "hide_left_sidebar_stories",
				label: 'Hide "Stories"',
				mode: ["minimalist"],
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_followed_channels",
				label: 'Hide "Followed Channels"',
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_offline_channels",
				label: 'Hide "Offline Channels"',
				mode: ["minimalist"],
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_live_channels",
				label: 'Hide "Live Channels"',
				mode: ["minimalist"],
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_viewers_also_watch",
				label: 'Hide "Viewers Also Watch"',
				mode: ["minimalist"],
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_recommended_categories",
				label: 'Hide "Recommended Categories"',
				mode: ["minimalist"],
				conflicts: [],
			},
			{
				id: "left_sidebar_always_show_more",
				label: 'Automatically "Show More"',
				mode: ["minimalist"],
				conflicts: [],
			},
		],
	},
	{
		id: "no_chat_section",
		label: "Chat",
		conflicts: [],
		hideToggle: true,
		children: [
			// {
			// 	id: "no_chat",
			// 	label: "Hide Chat",
			// 	conflicts: ["chat_only"],
			// 	children: [],
			// },
			{
				id: "hide_chat_monetization",
				label: "Hide Chat Monetization",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_top_gifters",
				label: "Hide Top Gifters",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
			},
			{
				id: "hide_chat_highlights",
				label: "Hide Chat Highlights",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
			},
		],
	},
	{
		id: "hide_video_section",
		label: "Video Section",
		hideToggle: true,
		conflicts: [],
		children: [
			{
				id: "featured_stream_play_by_default",
				label: "Prevent Homepage Stream from Auto-Playing",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_video_gift_section",
				label: 'Hide Theatre Mode "Gift"/"Subscribe" Buttons',
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_video_ad_wrapper",
				label: "Hide Ad Wrapper around video player",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
		],
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
			},
			{
				id: "hide_info_viral_clip_section",
				label: "Hide Viral Clip Section",
				conflicts: [],
				mode: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_info_about_section",
				label: "Hide About Section",
				conflicts: [],
				mode: ["minimalist"],
				children: [],
			},
			{
				id: "hide_info_channel_panel_section",
				label: "Hide Channel Panel Section",
				conflicts: [],
				mode: ["minimalist"],
				children: [],
			},
			{
				id: "hide_sticky_footer",
				label: "Remove Purple Footer",
				conflicts: [],
				mode: ["minimalist"],
				children: [],
			},
		],
	},
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
			if (item.simpleModeActive?.includes(mode)) {
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
		description: "Show everything",
	},
	no_monetization: {
		label: "No Monetization",
		description: "Keep your money",
	},
	minimalist: {
		label: "Minimalist",
		description: "No distractions",
	},
})
