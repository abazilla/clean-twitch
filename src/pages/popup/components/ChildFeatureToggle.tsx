import React from "react"
import { useStorageState } from "../hooks/useStorageState"

interface ChildFeatureToggleProps {
	id: string
	label: string
	parentEnabled: boolean
}

export const ChildFeatureToggle: React.FC<ChildFeatureToggleProps> = ({
	id,
	label,
	parentEnabled,
}) => {
	const [checked, setChecked] = useStorageState(id)

	return (
		<div className="ml-6 mt-2">
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id={id}
					className="h-4 w-4 rounded border-gray-300 text-purple-800 focus:ring-purple-500"
					checked={checked}
					disabled={!parentEnabled}
					onChange={(e) => setChecked(e.target.checked)}
				/>
				<label htmlFor={id} className="select-none text-sm font-medium">
					{label}
				</label>
			</div>
		</div>
	)
}
