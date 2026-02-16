import { ContentScriptContext } from "#imports"
import { createIntegratedUi } from "wxt/utils/content-script-ui/integrated"

export interface ButtonConfig {
	targetSelector: string
	buttonText: string
	buttonClass: string
	extractElementInfo: (element: Element) => string[] | null
	onButtonClick: (categoryInfo: string[]) => Promise<void>
	position?: "before" | "after" | "first" | "last"
}

// Track injected buttons globally
const injectedButtons = new Set<string>()

export async function injectButton(ctx: ContentScriptContext, config: ButtonConfig): Promise<void> {
	const targetElements = document.querySelectorAll(config.targetSelector)
	await injectButtonsInElements(ctx, config, targetElements)
}

export async function injectButtonsInNewNodes(
	ctx: ContentScriptContext,
	config: ButtonConfig,
	newNodes: NodeList
): Promise<void> {
	// Only check new nodes for target elements
	const targetElements: Element[] = []

	for (const node of newNodes) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as Element
			// Check if the node itself matches
			if (element.matches(config.targetSelector)) {
				targetElements.push(element)
			}
			// Check for children that match
			const children = element.querySelectorAll(config.targetSelector)
			targetElements.push(...children)
		}
	}

	await injectButtonsInElements(ctx, config, targetElements)
}

async function injectButtonsInElements(
	ctx: ContentScriptContext,
	config: ButtonConfig,
	elements: ArrayLike<Element>
): Promise<void> {
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i]
		const uniqueId = generateUniqueId(element, config.targetSelector)

		if (injectedButtons.has(uniqueId)) {
			continue
		}

		const categoryInfo = config.extractElementInfo(element)
		if (!categoryInfo) {
			continue
		}

		const ui = createIntegratedUi(ctx, {
			position: "inline",
			anchor: element,
			append: config.position || "last",
			onMount: (container: HTMLElement) => {
				const button = createButton(config, categoryInfo)
				container.appendChild(button)
			},
		})

		try {
			ui.mount()
			injectedButtons.add(uniqueId)
		} catch (error) {
			console.warn("Failed to inject button:", error)
		}
	}
}

function createButton(config: ButtonConfig, categoryInfo: string[]): HTMLElement {
	const button = document.createElement("button")
	button.className = config.buttonClass
	button.textContent = config.buttonText
	button.type = "button"

	button.onclick = async (e) => {
		e.preventDefault()
		e.stopPropagation()
		await config.onButtonClick(categoryInfo)
	}

	return button
}

function generateUniqueId(element: Element, selector: string): string {
	// Generate a unique ID based on element position and content
	const rect = element.getBoundingClientRect()
	const content = element.textContent?.slice(0, 50) || ""
	return `${selector}-${rect.top}-${rect.left}-${content.replace(/\s+/g, "-")}`
}

export function clearInjectedButtons(): void {
	injectedButtons.clear()
}
