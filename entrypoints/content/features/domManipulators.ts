import $ from "jquery"
import { toggleCSSSelector, toggleElementVisibility, updateElement } from "../utils/dom"
import { TwitchURLs } from "./definitions"

export const UNIVERSAL_CLASS_NAME = "clean-twitch-clutter"
export const GREYSCALE_CLASS_NAME = "clean-twitch-greyscale"
export const UNIVERSAL_STYLE_ID = "clean-twitch-id"
export const TEST_MODE_CSS = `.${UNIVERSAL_CLASS_NAME} { background-color: red !important; border: 1px solid yellow !important; opacity: 0.5 !important; } `
export const TEST_MODE_STYLES =
	"background-color: red !important; border: 1px solid yellow !important; opacity: 0.5 !important;"
export const DISPLAY_NONE_STYLES = "display: none !important;"
export const DISPLAY_DISABLED_STYLES = "display: clean-twitch-disabled !important;"
export const DISPLAY_DISABLED_TEST = "display: clean-twitch-test-disabled !important;"
export const GREYSCALE_FILTER_OFF = "filter: grayscale(0) !important;"
export const GREYSCALE_FILTER_ON = "filter: grayscale(1) !important;"
export const GREYSCALE_DISABLED = "filter: clean-twitch-greyscale-disabled !important;"
export const GREYSCALE_CSS = `.${GREYSCALE_CLASS_NAME} { ${GREYSCALE_FILTER_OFF} } `
export const NORMAL_CSS = `.${UNIVERSAL_CLASS_NAME} { ${DISPLAY_NONE_STYLES} } `

// Can this somehow just be run on page load? i believe the whole website automatically refreshes when logging in/out
function isLoggedIn(): boolean {
	return $("body").hasClass("logged-in")
}

export function toggleTestMode(toggled: boolean) {
	const style = document.getElementById(UNIVERSAL_STYLE_ID)
	if (style) {
		const currentContent = style.textContent || ""
		if (toggled) {
			// Replace display: none !important; with test mode styling
			let testContent = currentContent.replaceAll(DISPLAY_NONE_STYLES, TEST_MODE_STYLES)
			style.textContent = testContent
		} else {
			// Replace test mode styling back to display: none
			const normalContent = currentContent.replaceAll(TEST_MODE_STYLES, DISPLAY_NONE_STYLES)
			style.textContent = normalContent
		}
	}
}

export function toggleGreyscale(toggled: boolean) {
	const style = document.getElementById(UNIVERSAL_STYLE_ID)
	if (style) {
		const currentContent = style.textContent || ""
		if (toggled) {
			let testContent = currentContent.replaceAll(GREYSCALE_FILTER_OFF, GREYSCALE_FILTER_ON)
			style.textContent = testContent
		} else {
			// Remove greyscale CSS
			let testContent = currentContent.replaceAll(GREYSCALE_FILTER_ON, GREYSCALE_FILTER_OFF)
			style.textContent = testContent
		}
	}
}

// NOTE: Elements that use updateElement are elements that load after a delay, or load on certain pages

// TOP BAR
export function hideFollowingButton(isHidden: boolean) {
	const $followingButton = $('a[data-a-target="following-link"]').parents().eq(1)
	toggleElementVisibility($followingButton, isHidden)
}

export function hideBrowseButton(isHidden: boolean) {
	const $browseButton = $('a[data-a-target="browse-link"]').parents().eq(1)
	toggleElementVisibility($browseButton, isHidden)
}

export function hideDotsButton(isHidden: boolean) {
	const $dotsButton = $('button[aria-label="More Options"]').parents().eq(3)
	toggleElementVisibility($dotsButton, isHidden)
}

export function hidePrimeGamingButton(isHidden: boolean) {
	toggleCSSSelector(".top-nav__prime", isHidden)
}

export function hideNotificationsButton(isHidden: boolean) {
	updateElement(
		() => $(".onsite-notifications").parent(),
		($el) => toggleElementVisibility($el, isHidden),
		5000,
		"stop_on_found",
		"hideNotificationsButton"
	)
}

export function hideWhispersButton(isHidden: boolean) {
	updateElement(
		() => $('button[data-a-target="whisper-box-button"]').parents().eq(3),
		($el) => toggleElementVisibility($el, isHidden),
		5000,
		"stop_on_found",
		"hideWhispersButton"
	)
}

