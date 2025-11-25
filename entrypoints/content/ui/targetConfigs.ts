import { blockCategory } from "./buttonHandlers"
import { ButtonConfig } from "./buttonInjector"

export function getTargetConfigs(): ButtonConfig[] {
	return [
		// Twitch game cards on directory/browse pages
		{
			targetSelector: 'a[data-a-target="tw-box-art-card-link"]',
			buttonText: "HIDE",
			buttonClass: "hide-twitch-block-btn hide-twitch-block-btn-destructive",
			position: "first",
			extractCategoryInfo: (element) => {
				const link = element as HTMLAnchorElement
				const href = link.href

				// Extract category from href="/directory/category/just-chatting"
				const categoryMatch = href.match(/\/directory\/category\/(.+)$/)
				if (!categoryMatch) return null

				const category = categoryMatch[1]

				// Use category name as display name
				const name = category.replace(/-/g, " ")

				return { name, category }
			},
			onButtonClick: blockCategory,
		},
	]
}
