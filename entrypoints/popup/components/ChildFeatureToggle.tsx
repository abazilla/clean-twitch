import { coupledControllerOf, FeatureID } from "@/entrypoints/content/features/definitions"
import { JSX } from "react"
import { applyCoupledFeatures, useStorageState } from "../storage"

interface ChildFeatureToggleProps {
	id: string
	label: string
	description?: string
	parentEnabled: boolean
}

export const ChildFeatureToggle = ({
	id,
	label,
	description,
	parentEnabled,
}: ChildFeatureToggleProps): JSX.Element => {
	const [checked, setChecked] = useStorageState<boolean>(id, false)

	// If this feature is controlled by another (e.g. auto-close socket is driven
	// by Hide Chat), lock it while that controller is on.
	const controller = coupledControllerOf[id as FeatureID]
	const [controllerOn] = useStorageState<boolean>(controller ?? `__ct_noop_${id}`, false)
	const lockedByController = !!controller && controllerOn

	const handleChange = async (value: boolean) => {
		await setChecked(value)
		await applyCoupledFeatures(id, value)
	}

	return (
		<div className="ml-6">
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id={id}
					className="h-4 w-4 accent-purple-400 disabled:opacity-50"
					checked={checked}
					disabled={parentEnabled || lockedByController}
					onChange={(e) => handleChange((e.target as HTMLInputElement).checked)}
				/>
				<label htmlFor={id} className="text-sm text-purple-100 select-none">
					{label}
				</label>
			</div>
			{description && (
				<p className="ml-6 text-xs text-purple-300">{description}</p>
			)}
		</div>
	)
}
