import tailwindcss from "@tailwindcss/vite"
import checker from "vite-plugin-checker"
import { defineConfig, type WxtViteConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () =>
		({
			plugins: [
				tailwindcss(),
				checker({
					typescript: true,
					enableBuild: false,
					overlay: { initialIsOpen: false },
				}),
			],
		}) as WxtViteConfig,
	manifest: {
		// action: {
		// 	default_popup: "/entrypoints/popup/index.html",
		// },
		host_permissions: ["https://*.twitch.tv/*"],
		permissions: ["storage"],
		browser_specific_settings: {
			gecko: {
				id: "{8f2e5b0a-9d22-4a63-a9a0-b924e19fb1e2}",
			},
		},
	},
	webExt: {
		disabled: true,
	},
})
