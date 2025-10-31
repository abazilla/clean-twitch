import { createRoot } from "react-dom/client"
import App from "./App"

const rootElement = document.querySelector("#root")
if (rootElement) {
	createRoot(rootElement).render(<App />)
} else {
	console.error("Root element not found")
}
