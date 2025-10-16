import React from "react"
import { useStorageState } from "../../../content/storage"

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
	const [checked, setChecked] = useStorageState<boolean>(id, false)

	return (
		<div className="ml-4 mt-0.5">
			<div className="flex items-center gap-1">
				<input
					type="checkbox"
					id={id}
					className="mt-0.5 h-4 w-4 place-self-start rounded border-gray-300 text-purple-800 focus:ring-purple-500"
					checked={checked}
					disabled={parentEnabled}
					onChange={(e) => setChecked(e.target.checked)}
				/>
				<label htmlFor={id} className="select-none text-sm font-medium">
					{label}
				</label>
			</div>
		</div>
	)
}
