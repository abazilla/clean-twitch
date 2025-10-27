import { storage } from "@/entrypoints/content/storage"
import { FeatureItem } from "@/entrypoints/content/toggles"
import { JSX } from "react"
import { useStorageState } from "../storage"
import { ChildFeatureToggle } from "./ChildFeatureToggle"

interface FeatureToggleProps {
	item: FeatureItem
}

export const FeatureToggle = ({ item }: FeatureToggleProps): JSX.Element => {
	const [checked, setChecked] = useStorageState(item.id, false)

	const handleParentToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement
		const newValue = target.checked
		console.log(`Toggling ${item.id} to:`, newValue)

		if (newValue && item.conflicts.length > 0) {
			// Update conflicts first
			await Promise.all(item.conflicts.map((conflictId) => storage.set(conflictId, false)))
		}

		// Then update this toggle
		await setChecked(newValue)
	}

	return (
		<div className="mt-1">
			<div className="flex items-center gap-1">
				{item.hideToggle ? null : (
					<input
						type="checkbox"
						id={item.id}
						className="h-4 w-4 rounded border-gray-300 text-purple-800 focus:ring-purple-500"
						checked={checked}
						onChange={handleParentToggle}
					/>
				)}
				<label htmlFor={item.id} className="text-sm font-medium select-none">
					{item.label}
				</label>
			</div>

			{item.children && item.children.length > 0 && (
				<div className="mb-2">
					{item.children?.map((child) => (
						<ChildFeatureToggle
							key={child.id}
							id={child.id}
							label={child.label}
							parentEnabled={checked}
						/>
					))}
				</div>
			)}
		</div>
	)
}
