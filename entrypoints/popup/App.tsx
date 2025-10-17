import { JSX } from "react"
import AdvancedMode from "./components/AdvancedMode"
import SimpleMode from "./components/SimpleMode"
import { useStorageState } from "./storage"

// const AdvancedMode = lazy(() => import("./components/AdvancedMode"))

const App = (): JSX.Element => {
	const [isAdvancedMode, setIsAdvancedMode] = useState(false)
	const [isSimpleMode, setIsSimpleMode] = useStorageState<boolean>("is_simple_mode", true)
	const [testMode, setTestMode] = useStorageState<boolean>("test_mode", false)

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
			<div className="mb-4 flex items-center gap-1">
				<input
					type="checkbox"
					id="test_mode"
					checked={testMode}
					onChange={(e) => {
						setTestMode((e.target as HTMLInputElement).checked)
						// Refresh the current tab
						browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
							if (tabs[0]?.id) {
								browser.tabs.reload(tabs[0].id)
							}
						})
					}}
					className="h-4 w-4 rounded border-gray-300 text-purple-800 focus:ring-purple-500"
				/>
				<label htmlFor="test_mode" className="text-sm font-medium select-none">
					Test mode
				</label>
			</div>
			{isAdvancedMode ? (
				// <Suspense fallback={<div className="text-center text-sm">Loading...</div>}>
				<AdvancedMode />
			) : (
				// </Suspense>
				<SimpleMode />
			)}
		</div>
	)
}

export default App
