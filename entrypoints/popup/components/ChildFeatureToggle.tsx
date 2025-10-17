import { JSX } from "react"
import { useStorageState } from "../storage"

interface ChildFeatureToggleProps {
	id: string
	label: string
	parentEnabled: boolean
}

export const ChildFeatureToggle = ({
	id,
	label,
	parentEnabled,
}: ChildFeatureToggleProps): JSX.Element => {
	const [checked, setChecked] = useStorageState<boolean>(id, false)

	return (
		<div className="mt-0.5 ml-4">
			<div className="flex items-center gap-1">
				<input
					type="checkbox"
					id={id}
					className="mt-0.5 h-4 w-4 place-self-start rounded border-gray-300 text-purple-800 focus:ring-purple-500"
					checked={checked}
					disabled={parentEnabled}
					onChange={(e) => setChecked((e.target as HTMLInputElement).checked)}
				/>
				<label htmlFor={id} className="text-sm font-medium select-none">
					{label}
				</label>
			</div>
		</div>
	)
}
