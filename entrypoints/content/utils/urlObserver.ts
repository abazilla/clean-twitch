import $ from "jquery"
import { UNIVERSAL_CLASS_NAME } from "../features/domManipulators"

export function setupUrlChangeListener() {
	let lastUrl = window.location.href

	const observer = new MutationObserver(function () {
		if (window.location.href !== lastUrl) {
			lastUrl = window.location.href
			handleUrlChange(lastUrl)
		}
	})

	observer.observe(document, {
		subtree: true,
		childList: true,
	})

	window.addEventListener("popstate", () => handleUrlChange(lastUrl))

	const originalPushState = history.pushState
	history.pushState = function (...args) {
		originalPushState.apply(this, args)
		handleUrlChange(lastUrl)
	}

	const originalReplaceState = history.replaceState
	history.replaceState = function (...args) {
		originalReplaceState.apply(this, args)
		handleUrlChange(lastUrl)
	}
}

export function handleUrlChange(lastUrl: string) {
	// console.log("URL changed to:", window.location.href)
	// if (lastUrl.includes("search")) $("div.search-results")?.removeClass(UNIVERSAL_CLASS_NAME) || $()
	// TODO: which component is this
	if (lastUrl.includes("/directory/category/"))
		$("div.switcher-shell__container--grid")?.removeClass(UNIVERSAL_CLASS_NAME) || $()
}
