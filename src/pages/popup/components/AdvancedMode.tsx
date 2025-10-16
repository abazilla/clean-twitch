import { JSX } from "preact/compat"
import { features } from "../../../content/toggles"
import { FeatureToggle } from "./FeatureToggle"
import CategoryBlocker from "./CategoryBlocker"
import ChannelBlocker from "./ChannelBlocker"

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
