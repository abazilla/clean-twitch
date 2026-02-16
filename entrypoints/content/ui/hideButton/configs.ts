import { blockCategory, blockChannel } from "./handlers"
import { ButtonConfig } from "./injector"

export function getTargetConfigs(): ButtonConfig[] {
	return [
		// Twitch game cards on directory/browse pages
		{
			targetSelector: 'a[data-a-target="tw-box-art-card-link"]',
			buttonText: "HIDE",
			buttonClass: "clean-twitch-block-btn clean-twitch-block-btn-overlay",
			position: "first",
			extractElementInfo: (element) => {
				const link = element as HTMLAnchorElement
				const href = link.href

				// Extract category from href="/directory/category/just-chatting"
				const categoryMatch = href.match(/\/directory\/category\/(.+)$/)
				if (!categoryMatch) return null

				const category = categoryMatch[1]

				// Use category name as display name
				const name = category.replace(/-/g, " ")

				return [name, category]
			},
			onButtonClick: blockCategory,
		},
		// Live channels on directory pages
		{
			targetSelector: 'a[data-a-target="preview-card-image-link"]',
			buttonText: "HIDE",
			buttonClass: "clean-twitch-block-btn clean-twitch-block-btn-overlay",
			position: "first",
			extractElementInfo: (element) => {
				const link = element as HTMLAnchorElement
				const href = link.href

				// Extract category from href="/directory/category/just-chatting"
				const channel = href.split("/").pop()
				if (!channel) return null

				return [channel]
			},
			onButtonClick: blockChannel,
		},
	]
}
