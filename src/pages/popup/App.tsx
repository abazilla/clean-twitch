import React, { JSX } from "react"
import { FeatureToggle } from "./components/FeatureToggle"
import { features } from "./types"

const App = (): JSX.Element => {
	return (
		<div className="w-60 border border-white bg-purple-600 p-4 text-white">
			<h1 className="m-0 p-0 text-lg">Popup Page</h1>
			<p>If you are seeing this, it is working!</p>
			{features.map((item) => (
				<FeatureToggle key={item.id} item={item} />
			))}
		</div>
	)
}

export default App