export function hideTopBitsButton(isHidden: boolean) {
	updateElement(
		() =>
			$("nav[data-a-target='top-nav-container'] button[data-a-target='top-nav-get-bits-button']")
				.parents()
				.eq(5),
		($el) => toggleElementVisibility($el, isHidden),
		5000,
		"stop_on_found",
		"hideTopBitsButton"
	)
}

export function hideTopTurboButton(isHidden: boolean) {
	updateElement(
		() =>
			$('div[data-a-target="tw-core-button-label-text"]:contains("Go Ad-Free for Free")')
				.parents()
				.eq(4),
		($el) => toggleElementVisibility($el, isHidden),
		5000,
		"stop_on_found",
		"hideTopTurboButton"
	)
}

// LEFT SIDEBAR
export function toggleLeftSidebar(value: boolean) {
	if (value) {
		$('div[data-a-target="side-nav-bar"]').attr("style", "width: 0 !important;")
		$('div[data-a-target="side-nav-bar-collapsed"]').attr("style", "width: 0 !important;")
		$('button[aria-label="Collapse Side Nav"]').trigger("click")
		$('div[data-a-target="side-nav-bar"]').attr("style", "width: 0 !important;")
	} else {
		$('div[data-a-target="side-nav-bar"]').removeAttr("style")
		$('div[data-a-target="side-nav-bar-collapsed"]').removeAttr("style")
		$('button[aria-label="Expand Side Nav"]').trigger("click")
	}
}

export function toggleLeftSidebarStories(value: boolean) {
	toggleCSSSelector("div.storiesLeftNavSection--csO9S", value)
}

export function toggleLeftSidebarStoriesXS(value: boolean) {
	updateElement(
		() => $("div.storiesLeftNavSectionCollapsedButton--txKvw").parents().eq(2),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleLeftSidebarStoriesXS"
	)
}

export function toggleLeftSidebarViewership(value: boolean) {
	toggleCSSSelector("div[data-a-target='side-nav-live-status']", value)
}

export function toggleLeftSidebarFollowedChannels(value: boolean) {
	toggleCSSSelector("div[aria-label='Followed Channels']", value)
}

export function toggleLeftSidebarLiveChannels(value: boolean) {
	if (isLoggedIn()) {
		toggleCSSSelector("div[aria-label='Live Channels']", value)
	}
}

export function toggleLeftSidebarViewersAlsoWatch(value: boolean) {
	toggleCSSSelector("div[aria-label*='Viewers Also Watch']", value)
}

export function toggleLeftSidebarRecommendedCategories(value: boolean) {
	updateElement(
		() => $("div[aria-label='Recommended Categories']"),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleLeftSidebarRecommendedCategories"
	)
}

export function toggleLeftSidebarOfflineChannels(value: boolean) {
	updateElement(
		() =>
			$('a[data-test-selector="followed-channel"]:has(span:contains("Offline"))').parent().parent(),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_after_timeout",
		"toggleLeftSidebarOfflineChannels"
	)
}

export function toggleLeftSidebarAlwaysShowMore(value: boolean) {
	if (!value) {
		toggleCSSSelector('[data-a-target="side-nav-show-more-button"]', value)
		toggleCSSSelector('[data-a-target="side-nav-show-less-button"]', value)
	} else {
		updateElement(
			() => {
				const $buttons = $('[data-a-target="side-nav-show-more-button"]')
				if ($buttons.length > 0) {
					$buttons.each(function () {
						$(this).trigger("click")
					})
					setTimeout(() => {
						toggleLeftSidebarAlwaysShowMore(value)
						toggleElementVisibility($('[data-a-target="side-nav-show-less-button"]'), value)
					}, 100)
				} else {
					toggleElementVisibility($('[data-a-target="side-nav-show-less-button"]'), value)
				}
				return $buttons
			},
			() => {},
			5000,
			"stop_after_timeout",
			"toggleLeftSidebarAlwaysShowMore"
		)
	}
}

// RIGHT SIDEBAR
export function toggleTopGifters(value: boolean) {
	updateElement(
		() => $("div[aria-label='Expand Top Gifters Leaderboard']").parents().eq(9),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleTopGifters-leaderboard"
	)

	updateElement(
		() => $("div.bits-leaderboard-expanded-top-three-entry").parents().eq(13),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleTopGifters-entries"
	)
}

