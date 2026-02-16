import { describe, expect, test } from "vitest"
import { parseCategory } from "./categoryParser"

describe("parseCategoryName", () => {
	test("converts spaces to hyphens", () => {
		expect(parseCategory("Just Chatting")).toEqual(["just chatting", "just-chatting"])
		expect(parseCategory("World of Warcraft")).toEqual(["world of warcraft", "world-of-warcraft"])
	})

	test("removes apostrophes", () => {
		expect(parseCategory("Player's Unknown")).toEqual(["players unknown", "players-unknown"])
		expect(parseCategory("Don't Starve")).toEqual(["dont starve", "dont-starve"])
	})

	test("converts to lowercase", () => {
		expect(parseCategory("VALORANT")).toEqual(["valorant", "valorant"])
		expect(parseCategory("Counter Strike")).toEqual(["counter strike", "counter-strike"])
	})

	test("keeps numbers", () => {
		expect(parseCategory("Final Fantasy 14")).toEqual(["final fantasy 14", "final-fantasy-14"])
		expect(parseCategory("GTA 5")).toEqual(["gta 5", "gta-5"])
	})

	test("removes colons", () => {
		expect(parseCategory("Half Life: Alyx")).toEqual(["half life alyx", "half-life-alyx"])
		expect(parseCategory("Portal: 2")).toEqual(["portal 2", "portal-2"])
	})

	test("handles periods in acronyms vs regular text", () => {
		expect(parseCategory("R.E.P.O")).toEqual(["r-e-p-o", "r-e-p-o"])
		expect(parseCategory("Super Smash Bros. Melee")).toEqual(["super smash bros melee", "super-smash-bros-melee"])
		expect(parseCategory("Dr. Mario")).toEqual(["dr mario", "dr-mario"])
	})

	test("removes accents", () => {
		expect(parseCategory("Pokémon")).toEqual(["pokemon", "pokemon"])
		expect(parseCategory("Mônica")).toEqual(["monica", "monica"])
	})

	test("converts & to and", () => {
		expect(parseCategory("Dungeons & Dragons")).toEqual(["dungeons and dragons", "dungeons-and-dragons"])
		expect(parseCategory("Ben & Ed")).toEqual(["ben and ed", "ben-and-ed"])
	})

	test("handles multiple spaces and special characters", () => {
		expect(parseCategory("  Multiple   Spaces  ")).toEqual(["multiple spaces", "multiple-spaces"])
		expect(parseCategory("Special:!@#$%^&*Characters")).toEqual(["special and characters", "special-and-characters"])
	})

	test("handles empty or whitespace input", () => {
		expect(parseCategory("")).toEqual(["", ""])
		expect(parseCategory("   ")).toEqual(["", ""])
	})
})
