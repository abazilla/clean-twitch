# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start development server for Chrome
- `pnpm dev:firefox` - Start development server for Firefox
- `pnpm dev:edge` - Start development server for Edge
- `pnpm build` - Build extension for production (Chrome)
- `pnpm build:firefox` - Build extension for Firefox
- `pnpm build:edge` - Build extension for Edge
- `pnpm zip` - Create zip package for Chrome store
- `pnpm zip:firefox` - Create zip package for Firefox addon store
- `pnpm zip:edge` - Create zip package for Edge addon store
- `pnpm compile` - TypeScript compilation check (no emit)

### Testing

The project uses **Vitest** as the test runner with the following setup:

**Commands:**

- `pnpm test` - Run all tests
- `pnpm test:ui` - Run tests with Vitest UI

**Test Structure:**

- `entrypoints/content/utils/__tests__/` - Contains test files using Vitest syntax
- Test files use `describe`, `test`, `expect`, `vi` (mocking) from Vitest
- Global setup in `test-setup.ts` includes MutationObserver mocking for DOM tests

**Configuration:**

- `vitest.config.ts` - Vitest configuration with jsdom environment
- `test-setup.ts` - Global test setup file for mocks and utilities

## Project Architecture

This is a **WXT-based browser extension** for Twitch that provides content filtering and UI customization. The extension operates in two modes:

### Extension Entry Points

- **Content Script** (`entrypoints/content/index.ts`) - Main logic injected into Twitch pages
- **Popup** (`entrypoints/popup/index.tsx`) - React-based extension popup interface
- **Background** (`entrypoints/background.ts`) - Background script for extension lifecycle

### Core Architecture Patterns

**Dual Mode System:**

- **Simple Mode** - Preset-based feature toggles (show_all, no_monetization, minimalist)
- **Advanced Mode** - Individual feature control

**Feature System:**

- Feature toggles mapped in `entrypoints/content/features/toggleMap.ts`
- Feature controller manages state in `entrypoints/content/featureController.ts`
- UI button system in `entrypoints/content/ui/` directory

**Storage & State:**

- Storage abstraction in `entrypoints/content/utils/storageHandler.ts`
- Custom React hook `useStorageState` for popup state management (`entrypoints/popup/storage.ts`)
- Storage changes trigger content script updates via `storage.onChanged`

**Content Filtering:**

- Channel blocking (`entrypoints/content/features/blockedChannels.ts`)
- Category blocking (`entrypoints/content/features/blockedCategories.ts`)
- DOM manipulation utilities (`entrypoints/content/utils/jsManipulators.ts`)

### Key Architectural Concepts

**Toggle System:** Each feature has an ID that maps to a toggle function. Features can have parent-child relationships and conflict definitions.

**CSS Injection:** The extension injects styles with `.clean-twitch-clutter` class. Test mode shows elements with red background instead of hiding them.

**URL Monitoring:** Uses URL observer (`entrypoints/content/utils/urlObserver.ts`) to detect navigation changes on Twitch's SPA.

**Component Structure:** React popup uses component composition with `SimpleMode` and `AdvancedMode` components.

## Configuration Files

- `wxt.config.ts` - WXT framework configuration with React module and Tailwind
- `tsconfig.json` - TypeScript configuration extending WXT defaults
- Package manager: **pnpm** (uses pnpm-lock.yaml)

## Technology Stack

- **Framework:** WXT (Web Extension Toolkit)
- **Frontend:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4.x
- **Permissions:** storage, host_permissions for twitch.tv

## WXT Documentation References

When working with WXT-specific features, Claude can access the following documentation:

- **General Documentation**: https://wxt.dev/knowledge/docs.txt
- **API Reference**: https://wxt.dev/knowledge/api-reference.txt
- **Blog/Updates**: https://wxt.dev/knowledge/blog.txt

These references provide comprehensive information about WXT configuration, APIs, and best practices for browser extension development.

## Recent Development History

**Current Version: v0.1.3**
- Monthly recap hiding, chat clip section hiding, VOD filtering improvements
- Browse categories can be hidden with "hide" buttons
- Search results filtered by blocked channels/categories
- Auto-detection and handling of adblock popups

**Architecture:**
- All DOM manipulation uses vanilla JavaScript (no jQuery)
- CSS-first approach with `.clean-twitch-clutter` class
- Test mode shows red backgrounds for debugging

## File Structure

```
entrypoints/
├── content/
│   ├── index.ts                    # Main content script
│   ├── featureController.ts        # Feature management
│   ├── features/
│   │   ├── blockedChannels.ts      # Channel filtering
│   │   ├── blockedCategories.ts    # Category filtering
│   │   ├── domManipulators.ts      # DOM manipulation (vanilla JS)
│   │   ├── toggleMap.ts            # Feature toggle mapping
│   │   └── definitions.ts          # Type definitions
│   ├── ui/
│   │   ├── buttonInjector.ts       # Hide button injection
│   │   ├── buttonManager.ts        # Button management
│   │   ├── buttonHandlers.ts       # Button event handlers
│   │   ├── buttonStyles.ts         # Button styling
│   │   └── targetConfigs.ts        # UI target configuration
│   └── utils/
│       ├── categoryParser.ts       # Category parsing logic
│       ├── cssManipulators.ts      # CSS utilities
│       ├── jsManipulators.ts       # JS DOM utilities
│       ├── storageHandler.ts       # Storage abstraction
│       ├── urlObserver.ts          # URL change detection
│       └── __tests__/              # Vitest tests
└── popup/
    ├── index.tsx                   # React popup entry
    ├── App.tsx                     # Main popup component
    ├── storage.ts                  # Popup storage hooks
    └── components/                 # React components
```

## Technical Implementation

**CSS Classes:**
- `.clean-twitch-clutter` - Primary hiding class (`display: none !important`)
- `.test-mode-bg` - Red background for debugging (test mode)

**Storage Keys:**
- Core: `mode`, `simple_mode_preset`, `test_mode`
- Filters: `blockedChannels`, `blockedCategories`
- Features: Individual feature IDs map to boolean values

**DOM Strategy:**
- CSS-first approach for performance
- Mutation observers for dynamic content
- URL observer for SPA navigation (`urlObserver.ts`)
- Type-safe element selection and manipulation

**Performance:**
- Minimal DOM queries with specific selectors
- Batched storage operations
- CSS :has() pseudo-class for complex selections
