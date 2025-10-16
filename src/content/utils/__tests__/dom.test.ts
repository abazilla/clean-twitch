import { toggleElementVisibility, updateElement } from "../dom"

// Mock jQuery for testing
const mockJQuery = {
	addClass: jest.fn().mockReturnThis(),
	removeClass: jest.fn().mockReturnThis(),
	length: 1,
}

// Mock MutationObserver
const mockObserver = {
	observe: jest.fn(),
	disconnect: jest.fn(),
}

// Note: tests are somewhat flawed - we globally use 1 observer mock object.
// this works fine in tests as they are run sequentially, and there aren't
// multiple instances of updateElement in 1 test.
global.MutationObserver = jest.fn().mockImplementation(() => mockObserver)

// Mock document.body
Object.defineProperty(global, "document", {
	value: {
		body: document.createElement("body"),
	},
})

describe("DOM utilities", () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, "log").mockImplementation(() => {})
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.restoreAllMocks()
		jest.useRealTimers()
	})

	describe("toggleElementVisibility", () => {
		it("should add hidden class when toggled is true", () => {
			const $element = mockJQuery as any

			toggleElementVisibility($element, true)

			expect($element.addClass).toHaveBeenCalledWith("twitch-declutter-hidden")
		})

		it("should remove hidden class when toggled is false", () => {
			const $element = mockJQuery as any

			toggleElementVisibility($element, false)

			expect($element.removeClass).toHaveBeenCalledWith("twitch-declutter-hidden")
		})
	})

	describe("updateElement", () => {
		it("should call action immediately when element is found", () => {
			const mockAction = jest.fn()
			const mockGetElement = jest.fn().mockReturnValue(mockJQuery)

			updateElement(mockGetElement, mockAction)

			expect(mockGetElement).toHaveBeenCalled()
			expect(mockAction).toHaveBeenCalledWith(mockJQuery)
			expect(MutationObserver).not.toHaveBeenCalled()
		})

		it("should use MutationObserver when element is not found initially", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = jest.fn().mockReturnValue(emptyElement)

			updateElement(mockGetElement, mockAction)

			expect(mockGetElement).toHaveBeenCalled()
			expect(mockAction).not.toHaveBeenCalled()
			expect(MutationObserver).toHaveBeenCalled()
			expect(mockObserver.observe).toHaveBeenCalledWith(document.body, {
				childList: true,
				subtree: true,
			})
		})

		it("should set timeout when using 'stop_on_found' persistence", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = jest.fn().mockReturnValue(emptyElement)

			updateElement(mockGetElement, mockAction, 5000, "stop_on_found")

			// Fast-forward time to trigger timeout
			jest.advanceTimersByTime(5000)

			expect(mockObserver.disconnect).toHaveBeenCalled()
		})

		it("should not set timeout when using 'no_timeout'", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = jest.fn().mockReturnValue(emptyElement)

			updateElement(mockGetElement, mockAction, "no_timeout", "stop_on_found")

			// Fast-forward time - should not trigger timeout since we used "no_timeout"
			jest.advanceTimersByTime(10000)

			// Check that setTimeout was not called with the timeout callback
			expect(setTimeout).not.toHaveBeenCalled()
		})

		it("should use default parameters when not specified", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = jest.fn().mockReturnValue(emptyElement)

			updateElement(mockGetElement, mockAction)

			// Should use default timeout of 10000ms and 'stop_on_found'
			jest.advanceTimersByTime(10000)
			expect(mockObserver.disconnect).toHaveBeenCalled()
		})

		it("should call action and disconnect observer when element is found in mutation", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const foundElement = { ...mockJQuery, length: 1 }
			const mockGetElement = jest
				.fn()
				.mockReturnValueOnce(emptyElement) // Initial call
				.mockReturnValueOnce(foundElement) // In mutation callback

			updateElement(mockGetElement, mockAction, 5000, "stop_on_found")

			// Simulate MutationObserver callback
			const observerCallback = (MutationObserver as jest.Mock).mock.calls[0][0]
			observerCallback([], mockObserver)

			expect(mockAction).toHaveBeenCalledWith(foundElement)
			expect(mockObserver.disconnect).toHaveBeenCalled()
		})

		it("should not disconnect observer when using 'always_on' persistence", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const foundElement = { ...mockJQuery, length: 1 }
			const mockGetElement = jest
				.fn()
				.mockReturnValueOnce(emptyElement) // Initial call
				.mockReturnValueOnce(foundElement) // In mutation callback

			updateElement(mockGetElement, mockAction, 5000, "always_on")

			// Simulate MutationObserver callback
			const observerCallback = (MutationObserver as jest.Mock).mock.calls[0][0]
			observerCallback([], mockObserver)

			expect(mockAction).toHaveBeenCalledWith(foundElement)
			expect(mockObserver.disconnect).not.toHaveBeenCalled()
		})

		it("should not call action when element is still not found in mutation", () => {
			const mockAction = jest.fn()
			const emptyElement = { ...mockJQuery, length: 0 }
			const mockGetElement = jest.fn().mockReturnValue(emptyElement)

			updateElement(mockGetElement, mockAction)

			// Simulate MutationObserver callback when element is still not found
			const observerCallback = (MutationObserver as jest.Mock).mock.calls[0][0]
			observerCallback([], mockObserver)

			expect(mockAction).not.toHaveBeenCalled()
			expect(mockObserver.disconnect).not.toHaveBeenCalled()
		})
	})
})
