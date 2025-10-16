# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hide Twitch 2 is a Chrome/Firefox browser extension that hides unwanted sections of Twitch. It's built with TypeScript, React, and jQuery, using Parcel for bundling. The extension uses Chrome Extensions Manifest V3 and supports automatic reloading during development.

## Commands

**Development:**

Currently broken - must re-build using `npm run build` to test new changes.

**Build for production:**

```bash
npm run build          # Builds both Chrome and Firefox extensions
npm run build-chrome   # Chrome extension only
npm run build-firefox  # Firefox extension only
```

Creates ZIP files in the `releases/` folder ready for store submission with version numbers.

**Testing:**

```bash
npm test
```

Runs Jest tests with TypeScript support.

**Linting:**

```bash
npx eslint .
```

Uses ESLint with TypeScript and React configurations.

## Architecture

### Extension Structure

- **Content Scripts**: Main content script runs on Twitch pages
  - `content/index.ts`: Main content script with DOM manipulation and feature toggles
  - `content/features/`: Feature-specific implementations (UI features, blocked categories/channels)
  - `content/utils/`: Utility functions for DOM manipulation, URL observation, and category parsing
- **Popup UI**: React-based popup (`pages/popup/`) for extension settings with Simple/Advanced modes

### Key Components

**Feature System**: The popup provides both Simple and Advanced modes for user interaction. Simple mode shows basic toggles, while Advanced mode provides granular control over individual features.

**Content Script Flow**:

1. Initialize global CSS styles for hiding elements
2. Load feature states from Chrome storage
3. Set up URL change observer for SPA navigation
4. Listen for storage changes and toggle features accordingly

**Modular Features**: Features are organized into separate modules:

- `uiFeatures.ts`: UI element hiding functionality
- `blockedCategories.ts`: Category-based content blocking
- `blockedChannels.ts`: Channel-based content blocking

**Element Hiding**: Uses a combination of:

- Dynamic CSS injection for scalable hiding
- jQuery-based DOM manipulation for complex selectors
- CSS classes like `.twitch-declutter-hidden` for consistent styling

### Storage & State

- Uses Chrome's `chrome.storage.sync` for cross-device settings sync
- Feature states are stored by feature ID
- Blocked channels/categories stored as structured data with enable flags

### Category/Channel Blocking

- **Category Parser**: `utils/categoryParser.ts` converts user input to URL-friendly category names
- **Dynamic CSS**: Generates CSS rules for hiding elements based on href attributes
- **Multi-target Hiding**: Supports hiding from sidebar, directory, and search results independently

## Development Notes

**Testing Setup**: Jest configured with `ts-jest` transformer and Chrome extension mocks via `jest-chrome`.

**Build System**: Parcel handles TypeScript compilation, bundling, and extension packaging. Supports both Chrome and Firefox targets.

**Code Style**: Uses Prettier with import organization and Tailwind CSS formatting plugins.

**File Structure**:

- `src-chrome/` and `src-firefox/`: Browser-specific manifest files
- `src/content/`: Content script functionality split into features and utilities
- `src/pages/popup/`: React popup UI with Simple/Advanced mode components
- Test files are co-located with source files using `__tests__/` directories
