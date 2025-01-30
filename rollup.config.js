import path from "path"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import typescript from "@rollup/plugin-typescript"
import { createFilter } from "@rollup/pluginutils"
import { chromeExtension, simpleReloader } from "rollup-plugin-chrome-extension"
import copy from "rollup-plugin-copy"
// import { emptyDir } from "rollup-plugin-empty-dir"
import ignoreImport from "rollup-plugin-ignore-import"

// import zip from "rollup-plugin-zip"

const isProduction = process.env.NODE_ENV === "production"

function noopImport(options = {}) {
	const filter = createFilter("*.css", "node_modules/**")

	return {
		transform(code, id) {
			console.log({ id })
			if (!filter(id)) return

			const body = options.body || options.body === "" ? options.body : "export default undefined;"

			return {
				code: body,
				map: null,
			}
		},
	}
}

export default (async () => ({
	input: "src/manifest.json",
	output: {
		dir: "dist",
		format: "esm",
		chunkFileNames: path.join("chunks", "[name]-[hash].js"),
	},
	plugins: [
		noopImport({
			// Ignore all .scss and .css file imports while building the bundle
			include: ["**/*.scss", "**/*.css"],

			// Optional: replace body for ignored files. Default value is "export default undefined;"
			//   body: 'export default undefined;'
		}),

		replace({
			"process.env.NODE_ENV": isProduction
				? JSON.stringify("production")
				: JSON.stringify("development"),
			preventAssignment: true,
		}),
		// replace({
		// 	// include: "src/page/popup/index.html",
		// 	preventAssignment: true,
		// }),
		chromeExtension(),
		// Adds a Chrome extension reloader during watch mode
		simpleReloader(),
		resolve(),
		commonjs(),
		typescript(),
		// isProduction &&
		copy({
			targets: [{ src: "releases/index.css", dest: "dist/pages/popup" }],
		}),

		// copy({
		// 	assets: [
		// 		// You can include directories
		// 		"src/assets",
		// 		// You can also include files
		// 		"src/external/buffer.bin",
		// 	],
		// }),
		// isProduction
		// 	? replace({
		// 			include: "src/page/popup/index.html",
		// 			"lel.css": "index.css",
		// 			preventAssignment: true,
		// 		})
		// 	: null,
		// Empties the output dir before a new build
		// emptyDir(),
		// Outputs a zip file in ./releases
		// isProduction && zip({ dir: "releases" }),
	],
}))()
