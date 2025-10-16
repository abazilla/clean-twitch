import React, { useState } from "react"
import { BlockedCategories } from "../../../content/toggles"
import { parseCategoryName } from "../../../utils/categoryParser"
import { useStorageState } from "../../../utils/storage"

export const CategoryBlocker: React.FC = () => {
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
		const categoryName = categoryInput.trim()
		if (!categoryName) return

		setBlockedCategories({
			...blockedCategories,
			categories: [
				{
					category: parseCategoryName(categoryName),
					name: categoryName,
					enabled: true,
				},
				...blockedCategories.categories,
			],
		})
		setCategoryInput("")
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		handleAddCategory()
	}

	return (
		<div className="mt-4 border-t border-purple-400 pt-4">
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="block-categories-toggle"
					checked={blockedCategories.enabled}
					onChange={() => handleToggleSetting("enabled")}
					className="rounded border-purple-300"
				/>
				<label
					htmlFor="block-categories-toggle"
					className="cursor-pointer select-none text-lg font-bold"
				>
					Block Categories
				</label>
			</div>
			<div className="mt-2 flex flex-wrap gap-4">
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={blockedCategories.hideFromSidebar}
						onChange={() => handleToggleSetting("hideFromSidebar")}
						className="rounded border-purple-300"
					/>
					Hide from sidebar
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={blockedCategories.hideFromDirectory}
						onChange={() => handleToggleSetting("hideFromDirectory")}
						className="rounded border-purple-300"
					/>
					Hide from directory
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={blockedCategories.hideFromSearch}
						onChange={() => handleToggleSetting("hideFromSearch")}
						className="rounded border-purple-300"
					/>
					Hide from search
				</label>
			</div>
			<form onSubmit={handleSubmit} className="mt-2">
				<input
					type="text"
					value={categoryInput || ""}
					onChange={(e) => setCategoryInput(e.target.value)}
					placeholder="Category name"
					className="w-full rounded border border-purple-300 p-1 text-black"
				/>
				<button
					type="submit"
					className="mt-2 rounded bg-purple-700 px-3 py-1 text-white hover:bg-purple-800"
				>
					Add Category
				</button>
			</form>
			<div className="mt-4 flex flex-wrap gap-2">
				{blockedCategories.categories.map((blockedCategory) => (
					<div
						key={blockedCategory.category}
						className="flex items-center gap-2 rounded bg-purple-700/50 px-3 py-1"
					>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={blockedCategory.enabled}
								onChange={() => handleToggleCategory(blockedCategory.category)}
								className="rounded border-purple-300"
							/>
							<span>{blockedCategory.name}</span>
						</label>
						<button
							type="button"
							onClick={() => handleRemoveCategory(blockedCategory.category)}
							className="relative top-[-1px] text-xl font-bold leading-none text-red-400 hover:text-red-500"
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	)
}
