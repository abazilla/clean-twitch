/**
 * WebSocket Interceptor - Runs in MAIN world
 *
 * This script must run in the main world (not isolated) to intercept
 * Twitch's WebSocket connections. It runs before the main content script.
 * Replaces native WebSocket with a proxy that can block connections.
 */

export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	world: "MAIN",
	runAt: "document_start",

	main() {
		// Prevent double injection
		if ((window as any).__cleanTwitchWSInjected) {
			return
		}
		;(window as any).__cleanTwitchWSInjected = true

		const OriginalWebSocket = window.WebSocket
		let chatWebSocket: WebSocket | null = null
		let blockChatWS = false

		// Proxy WebSocket constructor
		window.WebSocket = new Proxy(OriginalWebSocket, {
			construct(target, args: [string | URL, string | string[] | undefined]) {
				const url = args[0]

				// Block chat WebSocket if flag is set
				if (typeof url === "string" && url.includes("irc-ws.chat.twitch.tv") && blockChatWS) {
					console.log("[CT] 🚫 Blocked chat WebSocket reconnection")
					throw new Error("Chat WebSocket blocked - chat is hidden")
				}

				const ws = new target(...args)

				// Track chat WebSocket
				const urlString = typeof url === "string" ? url : url.toString()
				if (urlString.includes("irc-ws.chat.twitch.tv")) {
					chatWebSocket = ws
					console.log("[CT] 🟢 Chat WebSocket created")

					ws.addEventListener("close", () => {
						console.log("[CT] 🔴 Chat WebSocket closed")
						chatWebSocket = null
					})
				}

				return ws
			},
		})

		// Expose control functions via custom events
		// The isolated content script will dispatch these events
		window.addEventListener("__cleanTwitch_closeAndBlock", () => {
			blockChatWS = true
			if (chatWebSocket && chatWebSocket.readyState === WebSocket.OPEN) {
				chatWebSocket.close(1000, "Chat hidden by CT")
			}
		})

		window.addEventListener("__cleanTwitch_unblock", () => {
			blockChatWS = false
			console.log("[CT] ✅ Chat WebSocket unblocked")
		})

		// Expose state getter via custom event
		window.addEventListener("__cleanTwitch_getState", ((e: CustomEvent) => {
			e.detail.callback({
				blocking: blockChatWS,
				hasWebSocket: chatWebSocket !== null,
				wsState: chatWebSocket?.readyState,
			})
		}) as EventListener)

		console.log("[CT] WebSocket interceptor initialized")
	},
})
