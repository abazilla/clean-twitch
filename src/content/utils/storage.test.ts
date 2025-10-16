import { act, renderHook, waitFor } from "@testing-library/react"
import { isChrome, isFirefox, storage, useStorageState } from "../storage"

// Mock chrome and browser APIs
const mockChrome = {
	storage: {
		sync: {
			get: jest.fn(),
			set: jest.fn(),
		},
		onChanged: {
			addListener: jest.fn(),
			removeListener: jest.fn(),
		},
	},
}

const mockBrowser = {
	storage: {
		local: {
			get: jest.fn(),
			set: jest.fn(),
		},
		onChanged: {
			addListener: jest.fn(),
			removeListener: jest.fn(),
		},
	},
}

// Setup global mocks
Object.assign(global, { chrome: mockChrome, browser: mockBrowser })

describe("storage utility", () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, "error").mockImplementation(() => {})
		jest.spyOn(console, "log").mockImplementation(() => {})
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	describe("storage.get", () => {
		it("should get value from Chrome storage when in Chrome", async () => {
			const mockResult = { testKey: "testValue" }
			mockChrome.storage.sync.get.mockResolvedValue(mockResult)

			if (isChrome) {
				const result = await storage.get("testKey")
				expect(result).toBe("testValue")
				expect(mockChrome.storage.sync.get).toHaveBeenCalledWith("testKey")
			}
		})

		it("should get value from Firefox storage when in Firefox", async () => {
			const mockResult = { testKey: "testValue" }
			mockBrowser.storage.local.get.mockResolvedValue(mockResult)

			if (isFirefox) {
				const result = await storage.get("testKey")
				expect(result).toBe("testValue")
				expect(mockBrowser.storage.local.get).toHaveBeenCalledWith("testKey")
			}
		})

		it("should return undefined when key does not exist", async () => {
			mockChrome.storage.sync.get.mockResolvedValue({})
			mockBrowser.storage.local.get.mockResolvedValue({})

			const result = await storage.get("nonExistentKey")
			expect(result).toBeUndefined()
		})

		it("should handle errors gracefully and return undefined", async () => {
			const error = new Error("Storage error")
			mockChrome.storage.sync.get.mockRejectedValue(error)
			mockBrowser.storage.local.get.mockRejectedValue(error)

			const result = await storage.get("testKey")
			expect(result).toBeUndefined()
			expect(console.error).toHaveBeenCalledWith("Error getting testKey from storage:", error)
		})
	})

	describe("storage.set", () => {
		it("should set value in Chrome storage when in Chrome", async () => {
			mockChrome.storage.sync.set.mockResolvedValue(undefined)

			if (isChrome) {
				await storage.set("testKey", "testValue")
				expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ testKey: "testValue" })
			}
		})

		it("should set value in Firefox storage when in Firefox", async () => {
			mockBrowser.storage.local.set.mockResolvedValue(undefined)

			if (isFirefox) {
				await storage.set("testKey", "testValue")
				expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ testKey: "testValue" })
			}
		})

		it("should handle errors and rethrow them", async () => {
			const error = new Error("Storage error")
			mockChrome.storage.sync.set.mockRejectedValue(error)
			mockBrowser.storage.local.set.mockRejectedValue(error)

			await expect(storage.set("testKey", "testValue")).rejects.toThrow(error)
			expect(console.error).toHaveBeenCalledWith("Error setting testKey in storage:", error)
		})
	})

	describe("storage.getMultiple", () => {
		it("should get multiple values from Chrome storage when in Chrome", async () => {
			const mockResult = { key1: "value1", key2: "value2" }
			mockChrome.storage.sync.get.mockResolvedValue(mockResult)

			if (isChrome) {
				const result = await storage.getMultiple(["key1", "key2"])
				expect(result).toEqual(mockResult)
				expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(["key1", "key2"])
			}
		})

		it("should get multiple values from Firefox storage when in Firefox", async () => {
			const mockResult = { key1: "value1", key2: "value2" }
			mockBrowser.storage.local.get.mockResolvedValue(mockResult)

			if (isFirefox) {
				const result = await storage.getMultiple(["key1", "key2"])
				expect(result).toEqual(mockResult)
				expect(mockBrowser.storage.local.get).toHaveBeenCalledWith(["key1", "key2"])
			}
		})

		it("should return empty object on error", async () => {
			const error = new Error("Storage error")
			mockChrome.storage.sync.get.mockRejectedValue(error)
			mockBrowser.storage.local.get.mockRejectedValue(error)

			const result = await storage.getMultiple(["key1", "key2"])
			expect(result).toEqual({})
			expect(console.error).toHaveBeenCalledWith("Error getting multiple keys from storage:", error)
		})
	})

	describe("storage.onChanged", () => {
		it("should add listener to Chrome storage when in Chrome", () => {
			const callback = jest.fn()

			if (isChrome) {
				storage.onChanged.addListener(callback)
				expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalledWith(callback)
			}
		})

		it("should add listener to Firefox storage when in Firefox", () => {
			const callback = jest.fn()

			if (isFirefox) {
				storage.onChanged.addListener(callback)
				expect(mockBrowser.storage.onChanged.addListener).toHaveBeenCalledWith(callback)
			}
		})

		it("should remove listener from Chrome storage when in Chrome", () => {
			const callback = jest.fn()

			if (isChrome) {
				storage.onChanged.removeListener(callback)
				expect(mockChrome.storage.onChanged.removeListener).toHaveBeenCalledWith(callback)
			}
		})

		it("should remove listener from Firefox storage when in Firefox", () => {
			const callback = jest.fn()

			if (isFirefox) {
				storage.onChanged.removeListener(callback)
				expect(mockBrowser.storage.onChanged.removeListener).toHaveBeenCalledWith(callback)
			}
		})
	})
})

