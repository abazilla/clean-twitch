import React from "react"
import { createRoot } from "react-dom/client"

import App from "./App"

console.log("popup script test")

const rootElement = document.querySelector("#root")
if (rootElement) {
	const root = createRoot(rootElement)
	root.render(<App />)
} else {
	console.error("Root element not found")
}
