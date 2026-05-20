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

	const ui = await createShadowRootUi<Root>(ctx, {
		name: "clean-twitch-menu",
		position: "inline",
		anchor: "body",
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
		const host = ui.shadowHost
		const rect = trigger.getBoundingClientRect()
		const popupWidth = 448 // matches popup w-md
		const left = Math.min(
			Math.max(8, rect.right - popupWidth),
			window.innerWidth - popupWidth - 8
		)
		host.style.position = "fixed"
		host.style.top = `${rect.bottom + 8}px`
		host.style.left = `${left}px`
		host.style.zIndex = "9999"
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
