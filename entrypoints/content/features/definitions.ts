// This file contains all feature definitions without toggle functions
export type SimplePresetMode = "show_all" | "no_monetization" | "minimalist"

export enum TwitchURLs {
	Home = "/",
	DirectoryFollowing = "/directory/following",
	DirectoryFollowingLive = "/directory/following/live",
	DirectoryFollowingGames = "/directory/following/games",
	Directory = "/directory",
	DirectoryAll = "/directory/all",
	DirectoryCategory = "/directory/category/",
	DirectoryGaming = "/directory/gaming",
	Search = "/search",
	Channel = "/channel",
	Videos = "/videos",
	Clips = "/clips",
	// About = "/about",
	Squad = "/squad",
	Collections = "/collections",
	Schedule = "/schedule",
	Settings = "/settings",
}

export interface FeatureItem {
	id: string
	label: string
	conflicts?: readonly string[]
	children?: readonly FeatureItem[]
	hideToggleButton?: boolean
	renderSimpleOrAdvanced?: "always_show" | "always_hide" | "advanced_only"
	simpleModeActive?: readonly SimplePresetMode[]
	// TODO: temporary fix to prevent recursion bug
	// TS is enforcing FeatureID being a union of all IDs
	// Certain features e.g. simple_mode_preset and is_simple_mode
	// trigger other toggles, but will currently recurse unless
	// it's specfically ignored.
	// Ideally, we separate these special feature toggles
	ignoreToggle?: boolean
}

// Feature definitions without toggle functions - lightweight for popup imports
export const features = [
	{
		id: "test_mode",
		label: "Test Mode",
		renderSimpleOrAdvanced: "always_show",
	},
	{
		id: "greyscale_all",
		label: "Grayscale Site",
		renderSimpleOrAdvanced: "always_show",
	},
	{
		id: "blocked_categories",
		label: "Blocked Categories",
		renderSimpleOrAdvanced: "always_hide",
		ignoreToggle: true,
	},
	{
		id: "blocked_channels",
		label: "Blocked Channels",
		renderSimpleOrAdvanced: "always_hide",
		ignoreToggle: true,
	},
	{
		id: "simple_mode_preset",
		label: "Simple Mode Preset",
		renderSimpleOrAdvanced: "always_hide",
		ignoreToggle: true,
	},
	{
		id: "is_simple_mode",
		label: "Simple or Advanced Mode",
		renderSimpleOrAdvanced: "always_hide",
		ignoreToggle: true,
	},
	{
		id: "hide_topbar",
		label: "Top Bar Section",
		hideToggleButton: true,
		children: [
			{
				id: "hide_topbar_following_button",
				label: 'Hide "Following" Button',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "hide_topbar_browse_button",
				label: 'Hide "Browse" Button',
			},
			{
				id: "hide_topbar_dots_button",
				label: 'Hide "Dots" Button',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "hide_prime_gaming_button",
				label: 'Hide "Prime Gaming" Button',
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_notifications_button",
				label: 'Hide "Notifications" Button',

				simpleModeActive: ["minimalist"],
				children: [],
			},
			{
				id: "hide_whispers_button",
				label: 'Hide "Whispers" Button',
				simpleModeActive: ["minimalist"],
				children: [],
			},
			{
				id: "hide_top_bits_button",
				label: 'Hide "Bits" Button',
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_top_turbo_button",
				label: 'Hide "Turbo" Button',
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
		],
	},
	{
		id: "hide_left_sidebar",
		label: "Left sidebar",

		simpleModeActive: [],
		children: [
			{
				id: "hide_left_sidebar_stories",
				label: 'Hide "Stories"',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "hide_left_sidebar_followed_channels",
				label: 'Hide "Followed Channels"',
			},
			{
				id: "hide_left_sidebar_offline_channels",
				label: 'Hide "Offline Channels"',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "hide_left_sidebar_live_channels",
				label: 'Hide "Live Channels"',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "hide_left_sidebar_viewers_also_watch",
				label: 'Hide "Viewers Also Watch"',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "hide_left_sidebar_recommended_categories",
				label: 'Hide "Recommended Categories"',
				simpleModeActive: ["minimalist"],
			},
			{
				id: "left_sidebar_always_show_more",
				label: 'Automatically "Show More"',
				simpleModeActive: ["minimalist"],
			},
		],
	},
	{
		id: "no_chat_section",
		label: "Chat",
		hideToggleButton: true,
		children: [
			{
				id: "no_chat",
				label: "Hide Chat",
				conflicts: ["chat_only"],
				ignoreToggle: true,
				children: [],
			},
			{
				id: "hide_chat_monetization",
				label: "Hide Chat Monetization",
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_top_gifters",
				label: "Hide Top Gifters",
				simpleModeActive: ["no_monetization", "minimalist"],
			},
			{
				id: "hide_chat_highlights",
				label: "Hide Chat Highlights",
				simpleModeActive: ["no_monetization", "minimalist"],
			},
		],
	},
	{
		id: "hide_video_section",
		label: "Video Section",
		hideToggleButton: true,
		children: [
			{
				id: "featured_stream_play_by_default",
				label: "Prevent Homepage Stream from Auto-Playing",
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_video_gift_section",
				label: 'Hide Theatre Mode "Gift"/"Subscribe" Buttons',
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_video_ad_wrapper",
				label: "Hide Ad Wrapper around video player",
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
		],
	},
	{
		id: "hide_info",
		label: "Below Video Section",
		hideToggleButton: true,
		children: [
			{
				id: "hide_info_monetization_buttons",
				label: "Hide Monetization Buttons",
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_info_viral_clip_section",
				label: "Hide Viral Clip Section",
				simpleModeActive: ["no_monetization", "minimalist"],
				children: [],
			},
			{
				id: "hide_info_about_section",
				label: "Hide About Section",
				simpleModeActive: ["minimalist"],
				children: [],
			},
			{
				id: "hide_info_channel_panel_section",
				label: "Hide Channel Panel Section",
				simpleModeActive: ["minimalist"],
				children: [],
			},
			{
				id: "hide_sticky_footer",
				label: "Remove Purple Footer",
				simpleModeActive: ["minimalist"],
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

export const getFeaturesForMode = (mode: SimplePresetMode): FeatureID[] => {
	const collectFeatures = (items: readonly FeatureItem[]): FeatureID[] =>
		items.flatMap((item) => [
			...(item.simpleModeActive?.includes(mode) ? [item.id] : []),
			...(item.children ? collectFeatures(item.children) : []),
		]) as FeatureID[]

	return collectFeatures(features)
}

const collectToggleableFeatureIDs = (items: readonly FeatureItem[]): FeatureID[] =>
	items
		.filter(({ ignoreToggle }) => !ignoreToggle)
		.flatMap((item) => [
			item.id,
			...(item.children ? collectToggleableFeatureIDs(item.children) : []),
		]) as FeatureID[]

export const toggleableFeatureIDs = collectToggleableFeatureIDs(features)

type ExtractFeatureIDs<T extends readonly FeatureItem[]> = T extends readonly (infer U)[]
	? U extends { id: infer ID; children?: infer C }
		? ID | (C extends readonly FeatureItem[] ? ExtractFeatureIDs<C> : never)
		: never
	: never

export type FeatureID = ExtractFeatureIDs<typeof features>

// export type FeatureID = string
