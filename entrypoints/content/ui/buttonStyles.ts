// Twitch-like button styles that integrate naturally with the site
export const buttonStyles = {
	// Primary block button (red/negative action)
	block: [
		"tw-button",
		"tw-button--size-small",
		"tw-core-button",
		"tw-core-button--small",
		"tw-core-button--destructive",
	].join(" "),

	// Secondary block button (more subtle)
	blockSecondary: [
		"tw-button",
		"tw-button--size-small",
		"tw-core-button",
		"tw-core-button--small",
		"tw-core-button--secondary",
	].join(" "),

	// Icon-only button
	blockIcon: [
		"tw-button",
		"tw-button--size-small",
		"tw-core-button",
		"tw-core-button--small",
		"tw-core-button--icon-only",
	].join(" "),

	// Minimal text button
	blockMinimal: ["tw-button", "tw-button--text", "tw-button--size-small"].join(" "),
}

// Fallback styles if Twitch classes don't exist
export const fallbackStyles = `
.hide-twitch-block-btn {
	background: #9147ff;
	border: none;
	border-radius: 4px;
	color: white;
	cursor: pointer;
	font-size: 12px;
	font-weight: 600;
	padding: 4px 8px;
	transition: all 0.1s ease;
	text-transform: uppercase;
	position: relative;
	z-index: 10;
}

.hide-twitch-block-btn:hover {
	background: #772ce8;
	transform: scale(1.05);
}

.hide-twitch-block-btn-destructive {
	background: #eb0400;
	border: none;
	border-radius: 4px;
	margin: .5rem .6rem;
	padding: 3px 0.8em;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.75em;
	position: absolute;
	top: 4px;
	right: 4px;
	text-transform: uppercase;
	color: white;
	font-family: inherit;
}

.hide-twitch-block-btn-destructive:hover {
	background: #bf0300;
	transform: scale(1.1);
}

.hide-twitch-block-btn-secondary {
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.2);
}

.hide-twitch-block-btn-secondary:hover {
	background: rgba(255, 255, 255, 0.25);
}

/* Make parent container relative for absolute positioning */
a[data-a-target="tw-box-art-card-link"] {
	position: relative !important;
}

/* Always show button */
a[data-a-target="tw-box-art-card-link"] .hide-twitch-block-btn-destructive {
	opacity: 0.75;
	transition: opacity 0.2s ease;
}

/* Move NEW pills to top-left to avoid conflict with close button */
a[data-a-target="tw-box-art-card-link"] .game-card__new-pill {
	position: absolute !important;
	top: 4px !important;
	left: 4px !important;
	right: auto !important;
	z-index: 5;
}
`

// Inject fallback styles into page
export function injectFallbackStyles(): void {
	if (document.getElementById("hide-twitch-fallback-styles")) {
		return
	}

	const style = document.createElement("style")
	style.id = "hide-twitch-fallback-styles"
	style.textContent = fallbackStyles
	document.head.appendChild(style)
}
