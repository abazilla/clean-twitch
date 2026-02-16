import {
	getFeaturesForMode,
	SimplePresetMode,
	toggleableFeatureIDs,
} from "@/entrypoints/content/features/definitions"
import { JSX } from "react"
import { storageHandler } from "@/entrypoints/content/storage/handler"
import { useStorageState } from "@/entrypoints/popup/storage"

type PresetOption = { id: SimplePresetMode | "reset"; label: string }

const presetOptions: PresetOption[] = [
	{ id: "reset", label: "Reset All" },
	{ id: "no_monetization", label: "No Monetization" },
	{ id: "minimalist", label: "Minimalist" },
	{ id: "focus", label: "Focus Mode" },
]

const PresetDropdown = (): JSX.Element => {
	const [selectedPreset, setSelectedPreset] = useStorageState<SimplePresetMode | "reset">(
		"last_applied_preset",
		"reset"
	)

	const applyPreset = async () => {
		if (selectedPreset === "reset") {
			// Turn off all toggleable features
			await Promise.all(toggleableFeatureIDs.map((id) => storageHandler.set(id, false)))
		} else {
			// Get features for the selected preset
			const activeFeatures = getFeaturesForMode(selectedPreset)

			// Set all toggleable features: true if in preset, false otherwise
			await Promise.all(
				toggleableFeatureIDs.map((id) => storageHandler.set(id, activeFeatures.includes(id)))
			)
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-sm">Copy settings from</span>
			<select
				value={selectedPreset}
				onChange={(e) => setSelectedPreset(e.target.value as SimplePresetMode | "reset")}
				className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-black focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
			>
				{presetOptions.map(({ id, label }) => (
					<option key={id} value={id}>
						{label}
					</option>
				))}
			</select>
			<button
				onClick={applyPreset}
				className="rounded bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
			>
				Apply
			</button>
		</div>
	)
}

export default PresetDropdown
