import { BlockedChannels } from "@/entrypoints/content/features/definitions"
import { JSX } from "react"
import { useStorageState } from "../storage"

export const ChannelBlocker = (): JSX.Element => {
	const [channelInput, setChannelInput] = useState<string>("")
	const [blockedChannels, setBlockedChannels] = useStorageState<BlockedChannels>(
		"blocked_channels",
		{
			enabled: true,
			hideFromSidebar: true,
			hideFromDirectory: true,
			hideFromSearch: true,
			usernames: [],
		}
	)

	const handleAddChannel = () => {
		const channelName = channelInput.toLowerCase().trim()
		setChannelInput("")
		if (blockedChannels.usernames.map((c) => c.username).includes(channelName)) return
		if (!channelName) return

		setBlockedChannels({
			...blockedChannels,
			usernames: [
				{
					username: channelName,
					enabled: true,
				},
				...blockedChannels.usernames,
			],
		})
	}

	const handleRemoveChannel = (channelName: string) => {
		// First disable the channel
		setBlockedChannels({
			...blockedChannels,
			usernames: blockedChannels.usernames.map((u) =>
				u.username === channelName ? { ...u, enabled: false } : u
			),
		})

		// Then remove after a delay
		setTimeout(() => {
			setBlockedChannels({
				...blockedChannels,
				usernames: blockedChannels.usernames.filter((u) => u.username !== channelName),
			})
		}, 300)
	}

	const handleToggleSetting = (setting: keyof Omit<BlockedChannels, "usernames">) => {
		setBlockedChannels({
			...blockedChannels,
			[setting]: !blockedChannels[setting],
		})
	}

	const handleToggleChannel = (channelName: string) => {
		setBlockedChannels({
			...blockedChannels,
			usernames: blockedChannels.usernames.map((u) =>
				u.username === channelName ? { ...u, enabled: !u.enabled } : u
			),
		})
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		handleAddChannel()
	}

	return (
		<section className="space-y-3 rounded-md border border-purple-700 bg-purple-800/40 p-3">
			<div className="flex items-center justify-between gap-2">
				<label
					htmlFor="block-channels-toggle"
					className="cursor-pointer text-xs font-semibold tracking-wider text-purple-200 uppercase select-none"
				>
					Block Channels
				</label>
				<input
					type="checkbox"
					id="block-channels-toggle"
					checked={blockedChannels.enabled}
					onChange={() => handleToggleSetting("enabled")}
					className="h-4 w-4 accent-purple-400"
				/>
			</div>
			<div className="grid grid-cols-2 gap-x-3 gap-y-1">
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={blockedChannels.hideFromSidebar}
						onChange={() => handleToggleSetting("hideFromSidebar")}
						className="h-4 w-4 accent-purple-400"
					/>
					Hide from sidebar
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={blockedChannels.hideFromDirectory}
						onChange={() => handleToggleSetting("hideFromDirectory")}
						className="h-4 w-4 accent-purple-400"
					/>
					Hide from directory
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={blockedChannels.hideFromSearch}
						onChange={() => handleToggleSetting("hideFromSearch")}
						className="h-4 w-4 accent-purple-400"
					/>
					Hide from search
				</label>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="flex gap-2">
					<input
						type="text"
						value={channelInput || ""}
						onChange={(e) => setChannelInput((e.target as HTMLInputElement).value)}
						placeholder="Channel name"
						className="flex-1 rounded border border-purple-700 bg-purple-950 px-2 py-1 text-sm text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
					/>
					<button
						type="submit"
						className="rounded bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-500 focus-visible:ring-2 focus-visible:ring-purple-300 focus:outline-none"
					>
						Add
					</button>
				</div>
			</form>
			{blockedChannels.usernames.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{blockedChannels.usernames.map((blockedUser) => (
						<div
							key={blockedUser.username}
							className="flex items-center gap-2 rounded border border-purple-600 bg-purple-700/70 px-2 py-1 text-sm"
						>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={blockedUser.enabled}
									onChange={() => handleToggleChannel(blockedUser.username)}
									className="h-4 w-4 accent-purple-400"
								/>
								<span>{blockedUser.username}</span>
							</label>
							<button
								type="button"
								onClick={() => handleRemoveChannel(blockedUser.username)}
								className="text-base leading-none font-bold text-red-400 hover:text-red-300"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</section>
	)
}

export default ChannelBlocker
