import { BlockedCategories } from "../features/definitions"
import { storageHandler } from "../utils/storageHandler"

export async function blockCategory(categoryInfo: {
	name: string
	category: string
}): Promise<void> {
	try {
		const blockedCategories = ((await storageHandler.get(
			"blocked_categories"
		)) as BlockedCategories) || {
			enabled: true,
			hideFromSidebar: true,
			hideFromDirectory: true,
			hideFromSearch: true,
			categories: [],
		}

		// Check if category already exists
		const existingCategory = blockedCategories.categories.find(
			(c) => c.category === categoryInfo.category
		)

		if (existingCategory) {
			// console.log(`Category ${categoryInfo.name} is already blocked`)
			return
		}

		// Add category to blocked list (same pattern as CategoryBlocker.tsx:25-35)
		const updatedBlockedCategories: BlockedCategories = {
			...blockedCategories,
			categories: [
				{
					category: categoryInfo.category,
					name: categoryInfo.name,
					enabled: true,
				},
				...blockedCategories.categories,
			],
		}

		await storageHandler.set("blocked_categories", updatedBlockedCategories)
		// console.log(`Successfully blocked category: ${categoryInfo.name}`)
	} catch (error) {
		console.error("Error blocking category:", error)
	}
}

// Add more button handlers here as needed
// export async function blockChannel(channelInfo: { name: string; id: string }): Promise<void> { ... }
// export async function customAction(info: any): Promise<void> { ... }
