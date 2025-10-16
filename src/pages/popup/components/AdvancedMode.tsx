import React, { JSX } from "react"
import { CategoryBlocker } from "./CategoryBlocker"
import { ChannelBlocker } from "./ChannelBlocker"
import { FeatureToggle } from "./FeatureToggle"
import { features } from "../../../content/types"

const AdvancedMode = (): JSX.Element => (
	<div className="space-y-3">
		{features.map((item) => (
			<FeatureToggle key={item.id} item={item} />
		))}
		<div className="border-t border-purple-400 pt-3">
			<ChannelBlocker />
			<CategoryBlocker />
		</div>
	</div>
)

export default AdvancedMode