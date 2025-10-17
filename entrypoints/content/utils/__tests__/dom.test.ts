import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { toggleElementVisibility, updateElement } from "../dom"

// Mock jQuery for testing
const mockJQuery = {
	addClass: vi.fn().mockReturnThis(),
	removeClass: vi.fn().mockReturnThis(),
	length: 1,
}

describe("DOM utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, "log").mockImplementation(() => {})
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	describe("toggleElementVisibility", () => {
		test("should add hidden class when toggled is true", () => {
			const $element = mockJQuery as any

			toggleElementVisibility($element, true)

			expect($element.addClass).toHaveBeenCalledWith("twitch-declutter-hidden")
		})

		test("should remove hidden class when toggled is false", () => {
			const $element = mockJQuery as any

			toggleElementVisibility($element, false)

			expect($element.removeClass).toHaveBeenCalledWith("twitch-declutter-hidden")
		})
	})

	describe("updateElement", () => {
		test("should call action immediately when element is found", () => {
			const mockAction = vi.fn()
			const mockGetElement = vi.fn().mockReturnValue(mockJQuery)

			updateElement(mockGetElement, mockAction)

			expect(mockGetElement).toHaveBeenCalled()
			expect(mockAction).toHaveBeenCalledWith(mockJQuery)
			expect(MutationObserver).not.toHaveBeenCalled()
		})

		test("should use MutationObserver when element is not found initially", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = vi.fn().mockReturnValue(emptyElement)
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction)

			expect(mockGetElement).toHaveBeenCalled()
			expect(mockAction).not.toHaveBeenCalled()
			expect(MutationObserver).toHaveBeenCalled()
		})

		test("should set timeout when using 'stop_on_found' persistence", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = vi.fn().mockReturnValue(emptyElement)
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction, 5000, "stop_on_found")

			// Verify MutationObserver was created
			expect(MutationObserver).toHaveBeenCalled()

			// Fast-forward time to trigger timeout
			vi.advanceTimersByTime(5000)

			// The observer should be disconnected via the timeout
			const observerInstance = (MutationObserver as any).mock.results[0].value
			expect(observerInstance.disconnect).toHaveBeenCalled()
		})

		test("should not set timeout when using 'no_timeout'", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = vi.fn().mockReturnValue(emptyElement)
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction, "no_timeout", "stop_on_found")

			// Verify MutationObserver was created
			expect(MutationObserver).toHaveBeenCalled()

			// Fast-forward time - should not trigger timeout since we used "no_timeout"
			vi.advanceTimersByTime(10000)

			// The observer should not be disconnected since no timeout was set
			const observerInstance = (MutationObserver as any).mock.results[0].value
			expect(observerInstance.disconnect).not.toHaveBeenCalled()
		})

		test("should use default parameters when not specified", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = vi.fn().mockReturnValue(emptyElement)
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction)

			// Should use default timeout of 10000ms and 'stop_on_found'
			vi.advanceTimersByTime(10000)
			
			const observerInstance = (MutationObserver as any).mock.results[0].value
			expect(observerInstance.disconnect).toHaveBeenCalled()
		})

		test("should call action and disconnect observer when element is found in mutation", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const foundElement = { ...mockJQuery, length: 1 }
			const mockGetElement = vi
				.fn()
				.mockReturnValueOnce(emptyElement) // Initial call
				.mockReturnValueOnce(foundElement) // In mutation callback
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction, 5000, "stop_on_found")

			// Get the observer callback and simulate it
			const observerCallback = (MutationObserver as any).mock.calls[0][0]
			const observerInstance = (MutationObserver as any).mock.results[0].value
			
			observerCallback([], observerInstance)

			expect(mockAction).toHaveBeenCalledWith(foundElement)
			expect(observerInstance.disconnect).toHaveBeenCalled()
		})

		test("should not disconnect observer when using 'always_on' persistence", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const foundElement = { ...mockJQuery, length: 1 }
			const mockGetElement = vi
				.fn()
				.mockReturnValueOnce(emptyElement) // Initial call
				.mockReturnValueOnce(foundElement) // In mutation callback
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction, 5000, "always_on")

			// Get the observer callback and simulate it
			const observerCallback = (MutationObserver as any).mock.calls[0][0]
			const observerInstance = (MutationObserver as any).mock.results[0].value
			
			observerCallback([], observerInstance)

			expect(mockAction).toHaveBeenCalledWith(foundElement)
			expect(observerInstance.disconnect).not.toHaveBeenCalled()
		})

		test("should not call action when element is still not found in mutation", () => {
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = vi.fn().mockReturnValue(emptyElement)
			const mockAction = vi.fn()

			updateElement(mockGetElement, mockAction)

			// Get the observer callback and simulate it when element is still not found
			const observerCallback = (MutationObserver as any).mock.calls[0][0]
			const observerInstance = (MutationObserver as any).mock.results[0].value
			
			observerCallback([], observerInstance)

			expect(mockAction).not.toHaveBeenCalled()
			expect(observerInstance.disconnect).not.toHaveBeenCalled()
		})
	})
})