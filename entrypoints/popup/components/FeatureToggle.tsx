import { FeatureItem } from "@/entrypoints/content/features/definitions"
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
		await setChecked(newValue)
	}

	return (
		<div className="py-1.5">
			<div className="flex items-center gap-2">
				{item.hideToggleButton ? null : (
					<input
						type="checkbox"
						id={item.id}
						className="h-4 w-4 accent-purple-400"
						checked={checked}
						onChange={handleParentToggle}
					/>
				)}
				<label htmlFor={item.id} className="text-sm font-medium select-none">
					{item.label}
				</label>
			</div>

			{item.children && item.children.length > 0 && (
				<div className="mt-1 space-y-0.5">
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
