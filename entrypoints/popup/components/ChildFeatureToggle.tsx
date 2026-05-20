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
		<div className="ml-6">
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id={id}
					className="h-4 w-4 accent-purple-400 disabled:opacity-50"
					checked={checked}
					disabled={parentEnabled}
					onChange={(e) => setChecked((e.target as HTMLInputElement).checked)}
				/>
				<label htmlFor={id} className="text-sm text-purple-100 select-none">
					{label}
				</label>
			</div>
		</div>
	)
}
