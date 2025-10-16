import React, { JSX } from "react"
import { features } from "../../../content/toggles"
import { CategoryBlocker } from "./CategoryBlocker"
import { ChannelBlocker } from "./ChannelBlocker"
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
