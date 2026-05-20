import { JSX, useEffect, useState } from "react"
import AdvancedMode from "./components/AdvancedMode"
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
		<div className="flex h-96 w-md flex-col overflow-hidden bg-purple-900 text-white">
			<div className="flex shrink-0 items-center justify-between border-b border-purple-800 bg-purple-950 px-4 py-3">
				<h1 className="m-0 p-0 text-lg font-semibold">Clean Twitch</h1>
				<div className="flex gap-2">
					{extensionEnabled && (
						<button
							onClick={handleModeToggle}
							className="rounded bg-purple-800 px-3 py-1 text-sm hover:bg-purple-700"
						>
							{isAdvancedMode ? "Simple" : "Advanced"}
						</button>
					)}
					<button
						onClick={() => setExtensionEnabled(!extensionEnabled)}
						className="rounded bg-purple-800 px-2 py-1 text-base hover:bg-purple-700"
						title={extensionEnabled ? "Disable extension" : "Enable extension"}
					>
						{extensionEnabled ? "💡" : "⛔"}
					</button>
				</div>
			</div>

			<div className="scrollbar-hide flex-1 overflow-y-auto p-4">
				{extensionEnabled && (isAdvancedMode ? <AdvancedMode /> : <SimpleMode />)}
			</div>

			<div className="shrink-0 border-t border-purple-800 bg-purple-950 px-4 py-2 text-center text-xs text-purple-200">
				v{__APP_VERSION__} • made by{" "}
				<a
					className="text-blue-200 underline"
					href="https://github.com/abazilla"
					target="_blank"
					rel="noopener noreferrer"
				>
					aba
				</a>
			</div>
		</div>
	)
}

export default App
