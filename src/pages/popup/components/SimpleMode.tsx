import { JSX } from "preact/compat"
import { useStorageState } from "../../../content/storage"
import { getPresetLabels, SimplePresetMode } from "../../../content/toggles"
import CategoryBlocker from "./CategoryBlocker"
import ChannelBlocker from "./ChannelBlocker"

const SimpleMode = (): JSX.Element => {
	const [currentPreset, setCurrentPreset] = useStorageState<SimplePresetMode>(
		"simple_mode_preset",
		"show_all"
	)
	const presetLabels = getPresetLabels()

	const applyPreset = async (preset: SimplePresetMode) => {
		await setCurrentPreset(preset)
	}

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<h3 className="text-sm font-medium">Choose a preset:</h3>
				{(
					Object.entries(presetLabels) as [
						SimplePresetMode,
						(typeof presetLabels)[SimplePresetMode],
					][]
				).map(([key, config]) => (
					<label key={key} className="flex cursor-pointer items-start gap-3">
						<input
							type="radio"
							name="preset"
							value={key}
							checked={currentPreset === key}
							onChange={() => applyPreset(key)}
							className="mt-0.5 h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
						/>
						<div className="flex-1">
							<div className="text-sm font-medium">{config.label}</div>
							<div className="text-xs opacity-75">{config.description}</div>
						</div>
					</label>
				))}
			</div>

			<div>
				<ChannelBlocker />
				<CategoryBlocker />
			</div>
		</div>
	)
}

export default SimpleMode
