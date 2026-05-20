import { ContentScriptContext } from "#imports"
import { createTopNavPanel, TopNavPanel } from "./panel"

const TC_BUTTON_ID = "clean-twitch-tc-btn"
const TC_STYLE_ID = "clean-twitch-tc-styles"
const SEARCH_SELECTOR = 'button[aria-label="Search"]'

const TC_CSS = `
.clean-twitch-tc-wrap {
	display: inline-flex;
	align-items: center;
	margin: 0 .5rem;
}
#${TC_BUTTON_ID} {
	align-items: center;
	background-color: var(--color-background-button-text-default);
	border: none;
	border-radius: var(--border-radius-medium);
	color: var(--color-fill-button-icon);
	cursor: pointer;
	display: inline-flex;
	font-family: inherit;
	font-size: 13px;
	font-weight: 700;
	height: var(--button-size-default);
	justify-content: center;
	letter-spacing: 0.5px;
	line-height: 1;
	padding: 0;
	width: var(--button-size-default);
}
#${TC_BUTTON_ID}:hover {
	background-color: var(--color-background-button-text-hover);
	color: var(--color-fill-button-icon-hover);
}
#${TC_BUTTON_ID}:active {
	background-color: var(--color-background-button-text-active);
	color: var(--color-fill-button-icon-active);
}
`

let panel: TopNavPanel | null = null
let observer: MutationObserver | null = null
let injectQueued = false

function ensureStyles(): void {
	if (document.getElementById(TC_STYLE_ID)) return
	const style = document.createElement("style")
	style.id = TC_STYLE_ID
	style.textContent = TC_CSS
	document.head.appendChild(style)
}

function findAnchor(): Element | null {
	const search = document.querySelector(SEARCH_SELECTOR)
	if (!search) return null
	return (
		search.closest("[data-toggle-balloon-id]") ??
		search.parentElement?.parentElement ??
		search.parentElement
	)
}

function makeButton(onClick: (btn: HTMLButtonElement) => void): HTMLButtonElement {
	const btn = document.createElement("button")
	btn.id = TC_BUTTON_ID
	btn.type = "button"
	btn.setAttribute("aria-label", "Clean Twitch")
	btn.title = "Clean Twitch"
	btn.textContent = "TC"
	btn.addEventListener("click", (e) => {
		e.preventDefault()
		e.stopPropagation()
		onClick(btn)
	})
	return btn
}

async function injectButton(ctx: ContentScriptContext): Promise<void> {
	if (document.getElementById(TC_BUTTON_ID)) return
	const anchor = findAnchor()
	if (!anchor) return
	ensureStyles()
	if (!panel) panel = await createTopNavPanel(ctx)
	const btn = makeButton((trigger) => panel!.toggle(trigger))
	const wrapper = document.createElement("div")
	wrapper.className = "clean-twitch-tc-wrap"
	wrapper.appendChild(btn)
	anchor.insertAdjacentElement("afterend", wrapper)
}

function queueInject(ctx: ContentScriptContext): void {
	if (injectQueued) return
	injectQueued = true
	setTimeout(() => {
		injectQueued = false
		injectButton(ctx).catch((err) => console.warn("[clean-twitch] TC inject failed:", err))
	}, 200)
}

export function initializeTopNavMenu(ctx: ContentScriptContext): void {
	queueInject(ctx)
	if (observer) observer.disconnect()
	observer = new MutationObserver(() => {
		if (!document.getElementById(TC_BUTTON_ID)) queueInject(ctx)
	})
	observer.observe(document.body, { childList: true, subtree: true })
}
