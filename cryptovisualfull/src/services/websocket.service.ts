type Listener<T = unknown> = (payload: T) => void;
type EventMap = Record<string, Listener | Listener[]>;

interface NodeEventEmitter {
	listeners(eventName: string | symbol): Listener[];
	listenerCount(eventName: string | symbol): number;
	emit(eventName: string | symbol, ...args: unknown[]): boolean;
	on(eventName: string | symbol, listener: Listener): this;
	once(eventName: string | symbol, listener: Listener): this;
	off(
		eventName: string | symbol,
		listener: Listener,
	): this;
	removeListener(
		eventName: string | symbol,
		listener: Listener,
	): this;
	removeAllListeners(event?: string | symbol): this;
	prependListener(
		eventName: string | symbol,
		listener: Listener,
	): this;
	prependOnceListener(
		eventName: string | symbol,
		listener: Listener,
	): this;
}

class EventEmitter implements NodeEventEmitter {
	private _events: Map<string | symbol, Listener[]> = new Map();

	private _getListeners(eventName: string | symbol): Listener[] {
		return this._events.get(eventName) ?? [];
	}

	listeners(eventName: string | symbol): Listener[] {
		return [...this._getListeners(eventName)];
	}

	listenerCount(eventName: string | symbol): number {
		return this._getListeners(eventName).length;
	}

	emit(eventName: string | symbol, ...args: unknown[]): boolean {
		const listeners = this._getListeners(eventName).slice();
		if (listeners.length === 0) return false;
		for (const listener of listeners) {
			try {
				listener(...args);
			} catch (err) {
				console.error(
					`[EventEmitter] listener for "${String(eventName)}" threw:`,
					err,
				);
			}
		}
		return true;
	}

	on(eventName: string | symbol, listener: Listener): this {
		const listeners = this._getListeners(eventName);
		listeners.push(listener);
		this._events.set(eventName, listeners);
		return this;
	}

	once(eventName: string | symbol, listener: Listener): this {
		const wrapped: Listener = (...args: unknown[]) => {
			this.off(eventName, wrapped);
			listener(...args);
		};
		wrapped.listener = listener;
		return this.on(eventName, wrapped);
	}

	off(eventName: string | symbol, listener: Listener): this {
		return this.removeListener(eventName, listener);
	}

	removeListener(eventName: string | symbol, listener: Listener): this {
		const listeners = this._getListeners(eventName);
		const idx = listeners.indexOf(listener);
		if (idx !== -1) {
			listeners.splice(idx, 1);
			if (listeners.length === 0) {
				this._events.delete(eventName);
			} else {
				this._events.set(eventName, listeners);
			}
		}
		return this;
	}

	removeAllListeners(event?: string | symbol): this {
		if (event === undefined) {
			this._events.clear();
		} else {
			this._events.delete(event);
		}
		return this;
	}

	prependListener(eventName: string | symbol, listener: Listener): this {
		const listeners = this._getListeners(eventName);
		listeners.unshift(listener);
		this._events.set(eventName, listeners);
		return this;
	}

	prependOnceListener(eventName: string | symbol, listener: Listener): this {
		const wrapped: Listener = (...args: unknown[]) => {
			this.off(eventName, wrapped);
			listener(...args);
		};
		wrapped.listener = listener;
		return this.prependListener(eventName, wrapped);
	}

	addListener = this.on;
}

export interface WebSocketMessage {
	type:
		| "handshake_init"
		| "handshake_response"
		| "key_exchange"
		| "metadata"
		| "error";
	payload: any;
	senderId: string;
	recipientId?: string;
	timestamp: Date;
}

export interface WebSocketConnection {
	id: string;
	socket: WebSocket;
	status: "connecting" | "connected" | "disconnected";
}

export class WebSocketService extends EventEmitter {
	private connections: Map<string, WebSocketConnection> = new Map();
	private readonly baseUrl: string = "ws://localhost:4001";

	async connect(
		connectionId: string,
		apiKey: string = "dev-secret-key",
	): Promise<void> {
		if (this.connections.has(connectionId)) {
			this.disconnect(connectionId);
		}

		return new Promise<void>((resolve, reject) => {
			const url = `${this.baseUrl}?api_key=${apiKey}`;
			const socket = new WebSocket(url);

			this.connections.set(connectionId, {
				id: connectionId,
				socket,
				status: "connecting",
			});

			socket.onopen = () => {
				const conn = this.connections.get(connectionId);
				if (conn) conn.status = "connected";
				console.log(`WebSocket [${connectionId}] connected to gateway`);
				resolve();
			};

			socket.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					this.emit(message.type, message);
					this.emit(`${connectionId}:${message.type}`, message);
				} catch (error) {
					console.error(
						`Error parsing WebSocket [${connectionId}] message:`,
						error,
					);
				}
			};

			socket.onerror = (error) => {
				console.error(`WebSocket [${connectionId}] error:`, error);
				reject(error);
			};

			socket.onclose = () => {
				const conn = this.connections.get(connectionId);
				if (conn) conn.status = "disconnected";
				console.log(`WebSocket [${connectionId}] disconnected`);
				this.emit("disconnected", connectionId);
			};
		});
	}

	send(
		connectionId: string,
		type: WebSocketMessage["type"],
		payload: any,
		senderId: string,
		recipientId?: string,
	) {
		const conn = this.connections.get(connectionId);
		if (!conn || conn.socket.readyState !== WebSocket.OPEN) {
			throw new Error(`WebSocket [${connectionId}] not connected`);
		}

		const message: WebSocketMessage = {
			type,
			payload,
			senderId,
			recipientId,
			timestamp: new Date(),
		};

		conn.socket.send(JSON.stringify(message));
	}

	disconnect(connectionId?: string) {
		if (connectionId) {
			const conn = this.connections.get(connectionId);
			if (conn) {
				conn.socket.close();
				this.connections.delete(connectionId);
			}
		} else {
			this.connections.forEach((conn) => {
				conn.socket.close();
			});
			this.connections.clear();
		}
	}

	getConnection(connectionId: string): WebSocketConnection | undefined {
		return this.connections.get(connectionId);
	}

	getAllConnections(): WebSocketConnection[] {
		return Array.from(this.connections.values());
	}

	onceMessage(
		connectionId: string,
		event: string,
		callback: (message: WebSocketMessage) => void,
	) {
		this.once(`${connectionId}:${event}`, callback as Listener);
	}
}

export const websocketService = new WebSocketService();
