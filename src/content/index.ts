import $ from "jquery"

$(function () {
	// Initial setup
	setupPrimeGamingButton()

	// Listen for changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "sync" && "prime_gaming_button" in changes) {
			const isHidden = changes.prime_gaming_button.newValue === true
			hidePrimeGamingButton(isHidden)
		}
	})
})

function setupPrimeGamingButton() {
	chrome.storage.sync.get("prime_gaming_button").then((result) => {
		const isHidden = result.prime_gaming_button === true
		hidePrimeGamingButton(isHidden)
	})
}

function hidePrimeGamingButton(isHidden: boolean) {
	const $primeButton = $(".top-nav__prime")
	$primeButton.each(function () {
		$(this).toggle(!isHidden)
	})
}
