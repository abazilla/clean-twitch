import { ContentScriptContext } from "#imports"
import App from "@/entrypoints/popup/App"
import { createRoot, Root } from "react-dom/client"
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root"

export interface TopNavPanel {
	toggle: (trigger: HTMLElement) => void
	close: () => void
}

export async function createTopNavPanel(ctx: ContentScriptContext): Promise<TopNavPanel> {
	let isOpen = false
	let outsideHandler: ((e: MouseEvent) => void) | null = null
	let wrapper: HTMLDivElement | null = null

	function getWrapper(): HTMLDivElement {
		if (!wrapper) {
			wrapper = document.createElement("div")
			wrapper.id = "clean-twitch-menu-wrapper"
			// Append to documentElement (html) so any `zoom`/`transform` on body doesn't shrink us.
			document.documentElement.appendChild(wrapper)
		}
		return wrapper
	}

	const ui = await createShadowRootUi<Root>(ctx, {
		name: "clean-twitch-menu",
		position: "inline",
		anchor: () => getWrapper(),
		append: "last",
		mode: "open",
		isolateEvents: true,
		onMount: (container) => {
			const root = createRoot(container)
			root.render(<App />)
			return root
		},
		onRemove: (root) => root?.unmount(),
	})

	function position(trigger: HTMLElement) {
		const w = getWrapper()
		const rect = trigger.getBoundingClientRect()
		const visualWidth = 448
		const visualHeight = 600
		// Tailwind sizes inside shadow root use `rem`, which resolves against the
		// host document root font-size — not 16px. Compensate via CSS `zoom` on the
		// wrapper. Zoom also scales the wrapper's fixed-position offsets, so divide
		// the target viewport coords by scale to land at the intended pixel.
		const docFs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
		const scale = 16 / docFs
		const layoutWidth = visualWidth / scale
		const layoutHeight = visualHeight / scale
		const btnCenter = rect.left + rect.width / 2
		const left = Math.min(
			Math.max(8, btnCenter - visualWidth / 2),
			window.innerWidth - visualWidth - 8
		)
		const top = rect.bottom + 8
		w.style.position = "fixed"
		w.style.top = `${top / scale}px`
		w.style.left = `${left / scale}px`
		w.style.width = `${layoutWidth}px`
		w.style.height = `${layoutHeight}px`
		w.style.fontSize = "16px"
		w.style.zIndex = "9999"
		w.style.zoom = String(scale)
		const host = ui.shadowHost
		host.style.setProperty("display", "block", "important")
		host.style.setProperty("width", "100%", "important")
		host.style.setProperty("height", "100%", "important")
		host.style.setProperty("font-size", "16px", "important")
	}

	function open(trigger: HTMLElement) {
		ui.mount()
		position(trigger)
		isOpen = true
		setTimeout(() => {
			outsideHandler = (e) => {
				const target = e.target as Node
				if (ui.shadowHost.contains(target)) return
				if (trigger.contains(target)) return
				close()
			}
			document.addEventListener("mousedown", outsideHandler, true)
		}, 0)
	}

	function close() {
		if (!isOpen) return
		ui.remove()
		isOpen = false
		if (outsideHandler) {
			document.removeEventListener("mousedown", outsideHandler, true)
			outsideHandler = null
		}
	}

	function toggle(trigger: HTMLElement) {
		if (isOpen) close()
		else open(trigger)
	}

	return { toggle, close }
}