describe("useStorageState hook", () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, "error").mockImplementation(() => {})
		jest.spyOn(console, "log").mockImplementation(() => {})
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it("should initialize with the initial value", () => {
		mockChrome.storage.sync.get.mockResolvedValue({})
		mockBrowser.storage.local.get.mockResolvedValue({})

		const { result } = renderHook(() => useStorageState("testKey", "initialValue"))

		expect(result.current[0]).toBe("initialValue")
		expect(result.current[2]).toBe(false) // isInitialized
	})

	it("should load value from storage on mount", async () => {
		const mockStorageValue = "storageValue"
		mockChrome.storage.sync.get.mockResolvedValue({ testKey: mockStorageValue })
		mockBrowser.storage.local.get.mockResolvedValue({ testKey: mockStorageValue })

		const { result } = renderHook(() => useStorageState("testKey", "initialValue"))

		await waitFor(() => {
			expect(result.current[2]).toBe(true) // isInitialized
		})

		expect(result.current[0]).toBe(mockStorageValue)
	})

	it("should update value when storage changes", async () => {
		mockChrome.storage.sync.get.mockResolvedValue({})
		mockBrowser.storage.local.get.mockResolvedValue({})

		const { result } = renderHook(() => useStorageState("testKey", "initialValue"))

		await waitFor(() => {
			expect(result.current[2]).toBe(true) // isInitialized
		})

		// Simulate storage change
		const expectedArea = isChrome ? "sync" : "local"
		const mockChanges = {
			testKey: { newValue: "newValue" },
		}

		// Get the callback that was registered
		const addListenerMock = isChrome
			? mockChrome.storage.onChanged.addListener
			: mockBrowser.storage.onChanged.addListener

		const callback = addListenerMock.mock.calls[0][0]

		act(() => {
			callback(mockChanges, expectedArea)
		})

		expect(result.current[0]).toBe("newValue")
	})

	it("should update storage when updateValue is called", async () => {
		mockChrome.storage.sync.get.mockResolvedValue({})
		mockBrowser.storage.local.get.mockResolvedValue({})
		mockChrome.storage.sync.set.mockResolvedValue(undefined)
		mockBrowser.storage.local.set.mockResolvedValue(undefined)

		const { result } = renderHook(() => useStorageState("testKey", "initialValue"))

		await waitFor(() => {
			expect(result.current[2]).toBe(true) // isInitialized
		})

		await act(async () => {
			await result.current[1]("newValue")
		})

		expect(result.current[0]).toBe("newValue")

		if (isChrome) {
			expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ testKey: "newValue" })
		} else if (isFirefox) {
			expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ testKey: "newValue" })
		}
	})

	it("should handle errors when updating value", async () => {
		mockChrome.storage.sync.get.mockResolvedValue({})
		mockBrowser.storage.local.get.mockResolvedValue({})

		const error = new Error("Storage error")
		mockChrome.storage.sync.set.mockRejectedValue(error)
		mockBrowser.storage.local.set.mockRejectedValue(error)

		const { result } = renderHook(() => useStorageState("testKey", "initialValue"))

		await waitFor(() => {
			expect(result.current[2]).toBe(true) // isInitialized
		})

		await act(async () => {
			await result.current[1]("newValue")
		})

		expect(console.error).toHaveBeenCalledWith("Error setting testKey:", error)
		// Value should not change when there's an error
		expect(result.current[0]).toBe("initialValue")
	})

	it("should cleanup listener on unmount", async () => {
		mockChrome.storage.sync.get.mockResolvedValue({})
		mockBrowser.storage.local.get.mockResolvedValue({})

		const { unmount, result } = renderHook(() => useStorageState("testKey", "initialValue"))

		await waitFor(() => {
			expect(result.current[2]).toBe(true) // isInitialized
		})

		unmount()

		if (isChrome) {
			expect(mockChrome.storage.onChanged.removeListener).toHaveBeenCalled()
		} else if (isFirefox) {
			expect(mockBrowser.storage.onChanged.removeListener).toHaveBeenCalled()
		}
	})
})
