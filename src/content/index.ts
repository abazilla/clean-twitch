import $ from "jquery"

import { Status } from "./types"

const strg = chrome.storage

$(function () {
	setInterval(() => {
		strg.local.get(["prime_gaming_button"], function (result) {
			const prime_gaming_button = result.prime_gaming_button as Status
			hidePrimeGamingButton(prime_gaming_button)
		})
	}, 1000)
})

function hidePrimeGamingButton(status: Status) {
	const $first_tweet_li = $(".top-nav__prime")
	$first_tweet_li.each(function (index, item) {
		// console.log(new Date().toString())
		if (status === "hide") $(this).hide()
		else $(this).show()
	})
}
