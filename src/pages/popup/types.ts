export interface FeatureItem {
	id: string
	label: string
	conflicts: readonly string[]
	children?: readonly FeatureItem[]
	hidden?: boolean
	hideToggle?: boolean
}

export type FeatureId =
	| FeatureItem["id"]
	| (FeatureItem["children"] extends readonly FeatureItem[]
			? FeatureItem["children"][number]["id"]
			: never)

// todo convert FeatureItem to type of features?
export const features = [
	{
		id: "block_gql",
		label: "Block GQL Requests",
		conflicts: [],
		children: [],
	},
	{
		id: "greyscale_all",
		label: "Grayscale Site",
		conflicts: [],
		children: [],
	},
	{
		id: "hide_left_sidebar",
		label: "Hide left sidebar",
		conflicts: [],
		children: [
			{
				id: "hide_left_sidebar_stories",
				label: 'Hide "Stories"',
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
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_live_channels",
				label: 'Hide "Live Channels"',
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_viewers_also_watch",
				label: 'Hide "Viewers Also Watch"',
				conflicts: [],
			},
			{
				id: "hide_left_sidebar_recommended_categories",
				label: 'Hide "Recommended Categories"',
				conflicts: [],
			},
		],
	},
	{
		id: "no_chat",
		label: "Hide Chat",
		conflicts: ["chat_only"],
		children: [],
	},
	{
		id: "chat_only",
		label: "Chat Only Mode",
		conflicts: ["no_chat"],
		children: [
			{
				id: "chat_minimal",
				label: "Minimal Chat",
				conflicts: [],
			},
			{
				id: "hide_chat_highlights",
				label: "Hide Chat Highlights (predictions, pinned messages, etc)",
				conflicts: [],
			},
			// {
			// 	id: "hide_chat_community_highlight",
			// 	label: "Hide chat Community Highlights (Predictions etc.)",
			// 	conflicts: [],
			// },
		],
	},
	// {
	// 	id: "no_recommendations",
	// 	label: 'Hide "Recommendations"',
	// 	conflicts: [],
	// 	children: [],
	// },
	{
		id: "hide_topbar",
		label: "Hide Top Bar",
		hideToggle: true,
		conflicts: [],
		children: [
			{
				id: "hide_topbar_following_button",
				label: 'Hide "Following" Button',
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
				conflicts: [],
			},
			{
				id: "hide_prime_gaming_button",
				label: 'Hide "Prime Gaming" Button',
				conflicts: [],
				children: [],
			},
			{
				id: "hide_notifications_button",
				label: 'Hide "Notifications" Button',
				conflicts: [],
				children: [],
			},
			{
				id: "hide_whispers_button",
				label: 'Hide "Whispers" Button',
				conflicts: [],
				children: [],
			},
			{
				id: "hide_top_bits_button",
				label: 'Hide "Bits" Button',
				conflicts: [],
				children: [],
			},
			{
				id: "hide_top_turbo_button",
				label: 'Hide "Turbo" Button',
				conflicts: [],
				children: [],
			},
		],
	},
	{
		id: "hide_sticky_footer",
		label: "Remove Purple Footer",
		conflicts: [],
		children: [],
	},
	{
		id: "featured_stream_play_by_default",
		label: "Prevent Homepage Stream from Auto-Playing",
		conflicts: [],
		children: [],
	},
	{
		id: "blocked_channels",
		label: "Channel Blocking",
		conflicts: [],
		children: [],
		hidden: true,
	},
	{
		id: "blocked_categories",
		label: "Category Blocking",
		conflicts: [],
		children: [],
		hidden: true,
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
