/**
 * WebSocket Manager for Clean Twitch
 *
 * Manages chat WebSocket connections to reduce bandwidth when chat is hidden.
 * When chat becomes hidden (fullscreen or column collapsed), this manager:
 * 1. Closes the existing WebSocket connection
 * 2. Blocks reconnection attempts until chat becomes visible again
 * 3. Unblocks when chat is visible, allowing Twitch to reconnect naturally
 */

export interface WebSocketManagerOptions {
	enableLogging?: boolean
}

class ChatWebSocketManager {
	private enabled = false
	private blockReconnection = false
	private enableLogging = false
	private eventListeners: Array<{ element: any; event: string; handler: any; options?: any }> = []

	/**
	 * Enable the WebSocket manager and start monitoring chat visibility
	 */
	enable(options: WebSocketManagerOptions = {}) {
		if (this.enabled) return

		this.enabled = true
		this.enableLogging = options.enableLogging ?? false
		this.setupEventListeners()

		// Check initial chat visibility state and block if already hidden
		setTimeout(() => {
			this.updateChatWebSocketState()
		}, 200) // Small delay to ensure DOM is ready

		this.log("WebSocket manager enabled")
	}

	/**
	 * Disable the WebSocket manager and allow all connections
	 */
	disable() {
		if (!this.enabled) return

		this.enabled = false
		this.blockReconnection = false
		this.removeEventListeners()
		this.unblock()
		this.log("WebSocket manager disabled")
	}

	/**
	 * Check if the manager is currently enabled
	 */
	isEnabled(): boolean {
		return this.enabled
	}

	/**
	 * Check if reconnection is currently blocked
	 */
	isBlocking(): boolean {
		return this.blockReconnection
	}

	/**
	 * Set up event listeners for UI interactions that affect chat visibility
	 */
	private setupEventListeners() {
		// Right column toggle button (collapse/expand chat)
		this.addEventListener(document, "click", this.hideChatColumnClick.bind(this), true)

		// Fullscreen events
		this.addEventListener(document, "fullscreenchange", this.handleFullscreenChange.bind(this))
	}

	/**
	 * Add event listener and track it for cleanup
	 */
	private addEventListener(element: any, event: string, handler: any, options?: any) {
		element.addEventListener(event, handler, options)
		this.eventListeners.push({ element, event, handler, options })
	}

	/**
	 * Remove all tracked event listeners
	 */
	private removeEventListeners() {
		for (const { element, event, handler, options } of this.eventListeners) {
			element.removeEventListener(event, handler, options)
		}
		this.eventListeners = []
		this.log("Event listeners removed")
	}

	/**
	 * Handle right column toggle button clicks (collapse/expand chat)
	 */
	private hideChatColumnClick(e: Event) {
		if (!this.enabled) return

		const target = e.target as HTMLElement
		const toggleButton = target.closest('[data-a-target="right-column__toggle-collapse-btn"]')

		if (toggleButton) {
			// Small delay to allow DOM to update
			setTimeout(() => {
				this.updateChatWebSocketState()
			}, 100)
		}
	}

	/**
	 * Handle fullscreen change events
	 */
	private handleFullscreenChange() {
		if (!this.enabled) return

		// Small delay to allow DOM to update
		setTimeout(() => {
			this.updateChatWebSocketState()
		}, 100)
	}

	/**
	 * Update WebSocket state based on current chat visibility
	 */
	private updateChatWebSocketState() {
		if (!this.enabled) return

		if (this.isChatHidden()) {
			this.closeAndBlock()
		} else {
			this.unblock()
		}
	}

	/**
	 * Check if chat is currently hidden
	 */
	private isChatHidden(): boolean {
		// Check fullscreen
		if (document.fullscreenElement) {
			this.log("Chat hidden: fullscreen active")
			return true
		}

		// Check if chat column exists and is visible
		const chatColumn = document.querySelector(".channel-root__right-column") as HTMLElement
		if (!chatColumn) {
			this.log("Chat hidden: chat column not found")
			return true
		}

		// Check if collapsed (width < 100px indicates collapsed state)
		const width = chatColumn.offsetWidth
		if (width < 100) {
			this.log("Chat hidden: collapsed (width < 100)")
			return true
		}

		// Check display style
		const display = window.getComputedStyle(chatColumn).display
		if (display === "none") {
			this.log("Chat hidden: display none")
			return true
		}

		this.log("Chat visible")
		return false
	}

	/**
	 * Close existing WebSocket and block reconnection attempts
	 */
	private closeAndBlock() {
		this.blockReconnection = true
		this.log("Closing and blocking chat WebSocket")

		// Dispatch custom event to MAIN world interceptor
		// Always dispatch to ensure state stays in sync (idempotent)
		window.dispatchEvent(new CustomEvent("__cleanTwitch_closeAndBlock"))
	}

	/**
	 * Unblock WebSocket reconnection (allows Twitch to reconnect naturally)
	 */
	private unblock() {
		this.blockReconnection = false
		this.log("Unblocking chat WebSocket")

		// Dispatch custom event to MAIN world interceptor
		// Always dispatch to ensure state stays in sync (idempotent)
		window.dispatchEvent(new CustomEvent("__cleanTwitch_unblock"))
	}

	/**
	 * Force close and block chat WebSocket (e.g., when "Hide Chat" feature is enabled)
	 */
	public forceCloseAndBlock() {
		if (!this.enabled) return
		this.log("Force closing and blocking chat WebSocket")
		this.closeAndBlock()
	}

	/**
	 * Force unblock chat WebSocket (e.g., when "Hide Chat" feature is disabled)
	 */
	public forceUnblock() {
		if (!this.enabled) return
		this.log("Force unblocking chat WebSocket")
		this.unblock()
	}

	/**
	 * Log message if logging is enabled
	 */
	private log(message: string) {
		if (this.enableLogging) {
			console.log(`[CTWM] ${message}`)
		}
	}
}

// Export singleton instance
export const chatWebSocketManager = new ChatWebSocketManager()

// /**
//  * Initialize the chat WebSocket manager
//  * Call this from your content script to start managing chat WebSockets
//  */
// export function initializeChatWebSocketManager(
// 	enabled: boolean,
// 	options?: WebSocketManagerOptions
// ) {
// 	if (enabled) {
// 		chatWebSocketManager.enable(options)
// 	} else {
// 		chatWebSocketManager.disable()
// 	}
// }
