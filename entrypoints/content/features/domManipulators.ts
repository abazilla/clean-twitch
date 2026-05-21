import {
	BLOCKED_CATEGORIES_STYLE_ID,
	BLOCKED_CHANNELS_STYLE_ID,
	DISPLAY_NONE_STYLES,
	GRAYSCALE_DISABLED,
	GRAYSCALE_FILTER_OFF,
	GRAYSCALE_FILTER_ON,
	TEST_MODE_STYLES,
	toggleCSSGrayscale,
	toggleCSSHidden,
	UNIVERSAL_STYLE_ID_CSS,
	UNIVERSAL_STYLE_ID_JS,
} from "../dom/cssManager"
import { toggleElementVisibility, updateElement } from "../dom/elementHelpers"
import { disposeObserver, registerObserver } from "../dom/observerRegistry"
import { chatWebSocketManager } from "../network/chatWebSocket"
import { storageHandler } from "../storage/handler"
import { isChannelPage, TwitchURLs } from "./definitions"
import {
	Chat,
	ChannelInfo,
	ChannelVideo,
	Footer,
	LeftSidebar,
	Player,
	Thumbnails,
	TopNav,
} from "./selectors"

const isLoggedIn = (): boolean => document.querySelector(TopNav.LOGIN_BUTTON) === null

export function toggleTestMode(toggled: boolean) {
	const styleIds = [
		UNIVERSAL_STYLE_ID_JS,
		UNIVERSAL_STYLE_ID_CSS,
		BLOCKED_CHANNELS_STYLE_ID,
		BLOCKED_CATEGORIES_STYLE_ID,
	]

	for (const styleId of styleIds) {
		const style = document.getElementById(styleId)
		if (style) {
			const currentContent = style.textContent || ""
			if (toggled) {
				// Replace display: none !important; with test mode styling
				let testContent = currentContent.replaceAll(DISPLAY_NONE_STYLES, TEST_MODE_STYLES)
				testContent = testContent.replaceAll(GRAYSCALE_FILTER_ON, GRAYSCALE_DISABLED)
				style.textContent = testContent
			} else {
				// Replace test mode styling back to display: none
				let normalContent = currentContent.replaceAll(TEST_MODE_STYLES, DISPLAY_NONE_STYLES)
				normalContent = normalContent.replaceAll(GRAYSCALE_DISABLED, GRAYSCALE_FILTER_ON)
				style.textContent = normalContent
			}
		}
	}
}

export function toggleGrayscale(toggled: boolean) {
	const style = document.getElementById(UNIVERSAL_STYLE_ID_JS)
	if (style) {
		const currentContent = style.textContent || ""
		if (toggled) {
			let testContent = currentContent.replaceAll(GRAYSCALE_FILTER_OFF, GRAYSCALE_FILTER_ON)
			style.textContent = testContent
		} else {
			// Remove grayscale CSS
			let testContent = currentContent.replaceAll(GRAYSCALE_FILTER_ON, GRAYSCALE_FILTER_OFF)
			style.textContent = testContent
		}
	}
}

// NOTE: Elements that use updateElement are elements that load after a delay, or load on certain pages

// TOP BAR
export function toggleTopBarGrayscale(value: boolean) {
	toggleCSSGrayscale(TopNav.CONTAINER, value)
}

export function hideFollowingButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.FOLLOWING_BUTTON, isHidden)
}

export function hideRobloxButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.ROBLOX_BUTTON, isHidden)
}

export function hideBrowseButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.BROWSE_BUTTON, isHidden)
}

export function hideDotsButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.DOTS_BUTTON, isHidden)
}

export function hidePrimeGamingButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.PRIME_GAMING_BUTTON, isHidden)
}

export function hideNotificationsButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.NOTIFICATIONS_BUTTON, isHidden)
}

export function hideWhispersButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.WHISPERS_BUTTON, isHidden)
}

export function hideTopBitsButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.BITS_BUTTON, isHidden)
}

export function hideTopTurboButton(isHidden: boolean) {
	toggleCSSHidden(TopNav.TURBO_BUTTON, isHidden)
}

