# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start development server for Chrome
- `pnpm dev:firefox` - Start development server for Firefox
- `pnpm build` - Build extension for production (Chrome)
- `pnpm build:firefox` - Build extension for Firefox
- `pnpm zip` - Create zip package for Chrome store
- `pnpm zip:firefox` - Create zip package for Firefox addon store
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
- **Popup** (`entrypoints/popup/`) - React-based extension popup interface

### Core Architecture Patterns

**Dual Mode System:**

- **Simple Mode** - Preset-based feature toggles (show_all, no_monetization, minimalist)
- **Advanced Mode** - Individual feature control

**Feature System:**

- Features defined in `entrypoints/content/toggles.ts` with metadata (conflicts, modes, children)
- Toggle functions mapped in `entrypoints/content/toggleMap.ts`
- UI implementations in `entrypoints/content/features/uiFeatures.ts`

**Storage & State:**

- Uses WXT storage API (`entrypoints/content/storage.ts`)
- Custom React hook `useStorageState` for popup state management
- Storage changes trigger content script updates via `storage.onChanged`

**Content Filtering:**

- Channel blocking (`entrypoints/content/features/blockedChannels.ts`)
- Category blocking (`entrypoints/content/features/blockedCategories.ts`)
- DOM manipulation utilities (`entrypoints/content/utils/dom.ts`)

### Key Architectural Concepts

**Toggle System:** Each feature has an ID that maps to a toggle function. Features can have parent-child relationships and conflict definitions.

**CSS Injection:** The extension injects styles with `.clean-twitch-clutter` class. Test mode shows elements with red background instead of hiding them.

**URL Monitoring:** Uses `setupUrlChangeListener` to detect navigation changes on Twitch's SPA.

**Component Structure:** React popup uses component composition with `SimpleMode` and `AdvancedMode` components.

## Configuration Files

- `wxt.config.ts` - WXT framework configuration with React module and Tailwind
- `tsconfig.json` - TypeScript configuration extending WXT defaults
- Package manager: **pnpm** (uses pnpm-lock.yaml)

## Technology Stack

- **Framework:** WXT (Web Extension Toolkit)
- **Frontend:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4.x
- **Permissions:** tabs, scripting, storage, host_permissions for twitch.tv
- **External:** jQuery for DOM manipulation in content scripts

## WXT Documentation References

When working with WXT-specific features, Claude can access the following documentation:

- **General Documentation**: https://wxt.dev/knowledge/docs.txt
- **API Reference**: https://wxt.dev/knowledge/api-reference.txt
- **Blog/Updates**: https://wxt.dev/knowledge/blog.txt

These references provide comprehensive information about WXT configuration, APIs, and best practices for browser extension development.
