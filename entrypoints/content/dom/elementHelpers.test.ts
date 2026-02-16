import { beforeEach, describe, expect, test } from "vitest"
import { UNIVERSAL_CLASS_NAME } from "./cssManager"
import { hasElements, toggleElementVisibility } from "./elementHelpers"

describe("hasElements", () => {
	test("returns false for null", () => {
		expect(hasElements(null)).toBe(false)
	})

	test("returns false for empty list", () => {
		const emptyNodeList = document.querySelectorAll(".non-existent-class")
		expect(hasElements(emptyNodeList)).toBe(false)
	})

	test("returns true for list with elements", () => {
		document.body.innerHTML = '<div class="test"></div>'
		const nodeList = document.querySelectorAll(".test")
		expect(hasElements(nodeList)).toBe(true)
	})

	test("returns true for single element", () => {
		const element = document.createElement("div")
		expect(hasElements(element)).toBe(true)
	})
})

describe("toggleElementVisibility", () => {
	beforeEach(() => {
		document.body.innerHTML = ""
	})

	test("handles null gracefully", () => {
		expect(() => toggleElementVisibility(null, true)).not.toThrow()
		expect(() => toggleElementVisibility(null, false)).not.toThrow()
	})

	test("adds class to single element when toggled true", () => {
		const element = document.createElement("div")
		toggleElementVisibility(element, true)
		expect(element.classList.contains(UNIVERSAL_CLASS_NAME)).toBe(true)
	})

	test("removes class from single element when toggled false", () => {
		const element = document.createElement("div")
		element.classList.add(UNIVERSAL_CLASS_NAME)
		toggleElementVisibility(element, false)
		expect(element.classList.contains(UNIVERSAL_CLASS_NAME)).toBe(false)
	})

	test("adds class to all elements when toggled true", () => {
		document.body.innerHTML = `
			<div class="test"></div>
			<div class="test"></div>
			<div class="test"></div>
		`
		const nodeList = document.querySelectorAll(".test")
		toggleElementVisibility(nodeList, true)

		nodeList.forEach((el) => {
			expect(el.classList.contains(UNIVERSAL_CLASS_NAME)).toBe(true)
		})
	})

	test("removes class from all elements when toggled false", () => {
		document.body.innerHTML = `
			<div class="test ${UNIVERSAL_CLASS_NAME}"></div>
			<div class="test ${UNIVERSAL_CLASS_NAME}"></div>
		`
		const nodeList = document.querySelectorAll(".test")
		toggleElementVisibility(nodeList, false)

		nodeList.forEach((el) => {
			expect(el.classList.contains(UNIVERSAL_CLASS_NAME)).toBe(false)
		})
	})

	test("handles empty list gracefully", () => {
		const emptyNodeList = document.querySelectorAll(".non-existent")
		expect(() => toggleElementVisibility(emptyNodeList, true)).not.toThrow()
		expect(() => toggleElementVisibility(emptyNodeList, false)).not.toThrow()
	})
})
