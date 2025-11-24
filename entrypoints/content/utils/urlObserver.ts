import { handleModeSwitch } from "../featureController"
import { storageHandler } from "./storageHandler"

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

export async function handleUrlChange(lastUrl: string) {
	console.log("URL changed to:", window.location.href)
	// await initializeStylesAndFeatures()
	let isSimpleMode = await storageHandler.get<boolean>("is_simple_mode")
	if (isSimpleMode === undefined || isSimpleMode === null) {
		await storageHandler.set("is_simple_mode", true)
		isSimpleMode = true
	}
	await handleModeSwitch(isSimpleMode)
}
