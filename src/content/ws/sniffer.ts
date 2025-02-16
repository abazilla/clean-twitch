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

		console.log("WebSocket Init:", { url, protocols })

		ws.addEventListener("message", (event: MessageEvent) => {
			// console.log("WebSocket Received:", JSON.parse(event.data))
		})

		ws.addEventListener("open", (event: Event) => {
			// console.log("WebSocket Opened:", event)
		})

		ws.addEventListener("close", (event: CloseEvent) => {
			// console.log("WebSocket Closed:", event)
		})

		ws.addEventListener("error", (event: Event) => {
			// console.log("WebSocket Error:", event)
		})

		const originalSend = ws.send
		ws.send = function (data: string | ArrayBufferLike | Blob | ArrayBufferView) {
			// console.log("WebSocket Sending:", data)
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
