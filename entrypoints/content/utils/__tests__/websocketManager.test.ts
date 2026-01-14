import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { chatWebSocketManager } from "../websocketManager"

describe("ChatWebSocketManager", () => {
	beforeEach(() => {
		// Reset DOM
		document.body.innerHTML = ""
		document.head.innerHTML = ""

		// Reset manager state
		chatWebSocketManager.disable()

		// Clear any existing __cleanTwitch global
		delete (window as any).__cleanTwitch
		delete (window as any).__cleanTwitchWSInjected

		// Mock window.WebSocket if needed
		if (!global.WebSocket) {
			global.WebSocket = class WebSocket {
				static CONNECTING = 0
				static OPEN = 1
				static CLOSING = 2
				static CLOSED = 3

				readyState = WebSocket.OPEN
				url: string

				constructor(url: string) {
					this.url = url
				}

				close() {
					this.readyState = WebSocket.CLOSED
				}

				addEventListener() {}
				removeEventListener() {}
				send() {}
			} as any
		}
	})

	afterEach(() => {
		chatWebSocketManager.disable()
	})

	describe("enable/disable", () => {
		test("should enable/disable manager", () => {
			expect(chatWebSocketManager.isEnabled()).toBe(false)
			chatWebSocketManager.enable()
			expect(chatWebSocketManager.isEnabled()).toBe(true)
			chatWebSocketManager.disable()
			expect(chatWebSocketManager.isEnabled()).toBe(false)
		})

		test("should not inject interceptor twice", () => {
			chatWebSocketManager.enable()
			const firstInjection = (window as any).__cleanTwitchWSInjected

			chatWebSocketManager.disable()
			chatWebSocketManager.enable()

			expect((window as any).__cleanTwitchWSInjected).toBe(firstInjection)
		})

		test("should unblock when disabled", () => {
			chatWebSocketManager.enable()
			chatWebSocketManager.forceCloseAndBlock()
			expect(chatWebSocketManager.isBlocking()).toBe(true)

			chatWebSocketManager.disable()
			expect(chatWebSocketManager.isBlocking()).toBe(false)
		})
	})

	// describe("initializeChatWebSocketManager", () => {
	// 	test("should enable when passed true", () => {
	// 		initializeChatWebSocketManager(true)
	// 		expect(chatWebSocketManager.isEnabled()).toBe(true)
	// 	})

	// 	test("should disable when passed false", () => {
	// 		chatWebSocketManager.enable()
	// 		initializeChatWebSocketManager(false)
	// 		expect(chatWebSocketManager.isEnabled()).toBe(false)
	// 	})

	// 	test("should pass options to enable", () => {
	// 		initializeChatWebSocketManager(true, { enableLogging: true })
	// 		expect(chatWebSocketManager.isEnabled()).toBe(true)
	// 	})
	// })

	describe("forceCloseAndBlock", () => {
		test("should set blocking state to true", () => {
			chatWebSocketManager.enable()
			expect(chatWebSocketManager.isBlocking()).toBe(false)

			chatWebSocketManager.forceCloseAndBlock()
			expect(chatWebSocketManager.isBlocking()).toBe(true)
		})

		test("should not block when manager is disabled", () => {
			chatWebSocketManager.forceCloseAndBlock()
			expect(chatWebSocketManager.isBlocking()).toBe(false)
		})

		test("should dispatch closeAndBlock event", () => {
			const mockDispatch = vi.spyOn(window, "dispatchEvent")

			chatWebSocketManager.enable()
			chatWebSocketManager.forceCloseAndBlock()

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "__cleanTwitch_closeAndBlock",
				})
			)

			mockDispatch.mockRestore()
		})
	})

	describe("forceUnblock", () => {
		test("should set blocking state to false", () => {
			chatWebSocketManager.enable()
			chatWebSocketManager.forceCloseAndBlock()
			expect(chatWebSocketManager.isBlocking()).toBe(true)

			chatWebSocketManager.forceUnblock()
			expect(chatWebSocketManager.isBlocking()).toBe(false)
		})

		test("should not unblock when manager is disabled", () => {
			chatWebSocketManager.enable()
			chatWebSocketManager.forceCloseAndBlock()
			chatWebSocketManager.disable()

			// Already unblocked by disable, blocking state should be false
			chatWebSocketManager.forceUnblock()
			expect(chatWebSocketManager.isBlocking()).toBe(false)
		})

		test("should dispatch unblock event", () => {
			const mockDispatch = vi.spyOn(window, "dispatchEvent")

			chatWebSocketManager.enable()
			chatWebSocketManager.forceCloseAndBlock()
			mockDispatch.mockClear() // Clear previous calls

			chatWebSocketManager.forceUnblock()

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "__cleanTwitch_unblock",
				})
			)

			mockDispatch.mockRestore()
		})
	})

	describe("chat visibility detection", () => {
		beforeEach(() => {
			chatWebSocketManager.enable()
		})

		test("should detect fullscreen as hidden", () => {
			// Mock fullscreen element
			Object.defineProperty(document, "fullscreenElement", {
				writable: true,
				configurable: true,
				value: document.createElement("div"),
			})

			// Trigger fullscreen change
			document.dispatchEvent(new Event("fullscreenchange"))

			// Wait for setTimeout
			return new Promise((resolve) => {
				setTimeout(() => {
					expect(chatWebSocketManager.isBlocking()).toBe(true)
					resolve(undefined)
				}, 150)
			})
		})

		test("should detect missing chat column as hidden", () => {
			// No chat column in DOM
			document.body.innerHTML = "<div></div>"

			// Trigger fullscreen change to force check
			document.dispatchEvent(new Event("fullscreenchange"))

			return new Promise((resolve) => {
				setTimeout(() => {
					expect(chatWebSocketManager.isBlocking()).toBe(true)
					resolve(undefined)
				}, 150)
			})
		})

		test("should detect collapsed chat as hidden", () => {
			// Create chat column with small width
			const chatColumn = document.createElement("div")
			chatColumn.className = "channel-root__right-column"
			Object.defineProperty(chatColumn, "offsetWidth", {
				writable: true,
				configurable: true,
				value: 50,
			})
			document.body.appendChild(chatColumn)

			document.dispatchEvent(new Event("fullscreenchange"))

			return new Promise((resolve) => {
				setTimeout(() => {
					expect(chatWebSocketManager.isBlocking()).toBe(true)
					resolve(undefined)
				}, 150)
			})
		})

		test("should detect visible chat", () => {
			// Create chat column with normal width
			const chatColumn = document.createElement("div")
			chatColumn.className = "channel-root__right-column"
			Object.defineProperty(chatColumn, "offsetWidth", {
				writable: true,
				configurable: true,
				value: 340, // twitch chat column width is 340px
			})
			chatColumn.style.display = "block"
			document.body.appendChild(chatColumn)

			// First, set blocking state
			chatWebSocketManager.forceCloseAndBlock()
			expect(chatWebSocketManager.isBlocking()).toBe(true)

			// Clear fullscreen (if was set by previous test)
			Object.defineProperty(document, "fullscreenElement", {
				writable: true,
				configurable: true,
				value: null,
			})

			// Now trigger visibility check
			document.dispatchEvent(new Event("fullscreenchange"))

			return new Promise((resolve) => {
				setTimeout(() => {
					// Should unblock because chat is visible
					expect(chatWebSocketManager.isBlocking()).toBe(false)
					resolve(undefined)
				}, 150)
			})
		})
	})

	describe("event handlers", () => {
		beforeEach(() => {
			chatWebSocketManager.enable()
		})

		afterEach(() => {
			// Clean up DOM between tests
			document.body.innerHTML = ""
			Object.defineProperty(document, "fullscreenElement", {
				writable: true,
				configurable: true,
				value: null,
			})
		})

		test("should handle theatre mode button click", () => {
			// Create theatre mode button
			const button = document.createElement("button")
			button.setAttribute("data-a-target", "player-theatre-mode-button")
			document.body.appendChild(button)

			// Mock fullscreen (theatre mode typically enters fullscreen)
			Object.defineProperty(document, "fullscreenElement", {
				writable: true,
				configurable: true,
				value: document.createElement("div"),
			})

			// Click button
			button.click()

			return new Promise((resolve) => {
				setTimeout(() => {
					expect(chatWebSocketManager.isBlocking()).toBe(true)
					resolve(undefined)
				}, 150)
			})
		})

		test("should handle chat collapse button click", () => {
			// Create collapse button
			const button = document.createElement("button")
			button.setAttribute("data-a-target", "right-column-chat-bar__collapse-toggle")
			document.body.appendChild(button)

			// Create collapsed chat column
			const chatColumn = document.createElement("div")
			chatColumn.className = "channel-root__right-column"
			Object.defineProperty(chatColumn, "offsetWidth", {
				writable: true,
				configurable: true,
				value: 50,
			})
			document.body.appendChild(chatColumn)

			// Click button
			button.click()

			return new Promise((resolve) => {
				setTimeout(() => {
					expect(chatWebSocketManager.isBlocking()).toBe(true)
					resolve(undefined)
				}, 150)
			})
		})

		test("should not handle events when disabled", () => {
			chatWebSocketManager.disable()

			// Create and click theatre button
			const button = document.createElement("button")
			button.setAttribute("data-a-target", "player-theatre-mode-button")
			document.body.appendChild(button)
			button.click()

			return new Promise((resolve) => {
				setTimeout(() => {
					expect(chatWebSocketManager.isBlocking()).toBe(false)
					resolve(undefined)
				}, 150)
			})
		})
	})

	describe("idempotency", () => {
		test("should handle multiple enable calls gracefully", () => {
			chatWebSocketManager.enable()
			chatWebSocketManager.enable()
			chatWebSocketManager.enable()

			expect(chatWebSocketManager.isEnabled()).toBe(true)
		})

		test("should handle multiple disable calls gracefully", () => {
			chatWebSocketManager.enable()
			chatWebSocketManager.disable()
			chatWebSocketManager.disable()
			chatWebSocketManager.disable()

			expect(chatWebSocketManager.isEnabled()).toBe(false)
		})

		test("should handle multiple forceCloseAndBlock calls", () => {
			const mockDispatch = vi.spyOn(window, "dispatchEvent")

			chatWebSocketManager.enable()
			chatWebSocketManager.forceCloseAndBlock()
			chatWebSocketManager.forceCloseAndBlock()
			chatWebSocketManager.forceCloseAndBlock()

			// Should only dispatch once due to state check
			const closeAndBlockCalls = mockDispatch.mock.calls.filter(
				(call) => call[0].type === "__cleanTwitch_closeAndBlock"
			)
			expect(closeAndBlockCalls.length).toBe(1)

			mockDispatch.mockRestore()
		})
	})

	describe("logging", () => {
		test("should not log by default", () => {
			const consoleSpy = vi.spyOn(console, "log")

			chatWebSocketManager.enable()

			expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("[ChatWebSocketManager]"))

			consoleSpy.mockRestore()
		})

		test("should log when enableLogging is true", () => {
			const consoleSpy = vi.spyOn(console, "log")

			chatWebSocketManager.enable({ enableLogging: true })

			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[ChatWebSocketManager]"))

			consoleSpy.mockRestore()
		})
	})
})
