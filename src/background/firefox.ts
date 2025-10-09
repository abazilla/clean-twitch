/// <reference types="firefox-webext-browser"/>

interface FirefoxRuleWithFlag {
	flag: string
	parentFlag?: string
	conflicts?: string[]
	urlPattern: string
	resourceTypes?: string[]
}

const blockingRules: FirefoxRuleWithFlag[] = [
	{
		flag: "block_gql",
		urlPattern: "*://hermes.twitch.tv/*",
		resourceTypes: ["websocket"]
	},
	{
		flag: "chat_minimal",
		parentFlag: "chat_only",
		conflicts: ["no_chat"],
		urlPattern: "*://*.twitch.tv/*",
		resourceTypes: ["stylesheet"]
	},
	{
		flag: "no_chat",
		urlPattern: "*://irc-ws.chat.twitch.tv/*",
		resourceTypes: ["websocket"]
	}
]

let activeFlags: Record<string, boolean> = {}

function shouldBlockRequest(url: string, resourceType: string): boolean {
	for (const rule of blockingRules) {
		// Check if URL matches pattern
		const pattern = rule.urlPattern.replace(/\*/g, ".*")
		const regex = new RegExp("^" + pattern + "$")
		
		if (!regex.test(url)) continue
		
		// Check if resource type matches (if specified)
		if (rule.resourceTypes && !rule.resourceTypes.includes(resourceType)) continue
		
		// Check if flag is enabled
		if (!activeFlags[rule.flag]) continue
		
		// Check parent flag requirement
		if (rule.parentFlag && !activeFlags[rule.parentFlag]) continue
		
		// Check for conflicts
		if (rule.conflicts?.some(conflict => activeFlags[conflict])) continue
		
		return true
	}
	
	return false
}

function onBeforeRequest(details: chrome.webRequest.WebRequestBodyDetails) {
	const resourceTypeMap: Record<string, string> = {
		"websocket": "websocket",
		"stylesheet": "stylesheet"
	}
	
	const mappedType = resourceTypeMap[details.type] || details.type
	
	if (shouldBlockRequest(details.url, mappedType)) {
		console.log("Blocking request:", details.url, details.type)
		return { cancel: true }
	}
	
	return {}
}

async function updateActiveFlags() {
	try {
		const allFlags = new Set([
			...blockingRules.map(r => r.flag),
			...blockingRules.map(r => r.parentFlag).filter((f): f is string => f !== undefined),
			...blockingRules.flatMap(r => r.conflicts || [])
		])
		
		const storage = await chrome.storage.sync.get([...allFlags])
		activeFlags = storage
		console.log("Updated active flags:", activeFlags)
	} catch (error) {
		console.error("Error updating flags:", error)
	}
}

// Set up webRequest listener
chrome.webRequest.onBeforeRequest.addListener(
	onBeforeRequest,
	{
		urls: ["*://*.twitch.tv/*"],
		types: ["websocket", "stylesheet", "xmlhttprequest"]
	},
	["blocking"]
)

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName !== "sync") return
	
	const relevantFlags = new Set([
		...blockingRules.map(r => r.flag),
		...blockingRules.map(r => r.parentFlag).filter((f): f is string => f !== undefined),
		...blockingRules.flatMap(r => r.conflicts || [])
	])
	
	if (Object.keys(changes).some(flag => relevantFlags.has(flag))) {
		console.log("Updating flags due to storage change")
		updateActiveFlags()
	}
})

// Initial setup
updateActiveFlags()