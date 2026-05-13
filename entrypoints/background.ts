/**
 * Background script
 *
 * Owns the dynamic declarativeNetRequest rules that block Twitch's
 * front-page carousel HLS playlist + segments. Rules are scoped to the
 * specific tabs that are currently on the home page so other tabs (e.g.
 * a stream playing in another tab) keep working.
 */

const RULE_ID_PLAYLIST = 1001
const RULE_ID_SEGMENT = 1002

const blockedTabs = new Set<number>()

async function applyRules() {
	const tabIds = [...blockedTabs]
	if (tabIds.length === 0) {
		await browser.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [RULE_ID_PLAYLIST, RULE_ID_SEGMENT],
		})
		return
	}
	await browser.declarativeNetRequest.updateSessionRules({
		removeRuleIds: [RULE_ID_PLAYLIST, RULE_ID_SEGMENT],
		addRules: [
			{
				id: RULE_ID_PLAYLIST,
				priority: 1,
				action: { type: "block" },
				condition: {
					urlFilter: "||playlist.ttvnw.net/v1/playlist/",
					resourceTypes: ["xmlhttprequest", "media", "other"],
					tabIds,
				},
			},
			{
				id: RULE_ID_SEGMENT,
				priority: 1,
				action: { type: "block" },
				condition: {
					urlFilter: "||cloudfront.hls.ttvnw.net/v1/segment/",
					resourceTypes: ["xmlhttprequest", "media", "other"],
					tabIds,
				},
			},
		],
	})
}

export default defineBackground(() => {
	// Always start clean — extension reload, browser restart, etc.
	blockedTabs.clear()
	applyRules()

	browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		if (msg?.type === "carousel-block-set") {
			const tabId = sender.tab?.id
			if (typeof tabId !== "number") {
				sendResponse({ ok: false, error: "no tab id" })
				return
			}
			if (msg.block) blockedTabs.add(tabId)
			else blockedTabs.delete(tabId)
			applyRules()
				.then(() => sendResponse({ ok: true }))
				.catch((err) => sendResponse({ ok: false, error: String(err) }))
			return true // async
		}
	})

	// Clean up when a blocked tab closes.
	browser.tabs.onRemoved.addListener((tabId) => {
		if (blockedTabs.delete(tabId)) applyRules()
	})
})
