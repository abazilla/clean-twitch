import { describe, expect, test } from "vitest"
import {
	blockedCategoryDirectorySelectors,
	blockedCategorySearchSelectors,
	blockedCategorySidebarSelectors,
	blockedChannelDirectorySelectors,
	blockedChannelSearchSelectors,
	blockedChannelSidebarSelectors,
	Chat,
	ChannelInfo,
	ChannelVideo,
	Footer,
	LeftSidebar,
	Player,
	Thumbnails,
	TopNav,
} from "./selectors"

const groups = { TopNav, LeftSidebar, Chat, Player, Thumbnails, ChannelVideo, ChannelInfo, Footer }

describe("selector registry", () => {
	describe("static groups", () => {
		for (const [groupName, group] of Object.entries(groups)) {
			describe(groupName, () => {
				for (const [key, selector] of Object.entries(group)) {
					test(`${key} is a non-empty string`, () => {
						expect(typeof selector).toBe("string")
						expect(selector.length).toBeGreaterThan(0)
						expect(selector.trim()).toBe(selector)
					})
				}
			})
		}
	})

	describe("Twitch data-attribute selectors use data-a- prefix", () => {
		const dataAttrSelectors = [
			TopNav.CONTAINER,
			TopNav.LOGIN_BUTTON,
			LeftSidebar.BAR,
			LeftSidebar.BAR_COLLAPSED,
			LeftSidebar.LIVE_STATUS_TOGGLE,
			LeftSidebar.SHOW_MORE_BUTTON,
			LeftSidebar.SHOW_LESS_BUTTON,
			Chat.BAR_EXPANDED,
			Chat.BAR_COLLAPSED,
			Chat.COLLAPSE_BUTTON,
			Chat.EXPAND_BUTTON,
			Player.FRONT_PAGE_CAROUSEL,
			Player.FRONTPAGE_PLAYER,
			Player.VIDEO_PLAYER,
			ChannelVideo.ANIMATED_VIEWERS_COUNT,
		]
		for (const selector of dataAttrSelectors) {
			test(selector, () => {
				expect(selector).toMatch(/data-a-/)
			})
		}
	})

	describe("player selectors reference player attributes", () => {
		test("MINI uses data-a-player-state", () => {
			expect(Player.MINI).toMatch(/data-a-player-state/)
		})
		test("MINI_VIDEO uses data-a-player-type", () => {
			expect(Player.MINI_VIDEO).toMatch(/data-a-player-type/)
		})
		test("FRONTPAGE_PLAYER uses data-a-player-type", () => {
			expect(Player.FRONTPAGE_PLAYER).toMatch(/data-a-player-type/)
		})
		test("FRONTPAGE_PLAYER_WITH_VIDEO uses data-a-player-type and :has(video)", () => {
			expect(Player.FRONTPAGE_PLAYER_WITH_VIDEO).toMatch(/data-a-player-type/)
			expect(Player.FRONTPAGE_PLAYER_WITH_VIDEO).toMatch(/:has\(video\)/)
		})
	})

	describe("blocker factories", () => {
		test("blockedChannelSearchSelectors returns non-empty strings interpolating username", () => {
			const out = blockedChannelSearchSelectors("alice")
			expect(out.length).toBeGreaterThan(0)
			for (const s of out) {
				expect(typeof s).toBe("string")
				expect(s.length).toBeGreaterThan(0)
				expect(s).toMatch(/alice/)
			}
		})

		test("blockedChannelSidebarSelectors interpolates username", () => {
			const out = blockedChannelSidebarSelectors("bob")
			expect(out.length).toBeGreaterThan(0)
			for (const s of out) expect(s).toMatch(/bob/)
		})

		test("blockedChannelDirectorySelectors interpolates username", () => {
			const out = blockedChannelDirectorySelectors("carol")
			expect(out.length).toBeGreaterThan(0)
			for (const s of out) expect(s).toMatch(/carol/)
		})

		test("blockedCategorySearchSelectors interpolates category", () => {
			const out = blockedCategorySearchSelectors("just-chatting")
			expect(out.length).toBeGreaterThan(0)
			for (const s of out) expect(s).toMatch(/just-chatting/)
		})

		test("blockedCategorySidebarSelectors interpolates category and name", () => {
			const out = blockedCategorySidebarSelectors("just-chatting", "Just Chatting")
			expect(out.length).toBeGreaterThan(0)
			expect(out.some((s) => s.includes("just-chatting"))).toBe(true)
			expect(out.some((s) => s.includes("Just Chatting"))).toBe(true)
		})

		test("blockedCategoryDirectorySelectors interpolates category", () => {
			const out = blockedCategoryDirectorySelectors("league-of-legends")
			expect(out.length).toBeGreaterThan(0)
			for (const s of out) expect(s).toMatch(/league-of-legends/)
		})
	})
})
