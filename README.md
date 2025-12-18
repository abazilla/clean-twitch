# Clean Twitch

WXT + React 19 + TypeScript + Tailwind 4.x + Vitest + pnpm

## Development

1. Install dependencies: `pnpm install`
2. Start development server: `pnpm dev:chrome` (Chrome) or `pnpm dev:firefox` (Firefox) or `pnpm dev:edge` (Edge)
3. Load the extension in your browser's developer mode

## Production Build

These zips are used for manual submission to each store.

- Chrome: `pnpm build:chrome && pnpm zip:chrome`
- Firefox: `pnpm build:firefox && pnpm zip:firefox`
- Edge: `pnpm build:edge && pnpm zip:edge`

- `pnpm submit` - Runs a script to automatically build and submit to all 3 stores. Needs setup via `pnpm wxt submit init`

## Other

- `pnpm compile` - TypeScript compilation check
- `pnpm test` - Run all tests with Vitest
- `pnpm test:ui` - Run tests with Vitest UI

## License

This project is open source and available under the MIT License.
