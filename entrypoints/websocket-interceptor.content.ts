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

		const DEBUG = false // Set to true to enable logging
		const log = (msg: string) => DEBUG && console.log(msg)

		const OriginalWebSocket = window.WebSocket
		let chatWebSocket: WebSocket | null = null
		let hermesWebSockets: WebSocket[] = []
		let blockChatWS = false
		let blockHermesWS = false

		// Proxy WebSocket constructor
		window.WebSocket = new Proxy(OriginalWebSocket, {
			construct(target, args: [string | URL, string | string[] | undefined]) {
				const url = args[0]
				const urlString = typeof url === "string" ? url : url.toString()

				// Block chat WebSocket if flag is set
				if (urlString.includes("irc-ws.chat.twitch.tv") && blockChatWS) {
					log("[CT] 🚫 Blocked chat WebSocket reconnection")
					throw new Error("Chat WebSocket blocked - chat is hidden")
				}

				// Block Hermes WebSocket if flag is set
				if (urlString.includes("hermes.twitch.tv") && blockHermesWS) {
					log("[CT] 🚫 Blocked Hermes WebSocket")
					throw new Error("Hermes WebSocket blocked")
				}

				const ws = new target(...args)

				// Track chat WebSocket
				if (urlString.includes("irc-ws.chat.twitch.tv")) {
					chatWebSocket = ws
					log("[CT] 🟢 Chat WebSocket created")

					ws.addEventListener("close", () => {
						log("[CT] 🔴 Chat WebSocket closed")
						chatWebSocket = null
					})
				}

				// Track Hermes WebSocket
				if (urlString.includes("hermes.twitch.tv")) {
					hermesWebSockets.push(ws)
					log("[CT] 🟢 Hermes WebSocket created")

					ws.addEventListener("close", () => {
						log("[CT] 🔴 Hermes WebSocket closed")
						hermesWebSockets = hermesWebSockets.filter((s) => s !== ws)
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
			log("[CT] ✅ Chat WebSocket unblocked")
		})

		// Hermes WebSocket control events
		window.addEventListener("__cleanTwitch_blockHermes", () => {
			blockHermesWS = true
			// Close all existing Hermes connections
			for (const ws of hermesWebSockets) {
				if (ws.readyState === WebSocket.OPEN) {
					ws.close(1000, "Hermes blocked by CT")
				}
			}
			log("[CT] 🚫 Hermes WebSocket blocked")
		})

		window.addEventListener("__cleanTwitch_unblockHermes", () => {
			blockHermesWS = false
			log("[CT] ✅ Hermes WebSocket unblocked")
		})

		// Expose state getter via custom event
		window.addEventListener("__cleanTwitch_getState", ((e: CustomEvent) => {
			e.detail.callback({
				blocking: blockChatWS,
				hasWebSocket: chatWebSocket !== null,
				wsState: chatWebSocket?.readyState,
				blockingHermes: blockHermesWS,
				hermesWebSocketCount: hermesWebSockets.length,
			})
		}) as EventListener)

		log("[CT] WebSocket interceptor initialized")
	},
})
