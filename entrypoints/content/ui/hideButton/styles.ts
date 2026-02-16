export const fallbackStyles = `
.clean-twitch-block-btn {
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

.clean-twitch-block-btn:hover {
	background: #772ce8;
	transform: scale(1.2);
}

.clean-twitch-block-btn-overlay {
	background: #dbeafe;
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
	color: black;
	font-family: inherit;
}

.clean-twitch-block-btn-overlay:hover {
	background: #bfdbfe;
	transform: scale(1.05);
}

.clean-twitch-block-btn-secondary {
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.2);
}

.clean-twitch-block-btn-secondary:hover {
	background: rgba(255, 255, 255, 0.25);
}

/* Make parent container relative for absolute positioning */
a[data-a-target="tw-box-art-card-link"] {
	position: relative !important;
}

/* Always show button */
a[data-a-target="tw-box-art-card-link"] .clean-twitch-block-btn-overlay {
	opacity: 1;
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
	if (document.getElementById("clean-twitch-fallback-styles")) {
		return
	}

	const style = document.createElement("style")
	style.id = "clean-twitch-fallback-styles"
	style.textContent = fallbackStyles
	document.head.appendChild(style)
}
