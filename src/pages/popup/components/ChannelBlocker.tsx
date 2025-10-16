import { JSX } from "preact/compat"
import { useState } from "preact/hooks"
import { useStorageState } from "../../../content/storage"
import { BlockedChannels } from "../../../content/toggles"

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
		setChannelInput("")
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

	const handleSubmit = (e: Event) => {
		e.preventDefault()
		handleAddChannel()
	}

	return (
		<div className="mt-4 border-t border-purple-400 pt-4">
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="block-channels-toggle"
					checked={blockedChannels.enabled}
					onChange={() => handleToggleSetting("enabled")}
					className="rounded border-purple-300"
				/>
				<label
					htmlFor="block-channels-toggle"
					className="cursor-pointer select-none text-lg font-bold"
				>
					Block Channels
				</label>
			</div>
			<div className="mt-2 flex flex-wrap gap-4">
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={blockedChannels.hideFromSidebar}
						onChange={() => handleToggleSetting("hideFromSidebar")}
						className="rounded border-purple-300"
					/>
					Hide from sidebar
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={blockedChannels.hideFromDirectory}
						onChange={() => handleToggleSetting("hideFromDirectory")}
						className="rounded border-purple-300"
					/>
					Hide from directory
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={blockedChannels.hideFromSearch}
						onChange={() => handleToggleSetting("hideFromSearch")}
						className="rounded border-purple-300"
					/>
					Hide from search
				</label>
			</div>
			<form onSubmit={handleSubmit} className="mt-2">
				<input
					type="text"
					value={channelInput || ""}
					onChange={(e) => setChannelInput((e.target as HTMLInputElement).value)}
					placeholder="Channel name"
					className="w-full rounded border border-purple-300 p-1 text-black"
				/>
				<button
					type="submit"
					className="mt-2 rounded bg-purple-700 px-3 py-1 text-white hover:bg-purple-800"
				>
					Add Channel
				</button>
			</form>
			<div className="mt-4 flex flex-wrap gap-2">
				{blockedChannels.usernames.map((blockedUser) => (
					<div
						key={blockedUser.username}
						className="flex items-center gap-2 rounded bg-purple-700/50 px-3 py-1"
					>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={blockedUser.enabled}
								onChange={() => handleToggleChannel(blockedUser.username)}
								className="rounded border-purple-300"
							/>
							<span>{blockedUser.username}</span>
						</label>
						<button
							type="button"
							onClick={() => handleRemoveChannel(blockedUser.username)}
							className="relative top-[-1px] text-xl font-bold leading-none text-red-400 hover:text-red-500"
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

export default ChannelBlocker