// LEFT SIDEBAR
export function toggleLeftSidebar(value: boolean) {
	if (value) {
		const sideNavBar = document.querySelector(LeftSidebar.BAR) as HTMLElement
		const sideNavBarCollapsed = document.querySelector(LeftSidebar.BAR_COLLAPSED) as HTMLElement
		const collapseButton = document.querySelector(LeftSidebar.COLLAPSE_BUTTON) as HTMLButtonElement

		if (sideNavBar) sideNavBar.style.cssText = "width: 0 !important;"
		if (sideNavBarCollapsed) sideNavBarCollapsed.style.cssText = "width: 0 !important;"
		if (collapseButton) collapseButton.click()
		if (sideNavBar) sideNavBar.style.cssText = "width: 0 !important;"
	} else {
		const sideNavBar = document.querySelector(LeftSidebar.BAR) as HTMLElement
		const sideNavBarCollapsed = document.querySelector(LeftSidebar.BAR_COLLAPSED) as HTMLElement
		const expandButton = document.querySelector(LeftSidebar.EXPAND_BUTTON) as HTMLButtonElement

		if (sideNavBar) sideNavBar.removeAttribute("style")
		if (sideNavBarCollapsed) sideNavBarCollapsed.removeAttribute("style")
		if (expandButton) expandButton.click()
	}
}

export function toggleSideNavGrayscale(value: boolean) {
	toggleCSSGrayscale(LeftSidebar.BAR, value)
	toggleCSSGrayscale(LeftSidebar.BAR_COLLAPSED, value)
}

export function toggleLeftSidebarStories(value: boolean) {
	toggleCSSHidden(LeftSidebar.STORIES_SECTION, value)
}

export function toggleLeftSidebarViewership(value: boolean) {
	toggleCSSHidden(LeftSidebar.LIVE_STATUS_TOGGLE, value)
}

export function toggleLeftSidebarFollowedChannels(value: boolean) {
	toggleCSSHidden(LeftSidebar.FOLLOWED_CHANNELS, value)
}

export function toggleLeftSidebarLiveChannels(value: boolean) {
	const val = isLoggedIn() ? value : false
	toggleCSSHidden(LeftSidebar.LIVE_CHANNELS, val)
}

export function toggleLeftSidebarViewersAlsoWatch(value: boolean) {
	const val = isLoggedIn() ? value : false
	toggleCSSHidden(LeftSidebar.VIEWERS_ALSO_WATCH, val)
}

export function toggleLeftSidebarRecommendedCategories(value: boolean) {
	const val = isLoggedIn() ? value : false
	toggleCSSHidden(LeftSidebar.RECOMMENDED_CATEGORIES, val)
}

export function toggleLeftSidebarSponsored(value: boolean) {
	toggleCSSHidden(LeftSidebar.SPONSORED_CARD, value)
}

export function toggleLeftSidebarGiftSubDiscount(value: boolean) {
	toggleCSSHidden(LeftSidebar.GIFT_SUB_DISCOUNT, value)
}

export function toggleLeftSidebarHypeTrain(value: boolean) {
	toggleCSSHidden(LeftSidebar.HYPE_TRAIN, value)
}

export function toggleVideoHypeTrain(value: boolean) {
	// TODO: disable the wss if possible
	toggleCSSHidden(ChannelVideo.HYPE_TRAIN_OVERLAY, value)
}

export function toggleLeftSidebarOfflineChannels(value: boolean) {
	toggleCSSHidden(LeftSidebar.OFFLINE_CHANNELS, value)
}

export function toggleLeftSidebarAlwaysShowMore(value: boolean) {
	const featureId = "left_sidebar_always_show_more"
	toggleCSSHidden(LeftSidebar.SHOW_MORE_BUTTON, value)
	toggleCSSHidden(LeftSidebar.SHOW_LESS_BUTTON, value)
	if (value) {
		updateElement(
			() => document.querySelectorAll(LeftSidebar.SHOW_MORE_BUTTON),
			(buttons) => {
				if (buttons && "length" in buttons && buttons.length > 0) {
					buttons.forEach((button) => {
						;(button as HTMLButtonElement).click()
					})
					setTimeout(() => {
						toggleLeftSidebarAlwaysShowMore(value)
					}, 100)
				}
			},
			5000,
			"stop_after_timeout",
			"toggleLeftSidebarAlwaysShowMore",
			featureId
		)
	} else {
		disposeObserver(featureId)
	}
}

