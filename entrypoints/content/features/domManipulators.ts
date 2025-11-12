import $ from "jquery"
import { toggleElementVisibility, updateElement } from "../utils/dom"
import { TwitchURLs } from "./definitions"

export const UNIVERSAL_CLASS_NAME = "clean-twitch-clutter"
export const UNIVERSAL_STYLE_ID = "clean-twitch-id"
export const TEST_MODE_CSS = `.${UNIVERSAL_CLASS_NAME} { background-color: red !important; border: 1px solid yellow !important; opacity: 0.5 !important; } `
export const NORMAL_CSS = `.${UNIVERSAL_CLASS_NAME} { display: none !important; } `

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
			const testContent = currentContent.replace(
				/display:\s*none\s*!important;/g,
				"background-color: red !important; border: 1px solid yellow !important; opacity: 0.5 !important;"
			)
			style.textContent = testContent
		} else {
			// Replace test mode styling back to display: none
			const normalContent = currentContent.replace(
				/background-color:\s*red\s*!important;\s*border:\s*1px\s*solid\s*yellow\s*!important;\s*opacity:\s*0\.5\s*!important;/g,
				"display: none !important;"
			)
			style.textContent = normalContent
		}
	}
}

export function toggleGreyscale(toggled: boolean) {
	toggled
		? $("html").attr("style", "filter: grayscale(1) !important;")
		: $("html").removeAttr("style")
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
	const $primeButton = $(".top-nav__prime")
	toggleElementVisibility($primeButton, isHidden)
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

// TODO: check which can just use jquery toggle to hide
export function toggleLeftSidebarStories(value: boolean) {
	updateElement(
		() => $("div.storiesLeftNavSection--csO9S"),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleLeftSidebarStories"
	)
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

export function toggleLeftSidebarFollowedChannels(value: boolean) {
	updateElement(
		() => $("div[aria-label='Followed Channels']"),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleLeftSidebarFollowedChannels"
	)
}

export function toggleLeftSidebarLiveChannels(value: boolean) {
	if (isLoggedIn()) {
		updateElement(
			() => $("div[aria-label='Live Channels']"),
			($el) => toggleElementVisibility($el, value),
			5000,
			"stop_on_found",
			"toggleLeftSidebarLiveChannels"
		)
	}
}

export function toggleLeftSidebarViewersAlsoWatch(value: boolean) {
	updateElement(
		() => $("div[aria-label*='Viewers Also Watch']"),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleLeftSidebarViewersAlsoWatch"
	)
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
		toggleElementVisibility($('[data-a-target="side-nav-show-less-button"]'), value)
		toggleElementVisibility($('[data-a-target="side-nav-show-more-button"]'), value)
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

// VIDEO PLAYER
export function toggleVideoGiftButtonSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	updateElement(
		() => $('div.theatre-social-panel:has(button[data-a-target="gift-button"])'),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleVideoGiftButtonSection"
	)
}

export function toggleVideoAdWrapper(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	updateElement(
		() => $("div.stream-display-ad__wrapper"),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleVideoAdWrapper"
	)
}

// TODO: only hides - resize still occurs
export function toggleBelowVideoAdSection(value: boolean) {
	const url = window.location.pathname
	if (Object.values(TwitchURLs).includes(url as TwitchURLs)) return
	updateElement(
		() => $('div[aria-label="chan-sda-upsell-third-view"]'),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleBelowVideoAdSection"
	)
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
	updateElement(
		() => $("#twilight-sticky-footer-root"),
		($el) => toggleElementVisibility($el, value),
		5000,
		"stop_on_found",
		"toggleStickyFooter"
	)
}
