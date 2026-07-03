import { t as StepGuide } from "./StepGuide-CNGcpcGz.js";
import { n as useCanvas } from "./CanvasProvider-aqhBXwm5.js";
import { n as useWizard, o as usePedagogyMode } from "./wizard-provider-pbkfxoqq.js";
import { t as LiveRegion } from "./LiveRegion-bH5_dx26.js";
import { n as useAnimationSpeed } from "./AnimationSpeedProvider-DFGQ3vgf.js";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Play, RotateCcw, Wifi } from "lucide-react";
import { motion } from "motion/react";
import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";
//#region src/services/websocket.service.ts
var EventEmitter = class {
	_events = /* @__PURE__ */ new Map();
	_listenerMap = /* @__PURE__ */ new WeakMap();
	_getListeners(eventName) {
		return this._events.get(eventName) ?? [];
	}
	listeners(eventName) {
		return [...this._getListeners(eventName)];
	}
	listenerCount(eventName) {
		return this._getListeners(eventName).length;
	}
	emit(eventName, ...args) {
		const listeners = this._getListeners(eventName).slice();
		if (listeners.length === 0) return false;
		for (const listener of listeners) try {
			listener.call(this, args[0]);
		} catch (err) {
			console.error(`[EventEmitter] listener for "${String(eventName)}" threw:`, err);
		}
		return true;
	}
	on(eventName, listener) {
		const listeners = this._getListeners(eventName);
		listeners.push(listener);
		this._events.set(eventName, listeners);
		return this;
	}
	once(eventName, listener) {
		const wrapped = (payload) => {
			this.off(eventName, wrapped);
			listener(payload);
		};
		this._listenerMap.set(wrapped, listener);
		return this.on(eventName, wrapped);
	}
	off(eventName, listener) {
		return this.removeListener(eventName, listener);
	}
	removeListener(eventName, listener) {
		const listeners = this._getListeners(eventName);
		const idx = listeners.indexOf(listener);
		if (idx !== -1) {
			listeners.splice(idx, 1);
			if (listeners.length === 0) this._events.delete(eventName);
			else this._events.set(eventName, listeners);
		}
		return this;
	}
	removeAllListeners(event) {
		if (event === void 0) this._events.clear();
		else this._events.delete(event);
		return this;
	}
	prependListener(eventName, listener) {
		const listeners = this._getListeners(eventName);
		listeners.unshift(listener);
		this._events.set(eventName, listeners);
		return this;
	}
	prependOnceListener(eventName, listener) {
		const wrapped = (payload) => {
			this.off(eventName, wrapped);
			listener(payload);
		};
		this._listenerMap.set(wrapped, listener);
		return this.prependListener(eventName, wrapped);
	}
	addListener = this.on;
};
var WebSocketService = class extends EventEmitter {
	connections = /* @__PURE__ */ new Map();
	baseUrl = "ws://localhost:4001";
	async connect(connectionId, apiKey = "dev-secret-key") {
		if (this.connections.has(connectionId)) this.disconnect(connectionId);
		return new Promise((resolve, reject) => {
			const url = `${this.baseUrl}?api_key=${apiKey}`;
			const socket = new WebSocket(url);
			this.connections.set(connectionId, {
				id: connectionId,
				socket,
				status: "connecting"
			});
			socket.onopen = () => {
				const conn = this.connections.get(connectionId);
				if (conn) conn.status = "connected";
				console.log(`WebSocket [${connectionId}] connected to gateway`);
				resolve();
			};
			socket.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					this.emit(message.type, message);
					this.emit(`${connectionId}:${message.type}`, message);
				} catch (error) {
					console.error(`Error parsing WebSocket [${connectionId}] message:`, error);
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
	send(connectionId, type, payload, senderId, recipientId) {
		const conn = this.connections.get(connectionId);
		if (!conn || conn.socket.readyState !== WebSocket.OPEN) throw new Error(`WebSocket [${connectionId}] not connected`);
		const message = {
			type,
			payload,
			senderId,
			recipientId,
			timestamp: /* @__PURE__ */ new Date()
		};
		conn.socket.send(JSON.stringify(message));
	}
	disconnect(connectionId) {
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
	getConnection(connectionId) {
		return this.connections.get(connectionId);
	}
	getAllConnections() {
		return Array.from(this.connections.values());
	}
	onceMessage(connectionId, event, callback) {
		this.once(`${connectionId}:${event}`, callback);
	}
};
var websocketService = new WebSocketService();
//#endregion
//#region src/shared/components/pedagogy/HandshakeTicker.tsx
var TICKER_EVENTS = {
	"Negotiating Cipher Suites...": "ClientHello → ServerHello: negotiating TLS version, cipher suites, and compression methods",
	"Verifying Server Certificate...": "ServerCertificate → CertificateVerify: server presents its X.509 certificate chain for validation",
	"Establishing Secure Channel...": "KeyExchange → ChangeCipherSpec: RSA key transport sends encrypted AES key; real TLS 1.3 uses ECDHE for forward secrecy",
	"Sending wrapped session key...": "ClientKeyExchange: the RSA-wrapped AES session key is transmitted under the server's public key",
	"Sending encrypted payload...": "ApplicationData: all subsequent traffic is encrypted with AES-256-GCM using the negotiated session key",
	"Inspecting packet structure...": "Record Layer: each TLS record is framed with content type, version, length, and payload"
};
function HandshakeTicker({ currentPacket }) {
	const { isPedagogyMode } = usePedagogyMode();
	if (!isPedagogyMode || !currentPacket) return null;
	const detail = TICKER_EVENTS[currentPacket];
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			opacity: 0,
			y: 4
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .2 },
		className: "mb-4 overflow-hidden rounded-lg border border-surface-700 bg-surface-900",
		children: [/* @__PURE__ */ jsx("div", {
			className: "border-b border-surface-800 bg-surface-950/50 px-3 py-1.5",
			children: /* @__PURE__ */ jsx("span", {
				className: "text-[10px] font-mono uppercase tracking-wider text-surface-500",
				children: "TLS Handshake Trace"
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-1 p-3",
			children: detail ? /* @__PURE__ */ jsxs("p", {
				className: "text-[11px] text-surface-400 leading-relaxed",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-symmetric-400",
						children: currentPacket
					}),
					/* @__PURE__ */ jsx("br", {}),
					detail
				]
			}) : /* @__PURE__ */ jsx("p", {
				className: "text-xs text-surface-400",
				children: currentPacket
			})
		})]
	}, currentPacket);
}
//#endregion
//#region src/shared/components/pedagogy/PacketTooltip.tsx
var PACKET_PARTS = [
	{
		label: "HEADER",
		color: "bg-blue-500",
		description: "Contains routing metadata: source/destination addresses, protocol version, sequence number, and checksum. 32 bytes total.",
		size: "32 B"
	},
	{
		label: "RSA_WRAPPED_KEY",
		color: "bg-amber-500",
		description: "The AES session key, encrypted with the recipient's RSA public key. Only the private key holder can unwrap this. 256 bytes for RSA-2048.",
		size: "256 B"
	},
	{
		label: "AES_ENCRYPTED_PAYLOAD",
		color: "bg-emerald-500",
		description: "The actual message data encrypted with AES-256-GCM. Includes the ciphertext plus a 12-byte IV and 16-byte authentication tag.",
		size: "Variable"
	}
];
function PacketTooltip() {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	return /* @__PURE__ */ jsx("div", {
		className: "space-y-2",
		children: PACKET_PARTS.map((part, i) => /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "relative w-full text-left",
			onMouseEnter: () => setHoveredIndex(i),
			onMouseLeave: () => setHoveredIndex(null),
			onFocus: () => setHoveredIndex(i),
			onBlur: () => setHoveredIndex(null),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex cursor-help items-center gap-3 rounded-lg border border-surface-700 bg-surface-800/50 p-3 transition-colors hover:border-surface-600",
				children: [/* @__PURE__ */ jsx("div", { className: `h-2.5 w-2.5 rounded-full ${part.color}` }), /* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ jsx("span", {
						className: `text-xs font-mono font-semibold ${part.color.replace("bg-", "text-")}`,
						children: part.label
					}), /* @__PURE__ */ jsx("span", {
						className: "ml-2 text-[10px] text-surface-600",
						children: part.size
					})]
				})]
			}), hoveredIndex === i && /* @__PURE__ */ jsx(motion.div, {
				initial: {
					opacity: 0,
					y: 2
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .12 },
				className: "absolute left-0 z-20 mt-1 w-72 rounded-lg border border-surface-600 bg-surface-800 p-3 shadow-xl",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-xs text-surface-300 leading-relaxed",
					children: part.description
				})
			})]
		}, part.label))
	});
}
//#endregion
//#region src/visualization/scenes/wire-scene.ts
var WireScene = class {
	app;
	container;
	root;
	wireGraphics;
	packets;
	config;
	isInitialized = false;
	animationFrameId = null;
	speedMultiplier = 1;
	masterTimeline = null;
	flashOverlay;
	constructor(app, container) {
		this.app = app;
		this.container = container;
		this.root = new Container();
		this.wireGraphics = new Graphics();
		this.packets = [];
		this.flashOverlay = new Graphics();
		this.config = {
			wireLength: 600,
			wireColor: 4871528,
			packetColor: 3900150,
			textColor: 16777215,
			fontSize: 12,
			packetSpeed: 3
		};
	}
	async init() {
		if (!this.app.renderer) {
			console.warn("WireScene: PixiJS not initialized yet");
			return;
		}
		this.createWire();
		this.createConnectionPoints();
		this.createFlashOverlay();
		this.container.addChild(this.root);
		this.isInitialized = true;
	}
	get screenWidth() {
		return this.app.screen.width;
	}
	get screenHeight() {
		return this.app.screen.height;
	}
	createWire() {
		const wireY = this.screenHeight / 2;
		const wireStartX = (this.screenWidth - this.config.wireLength) / 2;
		this.wireGraphics.clear();
		this.wireGraphics.moveTo(wireStartX, wireY);
		this.wireGraphics.lineTo(wireStartX + this.config.wireLength, wireY);
		this.wireGraphics.stroke({
			width: 4,
			color: this.config.wireColor,
			alpha: 1
		});
		for (let i = 0; i < this.config.wireLength; i += 20) {
			this.wireGraphics.circle(wireStartX + i, wireY, 3);
			this.wireGraphics.stroke({
				width: 2,
				color: this.config.wireColor,
				alpha: .3
			});
		}
		this.root.addChild(this.wireGraphics);
	}
	createConnectionPoints() {
		const wireY = this.screenHeight / 2;
		const wireStartX = (this.screenWidth - this.config.wireLength) / 2;
		const wireEndX = wireStartX + this.config.wireLength;
		const senderNode = new Graphics();
		senderNode.circle(0, 0, 20);
		senderNode.fill({ color: 1096065 });
		senderNode.x = wireStartX;
		senderNode.y = wireY;
		const senderLabel = new Text({
			text: "Sender",
			style: {
				fontSize: this.config.fontSize,
				fill: this.config.textColor
			}
		});
		senderLabel.x = wireStartX - 25;
		senderLabel.y = wireY + 30;
		const receiverNode = new Graphics();
		receiverNode.circle(0, 0, 20);
		receiverNode.fill({ color: 15680580 });
		receiverNode.x = wireEndX;
		receiverNode.y = wireY;
		const receiverLabel = new Text({
			text: "Receiver",
			style: {
				fontSize: this.config.fontSize,
				fill: this.config.textColor
			}
		});
		receiverLabel.x = wireEndX - 30;
		receiverLabel.y = wireY + 30;
		this.root.addChild(senderNode, senderLabel, receiverNode, receiverLabel);
	}
	createFlashOverlay() {
		const wireY = this.screenHeight / 2;
		const wireEndX = (this.screenWidth - this.config.wireLength) / 2 + this.config.wireLength;
		this.flashOverlay.circle(0, 0, 25);
		this.flashOverlay.fill({
			color: 16777215,
			alpha: .8
		});
		this.flashOverlay.x = wireEndX;
		this.flashOverlay.y = wireY;
		this.flashOverlay.alpha = 0;
		this.root.addChild(this.flashOverlay);
	}
	async sendPacket(data, packetType = "encrypted") {
		if (!this.isInitialized) throw new Error("WireScene not initialized");
		const packetColor = packetType === "encrypted" ? 3900150 : packetType === "key" ? 16096779 : 9133302;
		const packet = this.createPacket(packetColor, data);
		this.packets.push(packet);
		const wireStartX = (this.screenWidth - this.config.wireLength) / 2;
		const wireEndX = wireStartX + this.config.wireLength;
		const wireY = this.screenHeight / 2;
		packet.graphics.x = wireStartX;
		packet.graphics.y = wireY;
		packet.label.alpha = 0;
		const mt = this.masterTimeline;
		await new Promise((resolve) => {
			const tweenVars = {
				x: wireEndX,
				duration: 2,
				ease: "power2.inOut",
				onComplete: () => {
					this.flashReceiver();
					this.container.removeChild(packet.graphics);
					this.container.removeChild(packet.label);
					this.packets = this.packets.filter((p) => p !== packet);
					resolve();
				}
			};
			if (mt) mt.to(packet.graphics, tweenVars);
			else gsap.to(packet.graphics, tweenVars);
		});
	}
	createPacket(color, data) {
		const graphics = new Graphics();
		graphics.roundRect(-20, -10, 40, 20, 5);
		graphics.fill({ color });
		graphics.stroke({
			width: 2,
			color,
			alpha: .5
		});
		const label = new Text({
			text: data.length > 8 ? `${data.substring(0, 8)}...` : data,
			style: {
				fontSize: 8,
				fill: 16777215,
				fontWeight: "bold"
			}
		});
		label.anchor.set(.5);
		this.root.addChild(graphics, label);
		const mt = this.masterTimeline;
		if (mt) mt.to(label, {
			alpha: 1,
			duration: .3,
			ease: "power2.out"
		});
		else gsap.to(label, {
			alpha: 1,
			duration: .3,
			ease: "power2.out"
		});
		return {
			graphics,
			label,
			position: 0,
			speed: this.config.packetSpeed,
			data
		};
	}
	flashReceiver() {
		const mt = this.masterTimeline;
		this.flashOverlay.alpha = .8;
		this.flashOverlay.scale.set(1);
		if (mt) mt.to(this.flashOverlay, {
			alpha: 0,
			scale: 1.5,
			duration: .4,
			ease: "power3.out"
		});
		else gsap.to(this.flashOverlay, {
			alpha: 0,
			scale: 1.5,
			duration: .4,
			ease: "power3.out"
		});
	}
	async animateDataTransfer(packets) {
		for (const packet of packets) {
			await this.sendPacket(packet.data, packet.type);
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
	}
	async showEncryptionFlow() {
		await this.animateDataTransfer([
			{
				data: "AES_KEY",
				type: "key"
			},
			{
				data: "RSA_ENC",
				type: "encrypted"
			},
			{
				data: "PAYLOAD",
				type: "encrypted"
			}
		]);
	}
	async showPacketInspection(packetData) {
		if (!this.isInitialized) throw new Error("WireScene not initialized");
		const wireY = this.screenHeight / 2;
		const panel = new Graphics();
		panel.roundRect(0, 0, 200, 100, 8);
		panel.fill({
			color: 1976635,
			alpha: .95
		});
		panel.x = this.screenWidth / 2 - 100;
		panel.y = wireY - 80;
		const titleLabel = new Text({
			text: "Packet Structure",
			style: {
				fontSize: 14,
				fill: 16777215,
				fontWeight: "bold"
			}
		});
		titleLabel.x = panel.x + 100;
		titleLabel.y = panel.y + 15;
		titleLabel.anchor.set(.5, 0);
		const contentLabel = new Text({
			text: packetData,
			style: {
				fontSize: 11,
				fill: 9741240,
				fontFamily: "monospace"
			}
		});
		contentLabel.x = panel.x + 100;
		contentLabel.y = panel.y + 45;
		contentLabel.anchor.set(.5, 0);
		this.root.addChild(panel, titleLabel, contentLabel);
		const mt = this.masterTimeline;
		if (mt) mt.to(panel, {
			alpha: 0,
			duration: .3,
			delay: 2.7,
			onComplete: () => {
				this.root.removeChild(panel);
				this.root.removeChild(titleLabel);
				this.root.removeChild(contentLabel);
			}
		});
		else gsap.to(panel, {
			alpha: 0,
			duration: .3,
			delay: 2.7,
			onComplete: () => {
				this.root.removeChild(panel);
				this.root.removeChild(titleLabel);
				this.root.removeChild(contentLabel);
			}
		});
	}
	destroy() {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		gsap.killTweensOf(this.root);
		gsap.killTweensOf(this.flashOverlay);
		this.packets = [];
		this.root.removeChildren();
		if (this.root.parent) this.root.parent.removeChild(this.root);
		this.isInitialized = false;
	}
};
//#endregion
//#region src/routes/handshake.step-5.tsx?tsr-split=component
function Step5WireSimulation() {
	const { engine } = useCanvas();
	const { rsaKeyPair, wrappedSessionKey, ciphertext } = useWizard();
	const { speed } = useAnimationSpeed();
	const wireSceneRef = useRef(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentPacket, setCurrentPacket] = useState("");
	const [connectionStatus, setConnectionStatus] = useState("disconnected");
	const { isPedagogyMode } = usePedagogyMode();
	useEffect(() => {
		if (!engine) return;
		const setupScene = async () => {
			const wireScene = new WireScene(engine.getApplication(), engine.getApplication().stage);
			wireScene.masterTimeline = engine.masterTimeline;
			await wireScene.init();
			wireSceneRef.current = wireScene;
		};
		setupScene();
		return () => {
			wireSceneRef.current?.destroy();
			wireSceneRef.current = null;
		};
	}, [engine]);
	useEffect(() => {
		if (wireSceneRef.current) wireSceneRef.current.speedMultiplier = speed;
	}, [speed]);
	const runWireSimulation = async () => {
		if (!wireSceneRef.current || !engine || isAnimating) return;
		if (!rsaKeyPair || !wrappedSessionKey || !ciphertext) {
			setCurrentPacket("Missing crypto data. Complete previous steps first.");
			return;
		}
		setIsAnimating(true);
		setConnectionStatus("connecting");
		const INITIATOR_ID = "client-peer";
		const RESPONDER_ID = "remote-peer";
		try {
			await Promise.all([websocketService.connect(INITIATOR_ID), websocketService.connect(RESPONDER_ID)]);
			setCurrentPacket("Negotiating Cipher Suites...");
			await new Promise((resolve) => {
				websocketService.onceMessage(INITIATOR_ID, "handshake_response", () => resolve());
				websocketService.send(INITIATOR_ID, "handshake_init", { userId: INITIATOR_ID }, INITIATOR_ID, RESPONDER_ID);
			});
			await new Promise((resolve) => {
				websocketService.onceMessage(RESPONDER_ID, "handshake_init", (msg) => {
					websocketService.send(RESPONDER_ID, "handshake_response", { status: "accepted" }, RESPONDER_ID, msg.senderId);
					resolve();
				});
			});
			setConnectionStatus("connected");
			setCurrentPacket("Verifying Server Certificate...");
			await new Promise((resolve) => setTimeout(resolve, 1e3 / speed));
			setCurrentPacket("Establishing Secure Channel...");
			await new Promise((resolve) => setTimeout(resolve, 1e3 / speed));
			setCurrentPacket("Sending wrapped session key...");
			const wrappedKeyB64 = btoa(String.fromCharCode(...wrappedSessionKey.data));
			websocketService.send(INITIATOR_ID, "key_exchange", { encryptedKey: wrappedKeyB64 }, INITIATOR_ID, RESPONDER_ID);
			await wireSceneRef.current.sendPacket("AES_KEY", "key");
			setCurrentPacket("Sending encrypted payload...");
			const ciphertextB64 = btoa(String.fromCharCode(...ciphertext.data));
			const ivB64 = btoa(String.fromCharCode(...ciphertext.iv));
			websocketService.send(INITIATOR_ID, "metadata", {
				ciphertext: ciphertextB64,
				iv: ivB64
			}, INITIATOR_ID, RESPONDER_ID);
			await wireSceneRef.current.sendPacket("PAYLOAD", "encrypted");
			setCurrentPacket("Inspecting packet structure...");
			const packetInfo = `[HEADER: 32B] [RSA_WRAPPED_KEY: ${wrappedSessionKey.data.length}B] [AES_ENCRYPTED_PAYLOAD: ${ciphertext.data.length}B]`;
			await wireSceneRef.current.showPacketInspection(packetInfo);
			setCurrentPacket("Transmission complete");
		} catch (error) {
			console.error("Wire simulation error:", error);
			setCurrentPacket("Transmission failed");
			setConnectionStatus("disconnected");
		} finally {
			setIsAnimating(false);
			websocketService.disconnect();
		}
	};
	const handleReset = () => {
		if (!wireSceneRef.current) return;
		wireSceneRef.current.destroy();
		wireSceneRef.current.init();
		setCurrentPacket("");
		setConnectionStatus("disconnected");
		setIsAnimating(false);
	};
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: {
			delay: .1,
			ease: [
				.25,
				.1,
				.25,
				1
			]
		},
		children: [
			/* @__PURE__ */ jsx(LiveRegion, { message: currentPacket }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-surface-500/10",
					children: /* @__PURE__ */ jsx(Wifi, {
						size: 20,
						className: "text-surface-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-bold text-surface-300",
						children: "Wire Simulation"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-1",
						children: /* @__PURE__ */ jsx(StepGuide, { sections: [{
							title: "The Handshake Narrative",
							body: "A TLS handshake isn't a single step, but a conversation: 1. Hello (negotiating capabilities) $\rightarrow$ 2. Agreement (checking certificates) $\rightarrow$ 3. Key Exchange (sending the wrapped session key). Only after this conversation is complete does the actual data flow."
						}, {
							title: "Perfect Forward Secrecy",
							body: "In this simulation, RSA directly encrypts the AES key (RSA key transport). Real TLS 1.3 uses ephemeral Diffie-Hellman (ECDHE) for forward secrecy, ensuring past sessions stay secure even if the private key is later compromised."
						}] })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500",
						children: "Step 5 of 6"
					})
				] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "The encrypted payload is transmitted across a simulated network wire. By sending the hybrid envelope, we ensure that even if a malicious actor intercepts the packets, they only see an unbreakable RSA lock and a scrambled AES stream."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-4 flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("div", { className: `h-3 w-3 rounded-full ${connectionStatus === "connected" ? "bg-emerald-500" : connectionStatus === "connecting" ? "bg-amber-500 animate-pulse" : "bg-surface-600"}` }), /* @__PURE__ */ jsx("span", {
					className: "text-sm text-surface-400 capitalize",
					children: connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Establishing connection..." : "Disconnected"
				})]
			}),
			/* @__PURE__ */ jsx(HandshakeTicker, { currentPacket }),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mb-6 rounded-lg border border-surface-700/50 bg-surface-950/40 overflow-hidden h-64",
				children: [!currentPacket && !isAnimating && /* @__PURE__ */ jsxs("div", {
					className: "absolute inset-0 flex items-center justify-center flex-col gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "h-12 w-12 rounded-full border-2 border-dashed border-surface-700 flex items-center justify-center",
						children: /* @__PURE__ */ jsx(Wifi, {
							size: 20,
							className: "text-surface-600"
						})
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500 font-medium",
						children: "Press \"Start Transmission\" to simulate the handshake"
					})]
				}), currentPacket && /* @__PURE__ */ jsx("div", {
					className: "absolute bottom-4 left-4 right-4 z-10 rounded bg-surface-950/80 backdrop-blur-sm px-4 py-2 border border-surface-700/30",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("div", { className: `h-1.5 w-1.5 rounded-full ${currentPacket.includes("complete") ? "bg-success" : "bg-surface-400"} animate-pulse` }), /* @__PURE__ */ jsx("span", {
							className: "text-sm text-surface-300 font-mono",
							children: currentPacket
						})]
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-4",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: runWireSimulation,
					disabled: isAnimating || !rsaKeyPair || !wrappedSessionKey || !ciphertext,
					className: "flex items-center gap-2 rounded-lg bg-surface-600 px-4 py-2 text-sm font-medium text-white hover:bg-surface-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
					children: [/* @__PURE__ */ jsx(Play, { size: 16 }), isAnimating ? "Transmitting..." : "Start Transmission"]
				}), isAnimating && /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: handleReset,
					className: "flex items-center gap-2 rounded-lg bg-surface-700 px-4 py-2 text-sm font-medium text-white hover:bg-surface-600 transition-colors",
					children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), "Reset"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-3 font-semibold text-white",
					children: "Hybrid Packet Structure"
				}), isPedagogyMode ? /* @__PURE__ */ jsx(PacketTooltip, {}) : /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-blue-500" }), /* @__PURE__ */ jsxs("span", {
								className: "text-sm text-surface-400",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-mono text-blue-400",
									children: "HEADER"
								}), " - Packet metadata (32 bytes)"]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-amber-500" }), /* @__PURE__ */ jsxs("span", {
								className: "text-sm text-surface-400",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-mono text-amber-400",
										children: "RSA_WRAPPED_KEY"
									}),
									" ",
									"- AES key encrypted with RSA (",
									wrappedSessionKey?.data.length ?? 256,
									" bytes)"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-emerald-500" }), /* @__PURE__ */ jsxs("span", {
								className: "text-sm text-surface-400",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-mono text-emerald-400",
										children: "AES_ENCRYPTED_PAYLOAD"
									}),
									" ",
									"- Message encrypted with AES (",
									ciphertext?.data.length ?? "variable",
									" bytes)"
								]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-sm text-surface-500",
				children: "No plaintext data ever touches the wire — the zero-knowledge architecture ensures confidentiality."
			})
		]
	});
}
//#endregion
export { Step5WireSimulation as component };
