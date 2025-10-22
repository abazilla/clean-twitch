import tailwindcss from "@tailwindcss/vite"
import { defineConfig, type WxtViteConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () =>
		({
			plugins: [tailwindcss()],
		}) as WxtViteConfig,
	manifest: {
		// action: {
		// 	default_popup: "/entrypoints/popup/index.html",
		// },
		host_permissions: ["https://*.twitch.tv/*"],
		permissions: ["tabs", "scripting", "storage"],
	},
	webExt: {
		disabled: true,
	},
})
