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
			<div className="flex items-center gap-2">
				{status && <span className="text-sm text-yellow-200">{status}</span>}
			</div>
			<div className="flex items-center gap-2">
				<button
					onClick={handleImport}
					className="rounded bg-purple-800 px-3 py-1 text-sm hover:bg-purple-700"
				>
					Import
				</button>
				<button
					onClick={handleExport}
					className="rounded bg-purple-800 px-3 py-1 text-sm hover:bg-purple-700"
				>
					Export
				</button>
			</div>
		</div>
	)
}

const SectionTitle = ({ children }: { children: React.ReactNode }): JSX.Element => (
	<h2 className="text-xs font-semibold tracking-wider text-purple-200 uppercase">{children}</h2>
)

const advancedFeatures = (features as readonly FeatureItem[]).filter(
	(item) =>
		item.renderSimpleOrAdvanced !== "always_hide" &&
		item.renderSimpleOrAdvanced !== "always_show"
)

const AdvancedMode = (): JSX.Element => (
	<div className="space-y-4">
		<section className="space-y-2 rounded-md border border-purple-700 bg-purple-800/40 p-3">
			<SectionTitle>Always On</SectionTitle>
			<div className="divide-y divide-purple-700/60">
				{alwaysShowFeatures.map((item: FeatureItem) => (
					<FeatureToggle key={item.id} item={item} />
				))}
			</div>
		</section>

		<section className="space-y-2 rounded-md border border-purple-700 bg-purple-800/40 p-3">
			<SectionTitle>Presets</SectionTitle>
			<PresetDropdown />
		</section>

		<section className="space-y-2 rounded-md border border-purple-700 bg-purple-800/40 p-3">
			<SectionTitle>Backup</SectionTitle>
			<ImportExport />
		</section>

		<section className="space-y-2 rounded-md border border-purple-700 bg-purple-800/40 p-3">
			<SectionTitle>Features</SectionTitle>
			<div className="divide-y divide-purple-700/60">
				{advancedFeatures.map((item: FeatureItem) => (
					<FeatureToggle key={item.id} item={item} />
				))}
			</div>
		</section>

		<ChannelBlocker />
		<CategoryBlocker />
	</div>
)

export default AdvancedMode