// RIGHT SIDEBAR
export function toggleHideChat(value: boolean) {
	const featureId = "no_chat"

	toggleCSSHidden(Chat.BAR_EXPANDED, value)
	toggleCSSHidden(Chat.BAR_COLLAPSED, value)

	if (value) {
		document.querySelector<HTMLButtonElement>(Chat.COLLAPSE_BUTTON)?.click()
	} else {
		document.querySelector<HTMLButtonElement>(Chat.EXPAND_BUTTON)?.click()
	}
	disposeObserver(featureId)
}

export function toggleTopGifters(value: boolean) {
	toggleCSSHidden(Chat.TOP_GIFTERS, value)
}

export function toggleChatMonetizationButtons(value: boolean) {
	toggleCSSHidden(Chat.BITS_BUTTON, value)
	toggleCSSHidden(Chat.CHANNEL_POINTS_ICON, value)
	toggleCSSHidden(Chat.BITS_BALANCE, value)
	toggleCSSHidden(Chat.NEW_ITEM_INDICATOR, value)
}

export function toggleCommunityHighlightStack(value: boolean) {
	toggleCSSHidden(Chat.COMMUNITY_HIGHLIGHT_STACK, value)
}

export function toggleChatGrayscale(value: boolean) {
	toggleCSSGrayscale(Chat.CHANNEL_RIGHT_COLUMN, value)
}

export function toggleChatBadges(value: boolean) {
	toggleCSSHidden(Chat.BADGES, value)
}

export function toggleChatClipBestMoments(value: boolean) {
	toggleCSSHidden(Chat.BEST_MOMENTS_CLIP, value)
}

export function toggleChatPrivateCallout(value: boolean) {
	toggleCSSHidden(Chat.PRIVATE_CALLOUT, value)
}

export function toggleChatSubUpsell(value: boolean) {
	toggleCSSHidden(Chat.SUB_UPSELL, value)
}

// SPA route-change pub/sub. history.pushState / replaceState do not fire
// any native event, so we patch them once and fan out to subscribers.
let routeListenerInstalled = false
const routeChangeSubscribers = new Set<() => void>()

function installRouteListener() {
	if (routeListenerInstalled) return
	routeListenerInstalled = true
	const fire = () => routeChangeSubscribers.forEach((cb) => cb())
	const wrap = (key: "pushState" | "replaceState") => {
		const orig = history[key]
		history[key] = function (this: History, ...args: unknown[]) {
			const r = orig.apply(this, args as Parameters<typeof orig>)
			fire()
			return r
		} as typeof orig
	}
	wrap("pushState")
	wrap("replaceState")
	window.addEventListener("popstate", fire)
	window.addEventListener("hashchange", fire)
}

let currentCarouselRouteCb: (() => void) | null = null

function updateHomeBodyAttr() {
	if (location.pathname === "/") {
		document.body?.setAttribute("data-ct-on-home", "1")
	} else {
		document.body?.removeAttribute("data-ct-on-home")
	}
}

export function hideCarousel(value: boolean) {
	const featureId = "hide_carousel"

	const syncBackground = () => {
		const shouldBlock = value && location.pathname === "/"
		try {
			browser.runtime.sendMessage({ type: "carousel-block-set", block: shouldBlock })
		} catch {
			// ignore; background may be temporarily unavailable
		}
	}

	const sweep = () => {
		document
			.querySelectorAll(`${Player.FRONT_PAGE_CAROUSEL}, ${Player.FRONTPAGE_PLAYER}`)
			.forEach((el) => el.remove())
	}

	// Tear down any prior subscription so toggling does not leak callbacks.
	if (currentCarouselRouteCb) {
		routeChangeSubscribers.delete(currentCarouselRouteCb)
		currentCarouselRouteCb = null
	}

	if (!value) {
		disposeObserver(featureId)
		toggleCSSHidden(Player.MINI_BODY_HOME_SCOPED, false)
		document.body?.removeAttribute("data-ct-on-home")
		syncBackground()
		return
	}

	installRouteListener()
	const routeCb = () => {
		updateHomeBodyAttr()
		syncBackground()
		sweep()
	}
	currentCarouselRouteCb = routeCb
	routeChangeSubscribers.add(routeCb)

	updateHomeBodyAttr()
	// CSS rule stays installed for the lifetime of the feature; the body
	// attribute decides whether it matches anything, so route changes are
	// effectively free from a styling perspective.
	toggleCSSHidden(Player.MINI_BODY_HOME_SCOPED, true)
	syncBackground()
	sweep()

	const observer = new MutationObserver(sweep)
	registerObserver(featureId, observer)
	observer.observe(document.body, { childList: true, subtree: true })
}

