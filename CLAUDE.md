# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hide Twitch 2 is a Chrome/Firefox browser extension that hides unwanted sections of Twitch. It's built with TypeScript, React, and jQuery, using Parcel for bundling. The extension uses Chrome Extensions Manifest V3 and supports automatic reloading during development.

## Commands

**Development (with auto-reload):**

```bash
npm start
```

This starts Parcel in watch mode. Load the extension from the `dist/` folder in Chrome's Extensions Dashboard with Developer mode enabled.

**Build for production:**

```bash
npm run build          # Chrome extension
npm run build-firefox  # Firefox extension
```

Creates a ZIP file in the `releases/` folder ready for store submission.

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

- **Content Scripts**: Two content scripts run on Twitch pages
  - `content/index.ts`: Main content script with DOM manipulation and feature toggles
  - `content/ws/sniffer.ts`: Runs in MAIN world to intercept WebSocket traffic
- **Background Script**: `background/index.ts` manages declarative net request rules for blocking network requests
- **Popup UI**: React-based popup (`pages/popup/`) for extension settings

### Key Components

**Feature System**: Feature definitions in `src/pages/popup/types.ts` drive both the UI and content script behavior. Features can have child features and conflict rules.

**Content Script Flow**:

1. Initialize global CSS styles for hiding elements
2. Load feature states from Chrome storage
3. Set up URL change observer for SPA navigation
4. Listen for storage changes and toggle features accordingly

**Network Request Blocking**: Background script uses Chrome's Declarative Net Request API to block GraphQL requests, WebSocket connections, and stylesheets based on feature flags.

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
