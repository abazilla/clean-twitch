import { BlockedCategories, BlockedChannels } from "../../features/definitions"
import { storageHandler } from "../../storage/handler"

export async function blockCategory([name, category]: string[]): Promise<void> {
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
		const existingCategory = blockedCategories.categories.find((c) => c.category === category)

		if (existingCategory) {
			// console.log(`Category ${categoryInfo.name} is already blocked`)
			return
		}

		// Add category to blocked list (same pattern as CategoryBlocker.tsx:25-35)
		const updatedBlockedCategories: BlockedCategories = {
			...blockedCategories,
			categories: [
				{
					category: category,
					name: name,
					enabled: true,
				},
				...blockedCategories.categories,
			],
		}

		await storageHandler.set("blocked_categories", updatedBlockedCategories)
		// console.log(`Successfully blocked category: ${name}`)
	} catch (error) {
		console.error("Error blocking category:", error)
	}
}

export async function blockChannel([channel]: string[]): Promise<void> {
	try {
		const blockedChannels = ((await storageHandler.get("blocked_channels")) as BlockedChannels) || {
			enabled: true,
			hideFromSidebar: true,
			hideFromDirectory: true,
			hideFromSearch: true,
			usernames: [],
		}

		// Check if channel already exists
		const existingChannel = blockedChannels.usernames.find((u) => u.username === channel)

		if (existingChannel) {
			// console.log(`Channel ${channel} is already blocked`)
			return
		}

		const updatedBlockedChannels: BlockedChannels = {
			...blockedChannels,
			usernames: [
				{
					username: channel,
					enabled: true,
				},
				...blockedChannels.usernames,
			],
		}

		await storageHandler.set("blocked_channels", updatedBlockedChannels)
		// console.log(`Successfully blocked channel: ${channel}`)
	} catch (error) {
		console.error("Error blocking channel:", error)
	}
}