export function hideMiniPlayer(value: boolean) {
	const featureId = "hide_mini_player"
	toggleCSSHidden(Player.MINI, value)
	try {
		window.dispatchEvent(
			new CustomEvent("__cleanTwitch_setBlockMiniPlayer", { detail: { block: value } })
		)
	} catch {
		// no-op
	}

	if (!value) {
		disposeObserver(featureId)
		return
	}

	// Twitch reuses the same <video> element when the player transitions
	// from full to mini (route change away from a stream page). The play()
	// override in the MAIN-world script doesn't fire because Twitch never
	// calls .play() again — it just flips data-a-player-type / state.
	// Catch that case here: pause + mute any video that ends up inside a
	// mini player. MutationObserver only watches attribute changes, no
	// childList walking, so per-mutation cost stays low.
	const pauseMiniVideos = () => {
		document.querySelectorAll<HTMLVideoElement>(Player.MINI_VIDEO).forEach((v) => {
			try {
				v.pause()
				v.muted = true
			} catch {
				// detached element, ignore
			}
		})
	}

	pauseMiniVideos()
	const observer = new MutationObserver(pauseMiniVideos)
	registerObserver(featureId, observer)
	observer.observe(document.body, {
		subtree: true,
		attributes: true,
		attributeFilter: ["data-a-player-type", "data-a-player-state"],
	})
}

// HOMEPAGE
export function toggleFeaturedStreamPlayByDefault(value: boolean) {
	const featureId = "featured_stream_play_by_default"

	if (value === false) {
		disposeObserver(featureId)
		return
	}

	const url = window.location.pathname
	if (url !== TwitchURLs.Home) {
		disposeObserver(featureId)
		return
	}

	let pauseCount = 0

	const handleVideo = () => {
		const playerDiv = document.querySelector(Player.FRONTPAGE_PLAYER_WITH_VIDEO)
		if (!playerDiv) return
		const video = playerDiv.querySelector("video") as HTMLVideoElement
		if (!video) return
		if (!video.paused) {
			video.pause()
			pauseCount++
		} else if (pauseCount >= 2) {
			observer.disconnect()
			disposeObserver(featureId)
		}
	}

	const observer = new MutationObserver(handleVideo)

	registerObserver(featureId, observer)

	observer.observe(document.body, {
		attributeFilter: ["data-a-player-state", "data-a-target"],
		attributes: true,
		subtree: true,
	})

	handleVideo()

	setTimeout(() => {
		observer.disconnect()
		disposeObserver(featureId)
	}, 5000)
}

// THUMBNAILS
export function toggleThumbnailViewership(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden(Thumbnails.VIEWERSHIP_LABEL, value)
	toggleCSSHidden(Thumbnails.MEDIA_CARD_STAT, value)
}

// VIDEO PLAYER
export function toggleVideoGrayscale(value: boolean) {
	toggleCSSGrayscale(Player.COMMON_CENTERED_COLUMN, value)
	toggleCSSGrayscale(Player.VIDEO_PLAYER, value)
}

export function toggleVideoGiftButtonSection(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden(ChannelVideo.GIFT_BUTTON_SECTION, value)
}

export function toggleVideoAdWrapper(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden(ChannelVideo.BELOW_VIDEO_AD_WRAPPER, value)
}

export function toggleVideoViewership(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden(ChannelVideo.VIEWERSHIP_DIV, value)
	toggleCSSHidden(ChannelVideo.ANIMATED_VIEWERS_COUNT, value)
}

