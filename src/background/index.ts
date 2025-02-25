/// <reference types="chrome"/>

const dnr = chrome.declarativeNetRequest

interface RuleWithFlag {
	rule: chrome.declarativeNetRequest.Rule
	flag: string
	parentFlag?: string // Optional parent flag that must also be true
	conflicts?: string[] // Array of conflicting flags
}

const newRules: RuleWithFlag[] = [
	// {
	// 	flag: "block_gql",
	// 	rule: {
	// 		id: 1,
	// 		priority: 1,
	// 		action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
	// 		condition: {
	// 			urlFilter: "https://gql.twitch.tv/gql", // blocks every visual element except for chat
	// 			resourceTypes: [
	// 				"xmlhttprequest" as chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
	// 				"websocket" as chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
	// 			],
	// 		},
	// 	},
	// },
	{
		flag: "block_gql",
		rule: {
			id: 1,
			priority: 1,
			action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
			condition: {
				urlFilter: "wss://hermes.twitch.tv/*",
				resourceTypes: [
					"xmlhttprequest" as chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
					"websocket" as chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
				],
			},
		},
	},

	{
		flag: "chat_minimal",
		parentFlag: "chat_only", // This rule only applies if both chat_minimal AND chat_only are true
		conflicts: ["no_chat"], // This rule won't apply if no_chat is true
		rule: {
			id: 2,
			priority: 1,
			action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
			condition: {
				urlFilter: "*twitch.tv/*",
				// wss://irc-ws.chat.twitch.tv/

				resourceTypes: ["stylesheet" as chrome.declarativeNetRequest.ResourceType.STYLESHEET],
			},
		},
	},
	{
		flag: "no_chat",
		rule: {
			id: 3,
			priority: 1,
			action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
			condition: {
				urlFilter: "wss://irc-ws.chat.twitch.tv/",
				resourceTypes: ["websocket" as chrome.declarativeNetRequest.ResourceType.WEBSOCKET],
			},
		},
	},
]

async function handleRules() {
	try {
		// Get current rules
		const currentRules = await dnr.getDynamicRules()
		const oldRuleIds = currentRules.map((r) => r.id)

		// Get all flags' states
		const allFlags = new Set([
			...newRules.map((r) => r.flag),
			...newRules.map((r) => r.parentFlag).filter((f): f is string => f !== undefined),
			...newRules.flatMap((r) => r.conflicts || []),
		])

		const storage = await chrome.storage.sync.get([...allFlags])
		console.log("Current storage state:", storage)

		// Filter rules based on their flags
		const activeRules = newRules
			.filter(({ flag, parentFlag, conflicts }) => {
				const flagEnabled = storage[flag] === true
				if (!flagEnabled) return false

				if (parentFlag && storage[parentFlag] !== true) {
					return false
				}

				if (conflicts?.some((conflict) => storage[conflict] === true)) {
					return false
				}

				return true
			})
			.map(({ rule }) => rule)

		console.log("Applying rules:", activeRules)

		// Update the rules
		await dnr.updateDynamicRules({
			removeRuleIds: oldRuleIds,
			addRules: activeRules,
		})
	} catch (error) {
		console.error("Error handling rules:", error)
	}
}

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName !== "sync") return

	const relevantFlags = new Set([
		...newRules.map((r) => r.flag),
		...newRules.map((r) => r.parentFlag).filter((f): f is string => f !== undefined),
		...newRules.flatMap((r) => r.conflicts || []),
	])

	if (Object.keys(changes).some((flag) => relevantFlags.has(flag))) {
		console.log("Updating rules due to relevant flag change")
		handleRules()
	}
})

// Initial setup
handleRules()
