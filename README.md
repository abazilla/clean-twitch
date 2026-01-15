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

### WebSocket Manager

The extension blocks chat WebSocket connections when chat is hidden to save bandwidth. This requires two scripts running in different JavaScript worlds:

```
ISOLATED World                         MAIN World
(websocketManager.ts)                  (websocket-interceptor.content.ts)
───────────────────────────────────────────────────────────────────────────
                                       window.WebSocket = Proxy
                                              ↓
User collapses chat                    [Intercepts new WebSocket()]
       ↓                                      ↓
hideChatColumnClick()                  blockChatWS flag checked
       ↓
isChatHidden() → true
       ↓
closeAndBlock()
       ↓
blockReconnection = true
       ↓
window.dispatchEvent(                  ← Shared DOM →
  '__cleanTwitch_closeAndBlock'
)                                             ↓
                                       addEventListener hears event
                                              ↓
                                       blockChatWS = true
                                       chatWebSocket.close()
                                              ↓
                                       Proxy blocks next 'new WebSocket()'
```

**Why two worlds?**

- **ISOLATED**: Content scripts run here by default. Cannot access page's `window.WebSocket`
- **MAIN**: Runs in the page's JavaScript context. Can intercept `WebSocket` but must bypass CSP

The two scripts communicate via CustomEvents on the shared DOM.

## License

This project is open source and available under the MIT License.
