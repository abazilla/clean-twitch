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
} from "../utils/cssManipulators"
import { toggleElementVisibility, updateElement } from "../utils/jsManipulators"
import { storageHandler } from "../utils/storageHandler"
import { chatWebSocketManager } from "../utils/websocketManager"
import { isChannelPage, TwitchURLs } from "./definitions"

const isLoggedIn = (): boolean =>
	document.querySelector('button[data-a-target="login-button"]') === null

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
	toggleCSSGrayscale('nav[data-a-target="top-nav-container"]', value)
}

export function hideFollowingButton(isHidden: boolean) {
	toggleCSSHidden('div.Layout-sc-1xcs6mc-0.fRzsnK:has(a[data-a-target="following-link"])', isHidden)
}

export function hideRobloxButton(isHidden: boolean) {
	toggleCSSHidden('div.Layout-sc-1xcs6mc-0.fRzsnK:has(a[data-a-target="roblox-link"])', isHidden)
}

export function hideBrowseButton(isHidden: boolean) {
	toggleCSSHidden('div.Layout-sc-1xcs6mc-0.fRzsnK:has(a[data-a-target="browse-link"])', isHidden)
}

export function hideDotsButton(isHidden: boolean) {
	toggleCSSHidden('div.Layout-sc-1xcs6mc-0.jNQxNh:has(button[aria-label="More Options"])', isHidden)
}

export function hidePrimeGamingButton(isHidden: boolean) {
	toggleCSSHidden(".top-nav__prime", isHidden)
}

export function hideNotificationsButton(isHidden: boolean) {
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.VxLcr:has(.onsite-notifications)", isHidden)
}

export function hideWhispersButton(isHidden: boolean) {
	toggleCSSHidden(
		".Layout-sc-1xcs6mc-0.VxLcr:has(button[data-a-target='whisper-box-button'])",
		isHidden
	)
}

export function hideTopBitsButton(isHidden: boolean) {
	toggleCSSHidden(
		".Layout-sc-1xcs6mc-0.VxLcr:has(button[data-a-target='top-nav-get-bits-button'])",
		isHidden
	)
}

export function hideTopTurboButton(isHidden: boolean) {
	toggleCSSHidden(
		'.Layout-sc-1xcs6mc-0.VxLcr:has(div[data-a-target="tw-core-button-label-text"])',
		isHidden
	)
}

// LEFT SIDEBAR
export function toggleLeftSidebar(value: boolean) {
	if (value) {
		const sideNavBar = document.querySelector('div[data-a-target="side-nav-bar"]') as HTMLElement
		const sideNavBarCollapsed = document.querySelector(
			'div[data-a-target="side-nav-bar-collapsed"]'
		) as HTMLElement
		const collapseButton = document.querySelector(
			'button[aria-label="Collapse Side Nav"]'
		) as HTMLButtonElement

		if (sideNavBar) sideNavBar.style.cssText = "width: 0 !important;"
		if (sideNavBarCollapsed) sideNavBarCollapsed.style.cssText = "width: 0 !important;"
		if (collapseButton) collapseButton.click()
		if (sideNavBar) sideNavBar.style.cssText = "width: 0 !important;"
	} else {
		const sideNavBar = document.querySelector('div[data-a-target="side-nav-bar"]') as HTMLElement
		const sideNavBarCollapsed = document.querySelector(
			'div[data-a-target="side-nav-bar-collapsed"]'
		) as HTMLElement
		const expandButton = document.querySelector(
			'button[aria-label="Expand Side Nav"]'
		) as HTMLButtonElement

		if (sideNavBar) sideNavBar.removeAttribute("style")
		if (sideNavBarCollapsed) sideNavBarCollapsed.removeAttribute("style")
		if (expandButton) expandButton.click()
	}
}

export function toggleSideNavGrayscale(value: boolean) {
	toggleCSSGrayscale('div[data-a-target="side-nav-bar"]', value)
	toggleCSSGrayscale('div[data-a-target="side-nav-bar-collapsed"]', value)
}

export function toggleLeftSidebarStories(value: boolean) {
	toggleCSSHidden("div.storiesLeftNavSection--csO9S", value)
}

