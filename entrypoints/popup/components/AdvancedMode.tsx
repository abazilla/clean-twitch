import { features } from "@/entrypoints/content/toggles"
import { JSX } from "react"
import CategoryBlocker from "./CategoryBlocker"
import ChannelBlocker from "./ChannelBlocker"
import { FeatureToggle } from "./FeatureToggle"

const AdvancedMode = (): JSX.Element => (
	<div className="space-y-3">
		{features.map((item) => (
			<FeatureToggle key={item.id} item={item} />
		))}
		<div>
			<ChannelBlocker />
			<CategoryBlocker />
		</div>
	</div>
)

export default AdvancedMode
