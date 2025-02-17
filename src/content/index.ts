import $ from "jquery"
import { FeatureId, features } from "../pages/popup/types"

$(function () {
	$(document).ready(function () {
		console.log("reabdy!")
	})
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
		case "greyscale_all":
			toggleGreyscale(toggled)
			break
		case "hide_prime_gaming_button":
			hidePrimeGamingButton(toggled)
			break
		case "hide_left_sidebar":
			if (toggled) {
				$('div[data-a-target="side-nav-bar"').attr("style", "width: 0 !important;")
				$('div[data-a-target="side-nav-bar-collapsed"').attr("style", "width: 0 !important;")
				$('button[aria-label="Collapse Side Nav"]').trigger("click")
			} else {
				$('div[data-a-target="side-nav-bar"').removeAttr("style")
				$('div[data-a-target="side-nav-bar-collapsed"').removeAttr("style")
				$('button[aria-label="Expand Side Nav"]').trigger("click")
			}
			break
		case "hide_left_sidebar_stories":
			updateElement(
				{
					type: "querySelector",
					selector: "div[aria-label='Followed Channels']",

					siblingDirection: "prev",
				},
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_followed_channels":
			updateElement(
				{
					type: "querySelector",
					selector: "div[aria-label='Followed Channels']",
				},
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_live_channels":
			updateElement(
				{
					type: "querySelector",
					selector: "div[aria-label='Live Channels']",
				},
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_left_sidebar_viewers_also_watch":
			updateElement(
				{
					type: "querySelector",
					selector: "div[aria-label='Live Channels']",
					siblingDirection: "next",
				},
				withToggle(toggled, toggleElementVisibility)
			)
			break
		case "hide_sticky_footer":
			break
		case "no_recommendations":
			updateElement(
				{
					type: "id",
					selector: "twilight-sticky-footer-root",
				},
				withToggle(toggled, toggleElementVisibility)
			)
			break

		case "block_gql":
			break
		case "chat_minimal":
			break
		case "chat_only":
			break
		case "no_chat":
			break
		default:
			return
	}
}

type SelectorType = {
	type: "id" | "querySelector"
	selector: string
	siblingDirection?: "prev" | "next"
}

function getElement(options: SelectorType): Element | null {
	let element =
		options.type === "id"
			? document.getElementById(options.selector)
			: document.querySelector(options.selector)

	if (options.siblingDirection === "next") {
		element = element?.nextElementSibling || null
	} else if (options.siblingDirection === "prev") {
		element = element?.previousElementSibling || null
	}

	return element
}

function updateElementAsync(options: SelectorType, action: (element: Element) => void) {
	// Create observer to watch for changes
	const observer = new MutationObserver((mutations, obs) => {
		const element = getElement(options)
		console.log(options.selector + options.siblingDirection)
		if (element) {
			action(element)
			obs.disconnect() // Stop observing once we've found and handled the element
		}
	})

	// Start observing the document for changes
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})
}

// Curry the toggled parameter
const withToggle =
	(toggled: boolean, fn: (el: Element, toggled: boolean) => void) => (el: Element) => {
		fn(el, toggled)
	}

// Curry the toggled parameter for element updates
const updateElement = (options: SelectorType, action: (element: Element) => void) => {
	const element = getElement(options)
	if (element) action(element)
	else updateElementAsync(options, action)
}

function toggleGreyscale(toggled: boolean) {
	toggled
		? document.documentElement.setAttribute("style", "filter: grayscale(1) !important;")
		: document.documentElement.removeAttribute("style")
}

function toggleElementVisibility(element: Element, toggled: boolean) {
	toggled
		? element.setAttribute("style", "display: none !important;")
		: element.removeAttribute("style")
}

function toggleElementWidth(element: Element, toggled: boolean) {
	toggled ? element.setAttribute("style", "width: 0 !important;") : element.removeAttribute("style")
}

function hidePrimeGamingButton(isHidden: boolean) {
	const $primeButton = $(".top-nav__prime")
	$primeButton.each(function () {
		$(this).toggle(!isHidden)
	})
}
