import $ from "jquery"
import { toggleElementVisibility, updateElement } from "../utils/dom"

export function toggleGreyscale(toggled: boolean) {
	toggled
		? $("html").attr("style", "filter: grayscale(1) !important;")
		: $("html").removeAttr("style")
}

export function hidePrimeGamingButton(isHidden: boolean) {
	const $primeButton = $(".top-nav__prime")
	$primeButton.each(function () {
		$(this).toggle(!isHidden)
	})
}

export function toggleLeftSidebar(value: boolean) {
	if (value) {
		$('div[data-a-target="side-nav-bar"').attr("style", "width: 0 !important;")
		$('div[data-a-target="side-nav-bar-collapsed"').attr("style", "width: 0 !important;")
		$('button[aria-label="Collapse Side Nav"]').trigger("click")
		$('div[data-a-target="side-nav-bar"').attr("style", "width: 0 !important;")
	} else {
		$('div[data-a-target="side-nav-bar"').removeAttr("style")
		$('div[data-a-target="side-nav-bar-collapsed"').removeAttr("style")
		$('button[aria-label="Expand Side Nav"]').trigger("click")
	}
}

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
		() => $("div[aria-label='Live Channels']").next(),
		($el) => toggleElementVisibility($el, value)
	)
}

export function toggleChatHighlights(value: boolean) {
	updateElement(
		() => $("div.chat-room__content > div").not("[class='Layout-sc-1xcs6mc-0']").eq(0),
		($el) => toggleElementVisibility($el, value)
	)
}

export function toggleStickyFooter(value: boolean) {
	updateElement(
		() => $("#twilight-sticky-footer-root"),
		($el) => toggleElementVisibility($el, value)
	)
}

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
