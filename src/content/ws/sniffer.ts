;(function () {
	const OrigWebSocket = window.WebSocket

	function CustomWebSocket(
		this: WebSocket & { __proto__: WebSocket },
		url: string | URL,
		protocols?: string | string[]
	) {
		if (!(this instanceof CustomWebSocket)) {
			return new (CustomWebSocket as any)(url, protocols)
		}

		const ws = protocols ? new OrigWebSocket(url, protocols) : new OrigWebSocket(url)

		// // Safe logging without eval
		// const safeStringify = (data: any) => {
		// 	try {
		// 		return typeof data === "string" ? data : JSON.stringify(data)
		// 	} catch (e) {
		// 		return String(data)
		// 	}
		// }

		ws.addEventListener("message", (event: MessageEvent) => {
			// console.log("WebSocket Received:", safeStringify(event.data))
		})

		ws.addEventListener("open", (event: Event) => {
			// console.log("WebSocket Opened:", url.toString())
		})

		ws.addEventListener("close", (event: CloseEvent) => {
			// console.log("WebSocket Closed:", url.toString())
		})

		ws.addEventListener("error", (event: Event) => {
			// console.log("WebSocket Error:", url.toString())
		})

		const originalSend = ws.send
		ws.send = function (data: string | ArrayBufferLike | Blob | ArrayBufferView) {
			// console.log("WebSocket Sending:", safeStringify(data))
			return originalSend.call(ws, data)
		}

		return ws
	}

	CustomWebSocket.prototype = OrigWebSocket.prototype
	CustomWebSocket.CONNECTING = OrigWebSocket.CONNECTING
	CustomWebSocket.OPEN = OrigWebSocket.OPEN
	CustomWebSocket.CLOSING = OrigWebSocket.CLOSING
	CustomWebSocket.CLOSED = OrigWebSocket.CLOSED

	window.WebSocket = CustomWebSocket as unknown as typeof WebSocket
})()
