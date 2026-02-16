import { ContentScriptContext } from "#imports"
import { getTargetConfigs } from "./configs"
import {
	ButtonConfig,
	clearInjectedButtons,
	injectButton,
	injectButtonsInNewNodes,
} from "./injector"

let isInitialized = false
let currentConfigs: ButtonConfig[] = []
let currentCtx: ContentScriptContext | null = null
let mutationObserver: MutationObserver | null = null

function shouldInjectButtons(): boolean {
	const href = window.location.href

	// Only inject on directory/browse pages
	return href.includes("/directory") || href === "https://www.twitch.tv/"
}

export async function initializeButtonManager(ctx: ContentScriptContext): Promise<void> {
	if (isInitialized) {
		return
	}

	// Check if we should inject buttons on this page
	if (!shouldInjectButtons()) {
		return
	}

	currentCtx = ctx
	currentConfigs = getTargetConfigs()
	await injectAllButtons()
	startObservingDOMChanges()
	isInitialized = true
}

export async function reinitializeButtonManager(): Promise<void> {
	cleanup()
	if (currentCtx) {
		await initializeButtonManager(currentCtx)
	}
}

async function injectAllButtons(): Promise<void> {
	if (!currentCtx) return

	// Wait for DOM to be ready
	if (document.readyState === "loading") {
		await new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", resolve, { once: true })
		})
	}

	// Add small delay to ensure Twitch elements are loaded
	await new Promise((resolve) => setTimeout(resolve, 1000))

	for (const config of currentConfigs) {
		try {
			await injectButton(currentCtx, config)
		} catch (error) {
			console.warn(`Failed to inject button for ${config.targetSelector}:`, error)
		}
	}
}

function cleanup(): void {
	clearInjectedButtons()
	stopObservingDOMChanges()
	isInitialized = false
}

function startObservingDOMChanges(): void {
	if (mutationObserver) {
		mutationObserver.disconnect()
	}

	mutationObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
				// Process only newly added nodes - much more efficient!
				handleNewNodes(mutation.addedNodes)
			}
		}
	})

	// Observe the document for changes
	mutationObserver.observe(document.body, {
		childList: true,
		subtree: true,
	})
}

function stopObservingDOMChanges(): void {
	if (mutationObserver) {
		mutationObserver.disconnect()
		mutationObserver = null
	}
}

// Handle newly added nodes - only check these, not existing DOM
function handleNewNodes(newNodes: NodeList): void {
	if (!currentCtx) return

	// Debounce to avoid excessive processing
	debounceHandleNewNodes(newNodes)
}

// Debounce new node processing
let newNodesQueue: NodeList[] = []
let processTimeout: NodeJS.Timeout | null = null

function debounceHandleNewNodes(newNodes: NodeList): void {
	newNodesQueue.push(newNodes)

	if (processTimeout) {
		clearTimeout(processTimeout)
	}

	processTimeout = setTimeout(() => {
		processQueuedNodes()
	}, 200) // Process after 200ms of no new changes
}

async function processQueuedNodes(): Promise<void> {
	if (!currentCtx || newNodesQueue.length === 0) return

	// Combine all queued nodes
	const allNewNodes: Node[] = []
	for (const nodeList of newNodesQueue) {
		allNewNodes.push(...Array.from(nodeList))
	}

	newNodesQueue = []

	// Process each config against the new nodes only
	for (const config of currentConfigs) {
		try {
			await injectButtonsInNewNodes(currentCtx, config, allNewNodes as any)
		} catch (error) {
			console.warn(`Failed to inject buttons in new nodes for ${config.targetSelector}:`, error)
		}
	}
}

// Function to add new button configurations dynamically
export function addButtonConfig(config: ButtonConfig): void {
	currentConfigs.push(config)
	if (isInitialized && currentCtx) {
		injectButton(currentCtx, config).catch((error) => {
			console.warn(`Failed to inject dynamic button for ${config.targetSelector}:`, error)
		})
	}
}

// Function to get current configurations
export function getConfigs(): ButtonConfig[] {
	return [...currentConfigs]
}
