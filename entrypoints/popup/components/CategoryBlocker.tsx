import { BlockedCategories } from "@/entrypoints/content/features/definitions"
import { parseCategory } from "@/entrypoints/content/helpers/categoryParser"
import { JSX, useState } from "react"
import { useStorageState } from "../storage"

export const CategoryBlocker = (): JSX.Element => {
	const [categoryInput, setCategoryInput] = useState<string>("")
	const [blockedCategories, setBlockedCategories] = useStorageState<BlockedCategories>(
		"blocked_categories",
		{
			enabled: true,
			hideFromSidebar: true,
			hideFromDirectory: true,
			hideFromSearch: true,
			categories: [],
		}
	)

	const handleAddCategory = () => {
		const [name, category] = parseCategory(categoryInput)
		setCategoryInput("")
		if (blockedCategories.categories.map((c) => c.category).includes(category)) return
		if (!category) return

		setBlockedCategories({
			...blockedCategories,
			categories: [
				{
					category,
					name,
					enabled: true,
				},
				...blockedCategories.categories,
			],
		})
	}

	const handleRemoveCategory = (categoryName: string) => {
		// First disable the category
		setBlockedCategories({
			...blockedCategories,
			categories: blockedCategories.categories.map((c) =>
				c.category === categoryName ? { ...c, enabled: false } : c
			),
		})

		// Then remove after a delay
		setTimeout(() => {
			setBlockedCategories({
				...blockedCategories,
				categories: blockedCategories.categories.filter((c) => c.category !== categoryName),
			})
		}, 300)
	}

	const handleToggleSetting = (setting: keyof Omit<BlockedCategories, "categories">) => {
		setBlockedCategories({
			...blockedCategories,
			[setting]: !blockedCategories[setting],
		})
	}

	const handleToggleCategory = (categoryName: string) => {
		setBlockedCategories({
			...blockedCategories,
			categories: blockedCategories.categories.map((c) =>
				c.category === categoryName ? { ...c, enabled: !c.enabled } : c
			),
		})
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		handleAddCategory()
	}

	return (
		<section className="space-y-3 rounded-md border border-purple-700 bg-purple-800/40 p-3">
			<div className="flex items-center justify-between gap-2">
				<label
					htmlFor="block-categories-toggle"
					className="cursor-pointer text-xs font-semibold tracking-wider text-purple-200 uppercase select-none"
				>
					Block Categories
				</label>
				<input
					type="checkbox"
					id="block-categories-toggle"
					checked={blockedCategories.enabled}
					onChange={() => handleToggleSetting("enabled")}
					className="h-4 w-4 accent-purple-400"
				/>
			</div>
			<div className="grid grid-cols-2 gap-x-3 gap-y-1">
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={blockedCategories.hideFromSidebar}
						onChange={() => handleToggleSetting("hideFromSidebar")}
						className="h-4 w-4 accent-purple-400"
					/>
					Hide from sidebar
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={blockedCategories.hideFromDirectory}
						onChange={() => handleToggleSetting("hideFromDirectory")}
						className="h-4 w-4 accent-purple-400"
					/>
					Hide from directory
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={blockedCategories.hideFromSearch}
						onChange={() => handleToggleSetting("hideFromSearch")}
						className="h-4 w-4 accent-purple-400"
					/>
					Hide from search
				</label>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="flex gap-2">
					<input
						type="text"
						value={categoryInput || ""}
						onChange={(e) => setCategoryInput((e.target as HTMLInputElement).value)}
						placeholder="Category name"
						className="flex-1 rounded border border-purple-700 bg-purple-950 px-2 py-1 text-sm text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
					/>
					<button
						type="submit"
						className="rounded bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-500 focus-visible:ring-2 focus-visible:ring-purple-300 focus:outline-none"
					>
						Add
					</button>
				</div>
			</form>
			{blockedCategories.categories.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{blockedCategories.categories.map((blockedCategory) => (
						<div
							key={blockedCategory.category}
							className="flex items-center gap-2 rounded border border-purple-600 bg-purple-700/70 px-2 py-1 text-sm"
						>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={blockedCategory.enabled}
									onChange={() => handleToggleCategory(blockedCategory.category)}
									className="h-4 w-4 accent-purple-400"
								/>
								<span>{blockedCategory.name}</span>
							</label>
							<button
								type="button"
								onClick={() => handleRemoveCategory(blockedCategory.category)}
								className="text-base leading-none font-bold text-red-400 hover:text-red-300"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</section>
	)
}

export default CategoryBlocker
