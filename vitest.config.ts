import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./test-setup.ts"],
		exclude: [
			...configDefaults.exclude, // Keeps Vitest's built-in exclusions (e.g., node_modules)
			"path/to/your/folder/**", // Replace with your folder, e.g., 'src/excluded-folder/**'
		],
	},
})