export function toggleAlwaysCloseAdblockPopup(value: boolean) {
	const featureId = "always_close_adblock_popup"
	if (value) {
		updateElement(
			() => document.querySelector(Player.RETURN_TO_STREAM_BUTTON),
			(el) => {
				if (el && !("length" in el)) {
					;(el as HTMLButtonElement).click()
					storageHandler.get<number>("adblock_popups_clicked").then((val) => {
						storageHandler.set("adblock_popups_clicked", (val || 0) + 1)
					})
				}
			},
			"no_timeout",
			"always_on",
			"toggleAlwaysCloseAdblockPopup",
			featureId
		)
	} else {
		disposeObserver(featureId)
	}
}

// TODO: only hides - resize still occurs
export function toggleBelowVideoAdSection(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden(ChannelVideo.BELOW_VIDEO_AD_SECTION, value)
}

// BELOW VIDEO PLAYER
export function toggleInfoSectionGrayscale(value: boolean) {
	toggleCSSGrayscale(ChannelInfo.ROOT, value)
}

// TODO: fix when you see this
export function toggleInfoViralClipSection(value: boolean) {
	const featureId = "hide_info_viral_clip_section"
	if (value) {
		if (!isChannelPage()) return
		updateElement(
			() => {
				const element = document.querySelector(ChannelInfo.VIRAL_CLIP_SOCIAL_BANNER)
				return element?.parentElement?.parentElement?.parentElement || null
			},
			(el) => toggleElementVisibility(el, value),
			5000,
			"stop_on_found",
			"toggleInfoViralClipSection",
			featureId
		)
	} else {
		disposeObserver(featureId)
	}
}

export function toggleInfoMonthlyRecap(value: boolean) {
	toggleCSSHidden(ChannelInfo.MONTHLY_RECAP, value)
}

// UNDER VIDEO PANEL
export function toggleInfoMonetizationButtons(value: boolean) {
	toggleCSSHidden(ChannelInfo.MONETIZATION_BITS, value)
	toggleCSSHidden(ChannelInfo.MONETIZATION_GIFT, value)
	toggleCSSHidden(ChannelInfo.MONETIZATION_CONTINUE_SUB, value)
	toggleCSSHidden(ChannelInfo.MONETIZATION_SUBSCRIBE, value)
	toggleCSSHidden(ChannelInfo.MONETIZATION_SUBSCRIBE_DROPDOWN, value)
	// SUBSCRIBE BUTTON (LOGGED OUT)
	// updateElement(
	// 	() =>
	// 		$(
	// 			"div[data-target='channel-header-right'] button[data-test-selector='subscribe-button__dropdown']"
	// 		)
	// 			.parents()
	// 			.eq(3),
	// 	($el) => toggleElementVisibility($el, value),
	// 	5000,
	// 	"stop_on_found",
	// 	"toggleInfoMonetizationButtons-sub-logged-out"
	// )
}

export function toggleComboButton(value: boolean) {
	toggleCSSHidden(ChannelInfo.COMBO_BUTTON, value)
}

export function toggleInfoAboutSection(value: boolean) {
	toggleCSSHidden(ChannelInfo.ABOUT_SECTION, value)
}

export function toggleInfoChannelPanelSection(value: boolean) {
	toggleCSSHidden(ChannelInfo.CHANNEL_PANEL_SECTION, value)
}

// FOOTER
export function toggleStickyFooter(value: boolean) {
	toggleCSSHidden(Footer.STICKY_ROOT, value)
}

export function toggleAlwaysClickRobloxFooter(value: boolean) {
	const featureId = "close_roblox_footer"
	if (value) {
		if (!isLoggedIn()) return
		if (isChannelPage()) return
		updateElement(
			() => document.querySelector(Footer.ROBLOX_DISMISS_BUTTON),
			(el) => {
				if (el && !("length" in el)) {
					;(el as HTMLButtonElement).click()
				}
			},
			5000,
			"stop_on_found",
			"toggleAlwaysClickRobloxFooter",
			featureId
		)
	} else {
		disposeObserver(featureId)
	}
}

// WEBSOCKET MANAGEMENT
export function toggleAutoManageChatWebSocket(value: boolean) {
	if (value) {
		chatWebSocketManager.enable()
	} else {
		chatWebSocketManager.disable()
	}
}

export function toggleBlockHermesWebSocket(value: boolean) {
	if (value) {
		window.dispatchEvent(new CustomEvent("__cleanTwitch_blockHermes"))
	} else {
		window.dispatchEvent(new CustomEvent("__cleanTwitch_unblockHermes"))
	}
}
