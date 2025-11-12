import { JSX, useEffect, useState } from "react"
import { FeatureItem, features } from "../content/features/definitions"
import AdvancedMode from "./components/AdvancedMode"
import { FeatureToggle } from "./components/FeatureToggle"
import SimpleMode from "./components/SimpleMode"
import { useStorageState } from "./storage"

declare const __APP_VERSION__: string

const App = (): JSX.Element => {
	const [isAdvancedMode, setIsAdvancedMode] = useState(false)
	const [isSimpleMode, setIsSimpleMode] = useStorageState<boolean>("is_simple_mode", true)
	const [extensionEnabled, setExtensionEnabled] = useStorageState<boolean>(
		"extension_enabled",
		true
	)

	// Initialize mode from storage
	useEffect(() => {
		setIsAdvancedMode(!isSimpleMode)
	}, [isSimpleMode])

	const handleModeToggle = async () => {
		const newIsAdvancedMode = !isAdvancedMode
		setIsAdvancedMode(newIsAdvancedMode)
		// Set is_simple_mode to the opposite of isAdvancedMode
		await setIsSimpleMode(!newIsAdvancedMode)
	}

	return (
		<div className="w-80 bg-purple-600 p-4 text-white">
			<div className="flex items-center justify-between">
				<h1 className="m-0 p-0 text-lg">
					Clean Twitch <span className="text-sm opacity-75">v{__APP_VERSION__}</span>
				</h1>
				<div className="flex gap-2">
					{extensionEnabled && (
						<button
							onClick={handleModeToggle}
							className="rounded bg-purple-500 px-3 text-sm hover:bg-purple-400"
						>
							{isAdvancedMode ? "Simple" : "Advanced"}
						</button>
					)}
					<button
						onClick={() => setExtensionEnabled(!extensionEnabled)}
						className="rounded bg-purple-500 px-2 text-lg hover:bg-purple-400"
						title={extensionEnabled ? "Disable extension" : "Enable extension"}
					>
						{extensionEnabled ? "💡" : "⛔"}
					</button>
				</div>
			</div>

			{extensionEnabled && (
				<div className="mt-4">
					{features.map((item: FeatureItem) =>
						item.renderSimpleOrAdvanced === "always_show" ? (
							<FeatureToggle key={item.id} item={item} />
						) : (
							<></>
						)
					)}
					{isAdvancedMode ? (
						// <Suspense fallback={<div className="text-center text-sm">Loading...</div>}>
						<AdvancedMode />
					) : (
						// </Suspense>
						<SimpleMode />
					)}
				</div>
			)}
		</div>
	)
}

export default App
