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

type Presets = { id: SimplePresetMode; label: string; description: string }[]

export const presetLabels: Presets = [
	{
		id: "show_all",
		label: "Show All",
		description: "Show everything",
	},
	{
		id: "no_monetization",
		label: "No Monetization",
		description: "Keep your money",
	},
	{
		id: "minimalist",
		label: "Minimalist",
		description: "Minimal distractions",
	},
	{
		id: "focus",
		label: "Focus mode",
		description: "Background noise only",
	},
]

const SimpleMode = (): JSX.Element => {
	const [currentPreset, setCurrentPreset] = useStorageState<SimplePresetMode>(
		"simple_mode_preset",
		"show_all"
	)

	const applyPreset = async (preset: SimplePresetMode) => {
		await setCurrentPreset(preset)
	}

	return (
		<div className="space-y-4">
			<section className="space-y-2 rounded-md border border-purple-700 bg-purple-800/40 p-3">
				<h2 className="text-xs font-semibold tracking-wider text-purple-200 uppercase">
					Preset
				</h2>
				<div className="grid grid-cols-2 gap-2">
					{presetLabels.map(({ id, label, description }) => (
						<label
							key={id}
							className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors ${
								currentPreset === id
									? "border-purple-400 bg-purple-700 ring-1 ring-purple-300"
									: "border-purple-700 hover:bg-purple-800/60"
							}`}
						>
							<input
								type="radio"
								name="preset"
								value={id}
								checked={currentPreset === id}
								onChange={() => applyPreset(id as SimplePresetMode)}
								className="sr-only"
							/>
							<div className="flex-1">
								<div className="text-sm font-medium">{label}</div>
								<div className="text-xs text-purple-200/80">{description}</div>
							</div>
						</label>
					))}
				</div>
			</section>

			<section className="space-y-2 rounded-md border border-purple-700 bg-purple-800/40 p-3">
				<h2 className="text-xs font-semibold tracking-wider text-purple-200 uppercase">
					Always On
				</h2>
				<div className="divide-y divide-purple-700/60">
					{alwaysShowFeatures.map((item: FeatureItem) => (
						<FeatureToggle key={item.id} item={item} />
					))}
				</div>
			</section>

			<ChannelBlocker />
			<CategoryBlocker />
		</div>
	)
}

export default SimpleMode
