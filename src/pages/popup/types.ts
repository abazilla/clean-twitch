export interface FeatureItem {
	id: string
	label: string
	conflicts: string[]
	children?: FeatureItem[]
}

export const features: FeatureItem[] = [
	{
		id: "block_gql",
		label: "Block GQL Requests",
		conflicts: [],
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
		],
	},
	{
		id: "no_chat",
		label: "Hide Chat",
		conflicts: ["chat_only"],
	},
	{
		id: "no_recommendations",
		label: "Hide Recommendations",
		conflicts: [],
	},
	{
		id: "prime_gaming_button",
		label: "Hide Prime Gaming Button",
		conflicts: [],
	},
]
