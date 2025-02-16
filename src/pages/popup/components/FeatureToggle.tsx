import React from "react"
import { useStorageState } from "../hooks/useStorageState"
import { FeatureItem } from "../types"
import { ChildFeatureToggle } from "./ChildFeatureToggle"

interface FeatureToggleProps {
	item: FeatureItem
}

export const FeatureToggle: React.FC<FeatureToggleProps> = ({ item }) => {
	const [checked, setChecked] = useStorageState(item.id)

	const handleParentToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.checked
		console.log(`Toggling ${item.id} to:`, newValue)

		if (newValue && item.conflicts.length > 0) {
			// Update conflicts first
			await Promise.all(
				item.conflicts.map((conflictId) => chrome.storage.sync.set({ [conflictId]: false }))
			)
		}

		// Then update this toggle
		await setChecked(newValue)
	}

	return (
		<div className="mt-1">
			<div className="flex items-center gap-1">
				<input
					type="checkbox"
					id={item.id}
					className="h-4 w-4 rounded border-gray-300 text-purple-800 focus:ring-purple-500"
					checked={checked}
					onChange={handleParentToggle}
				/>
				<label htmlFor={item.id} className="select-none text-sm font-medium">
					{item.label}
				</label>
			</div>

			{item.children.length > 0 && (
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
