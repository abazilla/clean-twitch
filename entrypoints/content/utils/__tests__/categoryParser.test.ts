import { describe, test, expect } from 'vitest'
import { parseCategoryName } from "../categoryParser"

describe("parseCategoryName", () => {
	test("converts spaces to hyphens", () => {
		expect(parseCategoryName("Just Chatting")).toBe("just-chatting")
		expect(parseCategoryName("World of Warcraft")).toBe("world-of-warcraft")
	})

	test("removes apostrophes", () => {
		expect(parseCategoryName("Player's Unknown")).toBe("players-unknown")
		expect(parseCategoryName("Don't Starve")).toBe("dont-starve")
	})

	test("converts to lowercase", () => {
		expect(parseCategoryName("VALORANT")).toBe("valorant")
		expect(parseCategoryName("Counter-Strike")).toBe("counter-strike")
	})

	test("keeps numbers", () => {
		expect(parseCategoryName("Final Fantasy 14")).toBe("final-fantasy-14")
		expect(parseCategoryName("GTA 5")).toBe("gta-5")
	})

	test("removes colons", () => {
		expect(parseCategoryName("Half-Life: Alyx")).toBe("half-life-alyx")
		expect(parseCategoryName("Portal: 2")).toBe("portal-2")
	})

	test("handles periods in acronyms vs regular text", () => {
		expect(parseCategoryName("R.E.P.O")).toBe("r-e-p-o")
		expect(parseCategoryName("Super Smash Bros. Melee")).toBe("super-smash-bros-melee")
		expect(parseCategoryName("Dr. Mario")).toBe("dr-mario")
	})

	test("removes accents", () => {
		expect(parseCategoryName("Pokémon")).toBe("pokemon")
		expect(parseCategoryName("Mônica")).toBe("monica")
	})

	test("converts & to and", () => {
		expect(parseCategoryName("Dungeons & Dragons")).toBe("dungeons-and-dragons")
		expect(parseCategoryName("Ben & Ed")).toBe("ben-and-ed")
	})

	test("handles multiple spaces and special characters", () => {
		expect(parseCategoryName("  Multiple   Spaces  ")).toBe("multiple-spaces")
		expect(parseCategoryName("Special:!@#$%^&*Characters")).toBe("special-and-characters")
	})

	test("handles empty or whitespace input", () => {
		expect(parseCategoryName("")).toBe("")
		expect(parseCategoryName("   ")).toBe("")
	})
})
