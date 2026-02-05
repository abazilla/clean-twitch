import {
	alwaysShowFeatures,
	FeatureItem,
	SimplePresetMode,
} from "@/entrypoints/content/features/definitions"
import { JSX } from "react"
import { useStorageState } from "../storage"
import CategoryBlocker from "./CategoryBlocker"
import ChannelBlocker from "./ChannelBlocker"
import { FeatureToggle } from "./FeatureToggle"

const presetLabels = {
	show_all: {
		label: "Show All",
		description: "Show everything",
	},
	no_monetization: {
		label: "No Monetization",
		description: "Keep your money",
	},
	minimalist: {
		label: "Minimalist",
		description: "Minimal distractions",
	},
	focus: {
		label: "Focus mode",
		description: "Background noise only",
	},
}

const SimpleMode = (): JSX.Element => {
	const [currentPreset, setCurrentPreset] = useStorageState<SimplePresetMode>(
		"simple_mode_preset",
		"show_all"
	)

	const applyPreset = async (preset: SimplePresetMode) => {
		await setCurrentPreset(preset)
	}

	return (
		<div className="mt-1 space-y-4">
			<div className="space-y-3">
				<h3 className="mt-2 text-sm font-medium">Choose a preset:</h3>
				<div className="grid grid-cols-2 gap-3">
					{(
						Object.entries(presetLabels) as [
							SimplePresetMode,
							(typeof presetLabels)[SimplePresetMode],
						][]
					).map(([key, config]) => (
						<label
							key={key}
							className={`flex cursor-pointer items-start gap-3 rounded border p-3 ${
								currentPreset === key ? "bg-purple-400" : "border-gray-200"
							}`}
						>
							<input
								type="radio"
								name="preset"
								value={key}
								checked={currentPreset === key}
								onChange={() => applyPreset(key)}
								className="sr-only"
							/>
							<div className="flex-1">
								<div className="text-sm font-medium">{config.label}</div>
								<div className="text-xs opacity-75">{config.description}</div>
							</div>
						</label>
					))}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				{alwaysShowFeatures.map((item: FeatureItem) => (
					<FeatureToggle key={item.id} item={item} />
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