export function toggleChatMonetizationButtons(value: boolean) {
	updateElement(
		() => $('div.chat-input button[aria-label="Bits and Points Balances"]').parent(),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleChatMonetizationButtons-1"
	)
	updateElement(
		() => $('div.chat-input button[data-a-target="bits-button"]').parents().eq(1),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleChatMonetizationButtons-2"
	)
}

export function toggleCommunityHighlightStack(value: boolean) {
	updateElement(
		() => $(".community-highlight-stack__scroll-area--disable").parents().eq(1),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleCommunityHighlightStack"
	)
}

export function toggleChatBadges(value: boolean) {
	toggleCSSSelector(".chat-line__username-container > span:first-child", value)
}

// HOMEPAGE
export function toggleFeaturedStreamPlayByDefault(value: boolean) {
	const url = window.location.pathname
	if (url !== TwitchURLs.Home) return

	if (value) {
		let foundPlaying = 0 // for some reason, it plays after the first pause, but not the second
		const observer = new MutationObserver((mutations, obs) => {
			const $element = $(
				'[data-a-target="featured-item-index-0"] [data-a-target="player-play-pause-button"]'
			)
			if ($element.length) {
				if ($element.attr("data-a-player-state") === "paused") {
					if (foundPlaying >= 2) {
						observer.disconnect()
					}
				} else {
					foundPlaying++
					$element.trigger("click")
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
	toggleCSSSelector("p.kdDAY", value)
	toggleCSSSelector("div.tw-media-card-stat", value)
}

// VIDEO PLAYER
export function toggleVideoGiftButtonSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	toggleCSSSelector('div.theatre-social-panel:has(button[data-a-target="gift-button"])', value)
}

export function toggleVideoAdWrapper(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	toggleCSSSelector("div.stream-display-ad__wrapper", value)
}

export function toggleVideoViewership(value: boolean) {
	toggleCSSSelector("div.cbxBks", value)
	toggleCSSSelector('strong[data-a-target="animated-channel-viewers-count"]', value)
}

// TODO: only hides - resize still occurs
export function toggleBelowVideoAdSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	toggleCSSSelector('div[aria-label="chan-sda-upsell-third-view"]', value)
}

// BELOW VIDEO PLAYER
export function toggleInfoViralClipSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	updateElement(
		() => $("div[style*='social-sharing-badge-promo-banner']").parents().eq(2),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleInfoViralClipSection"
	)
}

// UNDER VIDEO PANEL
export function toggleInfoMonetizationButtons(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	if (isLoggedIn()) {
		// SUBSCRIBE BUTTON
		updateElement(
			() =>
				// $("div[data-target='channel-header-right'] button[data-a-target='subscribe-button']")
				// 	.parents()
				// 	.eq(6),
				$("div[data-target='channel-header-right'] button[data-a-target='top-nav-get-bits-button']")
					.parents()
					.eq(5)
					.next(),
			($el) => toggleElementVisibility($el, value),
			5000,
			"stop_on_found",
			"toggleInfoMonetizationButtons-subscribe"
		)
		// BITS BUTTON
		updateElement(
			() =>
				$("div[data-target='channel-header-right'] button[data-a-target='top-nav-get-bits-button']")
					.parents()
					.eq(5),
			($el) => toggleElementVisibility($el, value),
			5000,
			"stop_on_found",
			"toggleInfoMonetizationButtons-bits"
		)
	} else {
		// SUBSCRIBE BUTTON
		updateElement(
			() =>
				$(
					"div[data-target='channel-header-right'] button[data-test-selector='subscribe-button__dropdown']"
				)
					.parents()
					.eq(3),
			($el) => toggleElementVisibility($el, value),
			5000,
			"stop_on_found",
			"toggleInfoMonetizationButtons-sub-logged-out"
		)
	}
}

export function toggleInfoAboutSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	updateElement(
		() => $("section#live-channel-about-panel").parent(),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleInfoAboutSection"
	)
}

export function toggleInfoChannelPanelSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	updateElement(
		() => $("div.channel-panels").parent(),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleInfoChannelPanelSection"
	)
	updateElement(
		() => $('div[style="transform: scale(2); opacity: 1; background-color: rgb(0, 0, 0);"]'),
		($el) => $el.attr("style", "transform: scale(2);opacity: 1;background-color: inherit"),
		5000,
		"stop_on_found",
		"toggleInfoChannelPanelSection"
	)
}

// FOOTER
export function toggleStickyFooter(value: boolean) {
	toggleCSSSelector("#twilight-sticky-footer-root", value)
}
