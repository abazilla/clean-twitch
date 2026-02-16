import {
	alwaysShowFeatures,
	FeatureItem,
	features,
} from "@/entrypoints/content/features/definitions"
import { storageHandler } from "@/entrypoints/content/storage/handler"
import { JSX, useState } from "react"
import CategoryBlocker from "./CategoryBlocker"
import ChannelBlocker from "./ChannelBlocker"
import { FeatureToggle } from "./FeatureToggle"
import PresetDropdown from "./PresetDropdown"

const ImportExport = (): JSX.Element => {
	const [status, setStatus] = useState<string | null>(null)

	const handleExport = async () => {
		try {
			const code = await storageHandler.exportAll()
			await navigator.clipboard.writeText(code)
			setStatus("Copied!")
		} catch {
			setStatus("Export failed")
		}
		setTimeout(() => setStatus(null), 2000)
	}

	const handleImport = async () => {
		try {
			const code = await navigator.clipboard.readText()
			if (!code.trim()) {
				setStatus("Clipboard is empty")
				setTimeout(() => setStatus(null), 2000)
				return
			}
			await storageHandler.importAll(code.trim())
			setStatus("Imported!")
			setTimeout(() => window.location.reload(), 500)
		} catch {
			setStatus("Invalid code")
		}
		setTimeout(() => setStatus(null), 2000)
	}

	return (
		<div className="flex items-center justify-between gap-2">
			<span className="text-sm">Settings Export/Import:</span>
			<div className="flex items-center gap-2">
				{status && <span className="text-sm text-yellow-200">{status}</span>}
				<button
					onClick={handleImport}
					className="rounded bg-purple-400 px-2 py-0.5 text-sm hover:bg-purple-300"
				>
					Import
				</button>
				<button
					onClick={handleExport}
					className="rounded bg-purple-400 px-2 py-0.5 text-sm hover:bg-purple-300"
				>
					Export
				</button>
			</div>
		</div>
	)
}

const AdvancedMode = (): JSX.Element => (
	<div className="space-y-4">
		<div className="grid grid-cols-2 gap-3">
			{alwaysShowFeatures.map((item: FeatureItem) => (
				<FeatureToggle key={item.id} item={item} />
			))}
		</div>
		<PresetDropdown />
		<ImportExport />
		<div className="grid grid-cols-2 gap-3">
			{features.map((item: FeatureItem) =>
				item.renderSimpleOrAdvanced === "always_hide" ||
				item.renderSimpleOrAdvanced === "always_show" ? (
					<></>
				) : (
					<FeatureToggle key={item.id} item={item} />
				)
			)}
		</div>
		<div>
			<ChannelBlocker />
			<CategoryBlocker />
		</div>
	</div>
)

export default AdvancedMode
