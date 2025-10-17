import { vi } from 'vitest'

// Mock MutationObserver for all tests
const mockObserver = {
  observe: vi.fn(),
  disconnect: vi.fn(),
}

// Set up global MutationObserver mock
global.MutationObserver = vi.fn(() => mockObserver) as any