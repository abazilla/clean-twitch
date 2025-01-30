# Hide Twitch 2

A Chrome extension to hide annoying Twitch stuff. It supports **TypeScript**, **JSX**, and **automatic reloading** during development. Jest, ESLint and Prettier included, all bundled using [Parcel](https://parceljs.org/).

## Development

For development with automatic reloading:

```sh
npm start
```

Open the [Extensions Dashboard](chrome://extensions), enable "Developer mode", click "Load unpacked", and choose the `dist` folder.

When you make changes in `src` the background script and any content script will reload automatically.

## Production

When it's time to publish your Chrome extension, make a production build to submit to the Chrome Web Store. This project will use the version in `package.json`, unless you add a version to `src/manifest.json`.

> Make sure you have updated the name and version of your extension in `package.json`.

Run the following line:

```sh
npm run build
```

This will create a ZIP file with your package name and version in the `releases` folder.

## Source Layout

Your manifest is at `src/manifest.json`, and Parcel will bundle any files you include here. All the filepaths in your manifest should point to files in `src`.

## Features

- Uses Parcel to bundle your extension
- Chrome Extension automatic reloader
- Jest configuration for testing

## Resources

[Chrome Extension official documentation](https://developer.chrome.com/docs/webstore/)