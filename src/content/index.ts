import $ from "jquery"
import { FeatureId, features } from "../pages/popup/types"

$(function () {
	// Initial setup
	features.forEach((f) => {
		chrome.storage.sync.get(f.id).then((result) => {
			const toggled = result[f.id] === true
			handleToggle(f.id, true, toggled)
		})
		if (f.children.length > 0) {
			f.children.forEach((cf) => {
				chrome.storage.sync.get(cf.id).then((result) => {
					const toggled = result[cf.id] === true
					handleToggle(cf.id, true, toggled)
				})
			})
		}
	})
	// $(`nav#side-nav div[role='group']:has(a[data-test-selector='recommended-channel'])`).attr(
	// 	"style",
	// 	"display: none !important;"
	// )

	// Listen for changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "sync") {
			const key = Object.keys(changes)[0] as FeatureId
			handleToggle(key, false, changes[key].newValue)
		}
	})
})

function handleToggle(id: FeatureId, onLoad: boolean, toggled: boolean) {
	switch (id) {
		case "block_gql":
			break
		case "greyscale_all":
			toggleGreyscale(toggled)
			break
		case "prime_gaming_button":
			hidePrimeGamingButton(toggled)
			break
		case "hide_left_sidebar":
			if (toggled) {
				// document.getElementById("side-nav")?.setAttribute("style", "display: none !important;")
				const btn = document.querySelector('button[aria-label="Collapse Side Nav"]') as HTMLElement
				document
					.querySelector('div[data-a-target="side-nav-bar"')
					?.setAttribute("style", "width: 0 !important;")

				btn.click()
			} else {
				// document.getElementById("side-nav")?.removeAttribute("style")
				const btn = document.querySelector('button[aria-label="Expand Side Nav"]') as HTMLElement
				document
					.querySelector('div[data-a-target="side-nav-bar-collapsed"')
					?.removeAttribute("style")
				btn.click()
			}
			break
		case "chat_minimal":
			break
		case "chat_only":
			break
		case "no_chat":
			break
		case "no_recommendations":
			break
		case "hide_left_sidebar_stories":
			toggleElementVisibility("div[aria-label='Followed Channels']", onLoad, toggled, "prev")
			break
		case "hide_left_sidebar_followed_channels":
			toggleElementVisibility("div[aria-label='Followed Channels']", onLoad, toggled)
			break
		case "hide_left_sidebar_live_channels":
			toggleElementVisibility("div[aria-label='Live Channels']", onLoad, toggled)
			break
		case "hide_left_sidebar_viewers_also_watch":
			toggleElementVisibility("div[aria-label='Live Channels']", onLoad, toggled, "next")
			break
		default:
			return
	}
}

function toggleGreyscale(toggled: boolean) {
	toggled
		? document.documentElement.setAttribute("style", "filter: grayscale(1) !important;")
		: document.documentElement.removeAttribute("style")
}

function toggleElementVisibility(
	selector: string,
	onLoad: boolean,
	toggled: boolean,
	siblingDirection: "prev" | "next" | null = null
) {
	const action = () => {
		let element = document.querySelector(selector)

		if (siblingDirection === "next") {
			element = element?.nextElementSibling || null
		} else if (siblingDirection === "prev") {
			element = element?.previousElementSibling || null
		}

		if (element) {
			toggled
				? element.setAttribute("style", "display: none !important;")
				: element.removeAttribute("style")
		}
	}

	onLoad ? setTimeout(action, 3000) : action()
}

function hidePrimeGamingButton(isHidden: boolean) {
	const $primeButton = $(".top-nav__prime")
	$primeButton.each(function () {
		$(this).toggle(!isHidden)
	})
}
