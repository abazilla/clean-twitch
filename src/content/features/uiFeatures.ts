import $ from "jquery"
import { toggleElementVisibility, updateElement } from "../utils/dom"

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
		($el) => toggleElementVisibility($el, isHidden)
	)
}

export function hideWhispersButton(isHidden: boolean) {
	updateElement(
		() => $('button[data-a-target="whisper-box-button"]').parents().eq(3),
		($el) => toggleElementVisibility($el, isHidden)
	)
}

export function hideTopBitsButton(isHidden: boolean) {
	updateElement(
		() => $('button[data-a-target="top-nav-get-bits-button"]').parents().eq(5),
		($el) => toggleElementVisibility($el, isHidden)
	)
}

export function hideTopTurboButton(isHidden: boolean) {
	updateElement(
		() =>
			$('div[data-a-target="tw-core-button-label-text"]:contains("Go Ad-Free for Free")')
				.parents()
				.eq(4),
		($el) => toggleElementVisibility($el, isHidden)
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
		($el) => toggleElementVisibility($el, value)
	)
}

export function toggleLeftSidebarFollowedChannels(value: boolean) {
	updateElement(
		() => $("div[aria-label='Followed Channels']"),
		($el) => toggleElementVisibility($el, value)
	)
}

export function toggleLeftSidebarLiveChannels(value: boolean) {
	updateElement(
		() => $("div[aria-label='Live Channels']"),
		($el) => toggleElementVisibility($el, value)
	)
}

export function toggleLeftSidebarViewersAlsoWatch(value: boolean) {
	updateElement(
		() => $("div[aria-label*='Viewers Also Watch']"),
		($el) => toggleElementVisibility($el, value)
	)
}

export function toggleLeftSidebarRecommendedCategories(value: boolean) {
	updateElement(
		() => $("div[aria-label='Recommended Categories']"),
		($el) => toggleElementVisibility($el, value)
	)
}

// RIGHT SIDEBAR
export function toggleChatHighlights(value: boolean) {
	updateElement(
		() => $("div.chat-room__content > div").not("[class='Layout-sc-1xcs6mc-0']").eq(0),
		($el) => toggleElementVisibility($el, value)
	)
}

// HOMEPAGE
export function toggleFeaturedStreamPlayByDefault(value: boolean) {
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
			console.log("timing out observer")
			observer.disconnect()
		}, 10000)
	}
}

// FOOTER
export function toggleStickyFooter(value: boolean) {
	updateElement(
		() => $("#twilight-sticky-footer-root"),
		($el) => toggleElementVisibility($el, value)
	)
}
