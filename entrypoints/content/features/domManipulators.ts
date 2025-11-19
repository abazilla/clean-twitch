import $ from "jquery"
import {
	BLOCKED_CATEGORIES_STYLE_ID,
	BLOCKED_CHANNELS_STYLE_ID,
	DISPLAY_NONE_STYLES,
	GRAYSCALE_FILTER_OFF,
	GRAYSCALE_FILTER_ON,
	TEST_MODE_STYLES,
	toggleCSSGrayscale,
	toggleCSSHidden,
	UNIVERSAL_STYLE_ID_CSS,
	UNIVERSAL_STYLE_ID_JS,
} from "../utils/cssManipulators"
import { toggleElementVisibility, updateElement } from "../utils/jsManipulators"
import { TwitchURLs } from "./definitions"

// Can this somehow just be run on page load? i believe the whole website automatically refreshes when logging in/out
function isLoggedIn(): boolean {
	return $("body").hasClass("logged-in")
}

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
				testContent = testContent.replaceAll(GRAYSCALE_FILTER_ON, GRAYSCALE_FILTER_OFF)
				style.textContent = testContent
			} else {
				// Replace test mode styling back to display: none
				let normalContent = currentContent.replaceAll(TEST_MODE_STYLES, DISPLAY_NONE_STYLES)
				normalContent = normalContent.replaceAll(GRAYSCALE_FILTER_OFF, GRAYSCALE_FILTER_ON)
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
	toggleCSSHidden(".top-nav__prime", isHidden)
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

export function toggleSideNavGrayscale(value: boolean) {
	toggleCSSGrayscale('div[data-a-target="side-nav-bar"]', value)
}

export function toggleLeftSidebarStories(value: boolean) {
	toggleCSSHidden("div.storiesLeftNavSection--csO9S", value)
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
	toggleCSSHidden("div[data-a-target='side-nav-live-status']", value)
}

export function toggleLeftSidebarFollowedChannels(value: boolean) {
	toggleCSSHidden("div[aria-label='Followed Channels']", value)
}

export function toggleLeftSidebarLiveChannels(value: boolean) {
	if (isLoggedIn()) {
		toggleCSSHidden("div[aria-label='Live Channels']", value)
	}
}

export function toggleLeftSidebarViewersAlsoWatch(value: boolean) {
	toggleCSSHidden("div[aria-label*='Viewers Also Watch']", value)
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
		toggleCSSHidden('[data-a-target="side-nav-show-more-button"]', value)
		toggleCSSHidden('[data-a-target="side-nav-show-less-button"]', value)
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

export function toggleChatGrayscale(value: boolean) {
	toggleCSSGrayscale(".channel-root__right-column", value)
}

export function toggleChatBadges(value: boolean) {
	toggleCSSHidden(".chat-line__username-container > span:first-child", value)
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
	toggleCSSHidden("p.kdDAY", value)
	toggleCSSHidden("div.tw-media-card-stat", value)
}

// VIDEO PLAYER
export function toggleVideoGrayscale(value: boolean) {
	toggleCSSGrayscale('div[data-a-target="video-player"]', value)
}

export function toggleVideoGiftButtonSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	toggleCSSHidden('div.theatre-social-panel:has(button[data-a-target="gift-button"])', value)
}

export function toggleVideoAdWrapper(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	toggleCSSHidden("div.stream-display-ad__wrapper", value)
}

export function toggleVideoViewership(value: boolean) {
	toggleCSSHidden("div.cbxBks", value)
	toggleCSSHidden('strong[data-a-target="animated-channel-viewers-count"]', value)
}

// TODO: only hides - resize still occurs
export function toggleBelowVideoAdSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	toggleCSSHidden('div[aria-label="chan-sda-upsell-third-view"]', value)
}

// BELOW VIDEO PLAYER
export function toggleInfoSectionGrayscale(value: boolean) {
	toggleCSSGrayscale("div.channel-root__info", value)
}

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
	toggleCSSHidden("#twilight-sticky-footer-root", value)
}
