// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function setupMockWebSocket() {
	const sockets: any[] = [];

	function MockWebSocket(this: any, url: string) {
		this.url = url;
		this.readyState = 0;
		this.OPEN = 1;
		this.CONNECTING = 0;
		this.CLOSED = 3;
		this.send = vi.fn();
		this.close = vi.fn(() => {
			this.readyState = 3;
			if (this.onclose) this.onclose();
		});

		this.addEventListener = vi.fn();

		this._triggerOpen = () => {
			this.readyState = 1;
			if (this.onopen) this.onopen();
		};
		this._triggerClose = () => {
			this.readyState = 3;
			if (this.onclose) this.onclose();
		};
		this._triggerMessage = (data: string) => {
			if (this.onmessage) this.onmessage({ data });
		};
		this._triggerError = (e: any) => {
			if (this.onerror) this.onerror(e);
		};

		sockets.push(this);
	}

	MockWebSocket.OPEN = 1;
	MockWebSocket.CONNECTING = 0;
	MockWebSocket.CLOSED = 3;

	globalThis.WebSocket = MockWebSocket as any;
	return sockets;
}

describe("WebSocketService reconnect", () => {
	let sockets: any[];

	beforeEach(async () => {
		vi.restoreAllMocks();
		vi.resetModules();
		sockets = setupMockWebSocket();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function getLastSocket() {
		return sockets[sockets.length - 1];
	}

	it("connects successfully", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise = websocketService.connect("test-conn");
		getLastSocket()._triggerOpen();
		await promise;
		const conn = websocketService.getConnection("test-conn");
		expect(conn).toBeTruthy();
		expect(conn?.status).toBe("connected");
	});

	it("rejects connect on error", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise = websocketService.connect("test-conn");
		getLastSocket()._triggerError(new Error("connection refused"));
		await expect(promise).rejects.toThrow();
	});

	it("emits disconnected event on close", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise = websocketService.connect("test-conn");
		getLastSocket()._triggerOpen();
		await promise;

		const disconnectHandler = vi.fn();
		websocketService.on("disconnected", disconnectHandler);
		getLastSocket()._triggerClose();
		expect(disconnectHandler).toHaveBeenCalledWith("test-conn");
	});

	it("sends JSON messages when connected", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise = websocketService.connect("test-conn");
		getLastSocket()._triggerOpen();
		await promise;

		websocketService.send(
			"test-conn",
			"handshake_init",
			{ msg: "hello" },
			"alice",
			"bob",
		);
		expect(getLastSocket().send).toHaveBeenCalledOnce();
		const sent = JSON.parse(getLastSocket().send.mock.calls[0][0]);
		expect(sent.type).toBe("handshake_init");
		expect(sent.payload).toEqual({ msg: "hello" });
		expect(sent.senderId).toBe("alice");
		expect(sent.recipientId).toBe("bob");
	});

	it("throws on send when not connected", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		expect(() =>
			websocketService.send("test-conn", "handshake_init", {}, "alice"),
		).toThrow("not connected");
	});

	it("receives messages and emits typed events", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise = websocketService.connect("test-conn");
		getLastSocket()._triggerOpen();
		await promise;

		const msgHandler = vi.fn();
		websocketService.on("handshake_response", msgHandler);
		getLastSocket()._triggerMessage(
			JSON.stringify({
				type: "handshake_response",
				payload: { key: "value" },
				senderId: "bob",
				timestamp: new Date().toISOString(),
			}),
		);

		expect(msgHandler).toHaveBeenCalledOnce();
		expect(msgHandler.mock.calls[0][0].type).toBe("handshake_response");
		expect(msgHandler.mock.calls[0][0].payload).toEqual({ key: "value" });
	});

	it("reconnects by disconnecting old then connecting new", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise1 = websocketService.connect("test-conn");
		getLastSocket()._triggerOpen();
		await promise1;

		const oldClose = getLastSocket().close;
		const promise2 = websocketService.connect("test-conn");
		expect(oldClose).toHaveBeenCalledOnce();
		getLastSocket()._triggerOpen();
		await promise2;

		expect(websocketService.getConnection("test-conn")?.status).toBe(
			"connected",
		);
	});

	it("disconnects all connections", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const p1 = websocketService.connect("conn-a");
		getLastSocket()._triggerOpen();
		await p1;
		const p2 = websocketService.connect("conn-b");
		getLastSocket()._triggerOpen();
		await p2;

		expect(websocketService.getAllConnections()).toHaveLength(2);
		websocketService.disconnect();
		expect(websocketService.getAllConnections()).toHaveLength(0);
	});

	it("uses onceMessage for one-shot listener", async () => {
		const { websocketService } = await import("@/services/websocket.service");
		const promise = websocketService.connect("test-conn");
		getLastSocket()._triggerOpen();
		await promise;

		const callback = vi.fn();
		websocketService.onceMessage("test-conn", "handshake_init", callback);

		getLastSocket()._triggerMessage(
			JSON.stringify({
				type: "handshake_init",
				payload: { first: true },
				senderId: "alice",
				timestamp: new Date().toISOString(),
			}),
		);

		expect(callback).toHaveBeenCalledOnce();
		expect(callback.mock.calls[0][0].payload).toEqual({ first: true });

		getLastSocket()._triggerMessage(
			JSON.stringify({
				type: "handshake_init",
				payload: { second: true },
				senderId: "alice",
				timestamp: new Date().toISOString(),
			}),
		);

		expect(callback).toHaveBeenCalledTimes(1);
	});
});
