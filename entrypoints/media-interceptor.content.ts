/**
 * Media Interceptor - Runs in MAIN world
 *
 * Patches HTMLMediaElement.prototype.play to reject calls that target
 * Twitch's mini player when the feature flag is on. Runs in the main
 * world so we can override the prototype before Twitch's player code
 * binds to it.
 */

export default defineContentScript({
	matches: ["https://*.twitch.tv/*"],
	world: "MAIN",
	runAt: "document_start",

	main() {
		if ((window as any).__cleanTwitchMediaInjected) return
		;(window as any).__cleanTwitchMediaInjected = true

		let blockMiniPlayer = false

		const origPlay = HTMLMediaElement.prototype.play
		HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
			if (blockMiniPlayer) {
				const owner = (this as HTMLElement).closest?.('[data-a-player-type="site_mini"]')
				if (owner) {
					return Promise.reject(
						new DOMException(
							"Blocked by Clean Twitch (hide_mini_player)",
							"AbortError"
						)
					)
				}
			}
			// eslint-disable-next-line prefer-rest-params
			return origPlay.apply(this, arguments as unknown as [])
		}

		window.addEventListener("__cleanTwitch_setBlockMiniPlayer", ((e: CustomEvent) => {
			blockMiniPlayer = !!e.detail?.block
		}) as EventListener)
	},
})
