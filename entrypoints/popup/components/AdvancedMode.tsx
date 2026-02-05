import {
	alwaysShowFeatures,
	FeatureItem,
	features,
} from "@/entrypoints/content/features/definitions"
import { JSX } from "react"
import CategoryBlocker from "./CategoryBlocker"
import ChannelBlocker from "./ChannelBlocker"
import { FeatureToggle } from "./FeatureToggle"

const AdvancedMode = (): JSX.Element => (
	<div className="space-y-4">
		<div className="grid grid-cols-2 gap-3">
			{alwaysShowFeatures.map((item: FeatureItem) => (
				<FeatureToggle key={item.id} item={item} />
			))}
		</div>
		{features.map((item: FeatureItem) =>
			item.renderSimpleOrAdvanced === "always_hide" ||
			item.renderSimpleOrAdvanced === "always_show" ? (
				<></>
			) : (
				<FeatureToggle key={item.id} item={item} />
			)
		)}
		<div>
			<ChannelBlocker />
			<CategoryBlocker />
		</div>
	</div>
)

export default AdvancedMode
