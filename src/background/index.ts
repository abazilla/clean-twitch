const dnr = chrome.declarativeNetRequest

async function handleRules() {
	// Get arrays containing new and old rules
	const newRules: chrome.declarativeNetRequest.Rule[] = [
		{
			id: 1,
			priority: 1,
			action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
			condition: {
				urlFilter: "https://gql.twitch.tv/gql", // blocks every visual element except for chat
				resourceTypes: [
					"xmlhttprequest" as chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
				],
			},
		},
	]

	const oldRuleIds = await dnr
		.getDynamicRules()
		.then((rs) => rs.map((r) => r.id))
		.catch(() => undefined)

	// Use the arrays to update the dynamic rules
	await dnr
		.updateDynamicRules({
			removeRuleIds: oldRuleIds ?? [],
			addRules: newRules,
		})
		.catch((reason) => {
			console.error(`updateDynamicRules() / ${reason}`)
		})
}

handleRules()