// Seems like it was removed
// export function toggleLeftSidebarStoriesXS(value: boolean) {
// 	updateElement(
// 		() => $("div.storiesLeftNavSectionCollapsedButton--txKvw").parents().eq(2),
// 		($el) => toggleElementVisibility($el, value),
// 		5000,
// 		"stop_on_found",
// 		"toggleLeftSidebarStoriesXS"
// 	)
// }

export function toggleLeftSidebarViewership(value: boolean) {
	toggleCSSHidden("div[data-a-target='side-nav-live-status']", value)
}

export function toggleLeftSidebarFollowedChannels(value: boolean) {
	toggleCSSHidden("div[aria-label='Followed Channels']", value)
}

export function toggleLeftSidebarLiveChannels(value: boolean) {
	const val = isLoggedIn() ? value : false
	toggleCSSHidden("div[aria-label='Live Channels']", val)
}

export function toggleLeftSidebarViewersAlsoWatch(value: boolean) {
	const val = isLoggedIn() ? value : false
	toggleCSSHidden("div[aria-label*='Viewers Also Watch']", val)
}

export function toggleLeftSidebarRecommendedCategories(value: boolean) {
	const val = isLoggedIn() ? value : false
	toggleCSSHidden("div[aria-label='Recommended Categories']", val)
}

export function toggleLeftSidebarOfflineChannels(value: boolean) {
	toggleCSSHidden('div[class*="ScTransitionBase"]:has(.side-nav-card__avatar--offline)', value)
}

export function toggleLeftSidebarAlwaysShowMore(value: boolean) {
	toggleCSSHidden('[data-a-target="side-nav-show-more-button"]', value)
	toggleCSSHidden('[data-a-target="side-nav-show-less-button"]', value)
	if (value) {
		updateElement(
			() => document.querySelectorAll('[data-a-target="side-nav-show-more-button"]'),
			(buttons) => {
				if (buttons && "length" in buttons && buttons.length > 0) {
					buttons.forEach((button) => {
						;(button as HTMLButtonElement).click()
					})
					setTimeout(() => {
						toggleLeftSidebarAlwaysShowMore(value)
						// toggleElementVisibility(document.querySelectorAll('[data-a-target="side-nav-show-less-button"]'), value)
					}, 100)
				} else {
					// toggleElementVisibility(document.querySelectorAll('[data-a-target="side-nav-show-less-button"]'), value)
				}
			},
			5000,
			"stop_after_timeout",
			"toggleLeftSidebarAlwaysShowMore"
		)
	}
}

// RIGHT SIDEBAR
export function toggleTopGifters(value: boolean) {
	toggleCSSHidden(
		'div.ScTransitionBase-sc-hx4quq-0.hhLPgp.tw-transition:has(button[aria-label="Expand Top Gifters Leaderboard"])',
		value
	)
}

export function toggleChatMonetizationButtons(value: boolean) {
	toggleCSSHidden(
		".InjectLayout-sc-1i43xsx-0.iDMNUO:has(button[data-a-target='bits-button'])",
		value
	)
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.eCNebZ:has(.channel-points-icon)", value)
	toggleCSSHidden('div[data-test-selector="bits-balance-string"]', value)
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.gLwKGU:has(.ScNewItemIndicator-sc-1udtibe-0)", value)
}

export function toggleCommunityHighlightStack(value: boolean) {
	toggleCSSHidden(
		".Layout-sc-1xcs6mc-0.cEllaX:has(div.community-highlight-stack__scroll-area--disable)",
		value
	)
}

export function toggleChatGrayscale(value: boolean) {
	toggleCSSGrayscale(".channel-root__right-column", value)
}

export function toggleChatBadges(value: boolean) {
	toggleCSSHidden(".chat-line__username-container > span:first-child", value)
}

export function toggleChatClipBestMoments(value: boolean) {
	toggleCSSHidden('div.cMeiZH:has(div[aria-label="Expand Top Clips Leaderboard"])', value)
}

