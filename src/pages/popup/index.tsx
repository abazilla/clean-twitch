import { render } from "preact"

import App from "./App"

const rootElement = document.querySelector("#root")
if (rootElement) {
	render(<App />, rootElement)
} else {
	console.error("Root element not found")
}
