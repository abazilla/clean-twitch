# Clean Twitch

Twitch without the clutter.

## Features

- **Content Filtering**: Block specific channels and categories
- **UI Customization**: Hide various Twitch UI elements (ads, recommendations, chat, etc.)
- **Dual Mode System**:
  - **Simple Mode**: Quick presets (Show All, No Monetization, Minimalist)
  - **Advanced Mode**: Individual feature control
- **Test Mode**: Preview changes with visual indicators before applying

## Installation

### Development

1. Install dependencies: `pnpm install`
2. Start development server: `pnpm dev` (Chrome) or `pnpm dev:firefox` (Firefox)
3. Load the extension in your browser's developer mode

### Production Build

- Chrome: `pnpm build && pnpm zip`
- Firefox: `pnpm build:firefox && pnpm zip:firefox`

## Development Commands

### Core Development

- `pnpm dev` - Start development server for Chrome
- `pnpm dev:firefox` - Start development server for Firefox
- `pnpm build` - Build extension for production (Chrome)
- `pnpm build:firefox` - Build extension for Firefox
- `pnpm zip` - Create zip package for Chrome store
- `pnpm zip:firefox` - Create zip package for Firefox addon store
- `pnpm compile` - TypeScript compilation check

### Testing

- `pnpm test` - Run all tests with Vitest
- `pnpm test:ui` - Run tests with Vitest UI

## Technology Stack

- **Framework**: WXT (Web Extension Toolkit)
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.x
- **Testing**: Vitest with jsdom
- **Package Manager**: pnpm

## Architecture

### Extension Entry Points

- **Content Script**: Main logic injected into Twitch pages
- **Popup**: React-based extension popup interface

### Key Components

- **Feature System**: Toggle-based features with conflict resolution
- **Storage Management**: WXT storage API with React hooks
- **DOM Manipulation**: CSS injection and element hiding
- **URL Monitoring**: SPA navigation detection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Build and test the extension: `pnpm build`
6. Submit a pull request

## License

This project is open source and available under the MIT License.