// HOMEPAGE
export function toggleFeaturedStreamPlayByDefault(value: boolean) {
	const url = window.location.pathname
	if (url !== TwitchURLs.Home) return

	if (value) {
		let foundPlaying = 0 // for some reason, it plays after the first pause, but not the second
		const observer = new MutationObserver((_mutations, obs) => {
			const element = document.querySelector(
				'[data-a-target="featured-item-index-0"] [data-a-target="player-play-pause-button"]'
			) as HTMLButtonElement
			if (element) {
				if (element.getAttribute("data-a-player-state") === "paused") {
					if (foundPlaying >= 2) {
						observer.disconnect()
					}
				} else {
					foundPlaying++
					element.click()
				}
			}
		})

		observer.observe(document.body, {
			attributeFilter: ["data-a-player-state", "data-a-target"],
			attributes: true,
			subtree: true,
			childList: true,
		})

		setTimeout(() => {
			// console.log("timing out observer")
			observer.disconnect()
		}, 5000)
	}
}

// THUMBNAILS
export function toggleThumbnailViewership(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden("p.kdDAY", value)
	toggleCSSHidden("div.tw-media-card-stat", value)
}

// VIDEO PLAYER
export function toggleVideoGrayscale(value: boolean) {
	toggleCSSGrayscale("div.common-centered-column", value)
	toggleCSSGrayscale('div[data-a-target="video-player"]', value)
}

export function toggleVideoGiftButtonSection(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden('div.theatre-social-panel:has(button[data-a-target="gift-button"])', value)
}

export function toggleVideoAdWrapper(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden("div.stream-display-ad__wrapper", value)
}

export function toggleVideoViewership(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden("div.cbxBks", value)
	toggleCSSHidden('strong[data-a-target="animated-channel-viewers-count"]', value)
}

export function toggleAlwaysCloseAdblockPopup(_value: boolean) {
	updateElement(
		() => document.querySelector('button[aria-label="Return to stream"]'),
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
		"toggleAlwaysCloseAdblockPopup"
	)
}

export function toggleAlwaysClickRobloxFooter(_value: boolean) {
	if (!isLoggedIn()) return
	if (isChannelPage()) return
	updateElement(
		() => document.querySelector('button[id*="robloxBannerDismiss"]'),
		(el) => {
			if (el && !("length" in el)) {
				;(el as HTMLButtonElement).click()
			}
		},
		5000,
		"stop_on_found",
		"toggleAlwaysClickRobloxFooter"
	)
}

// TODO: only hides - resize still occurs
export function toggleBelowVideoAdSection(value: boolean) {
	if (!isChannelPage()) return
	toggleCSSHidden('div[aria-label="chan-sda-upsell-third-view"]', value)
}

// BELOW VIDEO PLAYER
export function toggleInfoSectionGrayscale(value: boolean) {
	toggleCSSGrayscale("div.channel-root__info", value)
}

// TODO: fix when you see this
export function toggleInfoViralClipSection(value: boolean) {
	if (!isChannelPage()) return
	updateElement(
		() => {
			const element = document.querySelector("div[style*='social-sharing-badge-promo-banner']")
			return element?.parentElement?.parentElement?.parentElement || null
		},
		(el) => toggleElementVisibility(el, value),
		5000,
		"stop_on_found",
		"toggleInfoViralClipSection"
	)
}

export function toggleInfoMonthlyRecap(value: boolean) {
	toggleCSSHidden("div.Layout-sc-1xcs6mc-0.dHnDFr:has(div.ScCalloutMessage-sc-23utpo-0)", value)
}

// UNDER VIDEO PANEL
export function toggleInfoMonetizationButtons(value: boolean) {
	toggleCSSHidden(
		".Layout-sc-1xcs6mc-0.gWaIYG:has(button[data-a-target='top-nav-get-bits-button'])",
		value
	)
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.kaAEut:has(button[data-a-target='gift-button'])", value)
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.kaAEut:has(button[aria-label='Continue Sub'])", value)
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.PiZST:has(button[data-a-target='subscribe-button'])", value)
	toggleCSSHidden(
		".Layout-sc-1xcs6mc-0.PiZST:has(button[data-a-target='subscribe-button__dropdown'])",
		value
	)
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
	toggleCSSHidden("div.gEvECC:has(button[aria-label='Open Combos modal'])", value)
}

export function toggleInfoAboutSection(value: boolean) {
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.hisUmW:has(.channel-panels)", value)
}

export function toggleInfoChannelPanelSection(value: boolean) {
	toggleCSSHidden(".Layout-sc-1xcs6mc-0.hisUmW > div:nth-child(2):has(.channel-panels)", value)
}

// FOOTER
export function toggleStickyFooter(value: boolean) {
	toggleCSSHidden("#twilight-sticky-footer-root", value)
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
