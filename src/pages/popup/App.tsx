import React, { JSX, useEffect, useState } from "react"
import { useStorageState } from "../../content/storage"
import AdvancedMode from "./components/AdvancedMode"
import SimpleMode from "./components/SimpleMode"

const App = (): JSX.Element => {
	const [isAdvancedMode, setIsAdvancedMode] = useState(false)
	const [isSimpleMode, setIsSimpleMode] = useStorageState<boolean>("is_simple_mode", true)

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
		<div className="w-80 border border-white bg-purple-600 p-4 text-white">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="m-0 p-0 text-lg">Hide Twitch BS</h1>
				<button
					onClick={handleModeToggle}
					className="rounded bg-purple-500 px-3 py-1 text-sm hover:bg-purple-400"
				>
					{isAdvancedMode ? "Simple" : "Advanced"}
				</button>
			</div>
			{isAdvancedMode ? <AdvancedMode /> : <SimpleMode />}
		</div>
	)
}

export default App
