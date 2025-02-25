import React, { JSX } from "react"
import { ChannelBlocker } from "./components/ChannelBlocker"
import { FeatureToggle } from "./components/FeatureToggle"
import { features } from "./types"

const App = (): JSX.Element => {
	return (
		<div className="w-96 border border-white bg-purple-600 p-4 text-white">
			<h1 className="m-0 p-0 text-lg">Popup Page</h1>
			<p>If you are seeing this, it is working!</p>
			{features.map((item) => (
				<FeatureToggle key={item.id} item={item} />
			))}
			<ChannelBlocker />
		</div>
	)
}

export default App
