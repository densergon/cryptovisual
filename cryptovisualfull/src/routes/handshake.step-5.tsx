import { createFileRoute } from "@tanstack/react-router";
import { Play, RotateCcw, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useWizard } from "@/state/wizard-provider";
import type { WebSocketMessage } from "../services/websocket.service";
import { websocketService } from "../services/websocket.service";
import { LiveRegion } from "../shared/components/LiveRegion";
import { StepGuide } from "../shared/components/StepGuide";
import { HandshakeTicker } from "../shared/components/pedagogy/HandshakeTicker";
import { PacketTooltip } from "../shared/components/pedagogy/PacketTooltip";
import { usePedagogyMode } from "../shared/providers/PedagogyModeProvider";
import { useAnimationSpeed } from "../shared/providers/AnimationSpeedProvider";
import { useCanvas } from "../shared/providers/CanvasProvider";
import { WireScene } from "../visualization/scenes/wire-scene";

export const Route = createFileRoute("/handshake/step-5")({
	component: Step5WireSimulation,
});

function Step5WireSimulation() {
	const { engine } = useCanvas();
	const { rsaKeyPair, wrappedSessionKey, ciphertext } = useWizard();
	const { speed } = useAnimationSpeed();
	const wireSceneRef = useRef<WireScene | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentPacket, setCurrentPacket] = useState<string>("");
	const [connectionStatus, setConnectionStatus] = useState<
		"disconnected" | "connecting" | "connected"
	>("disconnected");
	const { isPedagogyMode } = usePedagogyMode();

	useEffect(() => {
		if (!engine) return;

		const setupScene = async () => {
			const wireScene = new WireScene(
				engine.getApplication(),
				engine.getApplication().stage,
			);
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
		if (wireSceneRef.current) {
			wireSceneRef.current.speedMultiplier = speed;
		}
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
			await Promise.all([
				websocketService.connect(INITIATOR_ID),
				websocketService.connect(RESPONDER_ID),
			]);

			setCurrentPacket("Negotiating Cipher Suites...");
			await new Promise<void>((resolve) => {
				websocketService.onceMessage(INITIATOR_ID, "handshake_response", () =>
					resolve(),
				);
				websocketService.send(
					INITIATOR_ID,
					"handshake_init",
					{ userId: INITIATOR_ID },
					INITIATOR_ID,
					RESPONDER_ID,
				);
			});

			await new Promise<void>((resolve) => {
				websocketService.onceMessage(
					RESPONDER_ID,
					"handshake_init",
					(msg: WebSocketMessage) => {
						websocketService.send(
							RESPONDER_ID,
							"handshake_response",
							{ status: "accepted" },
							RESPONDER_ID,
							msg.senderId,
						);
						resolve();
					},
				);
			});

			setConnectionStatus("connected");
			setCurrentPacket("Verifying Server Certificate...");
			await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

			setCurrentPacket("Establishing Secure Channel...");
			await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

			setCurrentPacket("Sending wrapped session key...");
			const wrappedKeyB64 = btoa(
				String.fromCharCode(...wrappedSessionKey.data),
			);
			websocketService.send(
				INITIATOR_ID,
				"key_exchange",
				{ encryptedKey: wrappedKeyB64 },
				INITIATOR_ID,
				RESPONDER_ID,
			);
			await wireSceneRef.current.sendPacket("AES_KEY", "key");

			setCurrentPacket("Sending encrypted payload...");
			const ciphertextB64 = btoa(String.fromCharCode(...ciphertext.data));
			const ivB64 = btoa(String.fromCharCode(...ciphertext.iv));
			websocketService.send(
				INITIATOR_ID,
				"metadata",
				{ ciphertext: ciphertextB64, iv: ivB64 },
				INITIATOR_ID,
				RESPONDER_ID,
			);
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

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
		>
			<LiveRegion message={currentPacket} />
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-500/10">
					<Wifi size={20} className="text-surface-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-surface-300">
						Wire Simulation
					</h2>
					<div className="mt-1">
						<StepGuide
							sections={[
								{
									title: "The Handshake Narrative",
									body: "A TLS handshake isn't a single step, but a conversation: 1. Hello (negotiating capabilities) $\rightarrow$ 2. Agreement (checking certificates) $\rightarrow$ 3. Key Exchange (sending the wrapped session key). Only after this conversation is complete does the actual data flow.",
								},
								{
									title: "Perfect Forward Secrecy",
									body: "In modern TLS, ephemeral key exchange ensures that even if the server's private key is compromised later, past sessions remain secure. This simulation demonstrates the core RSA key transport mechanism.",
								},
							]}
						/>
					</div>
					<p className="text-sm text-surface-500">Step 5 of 6</p>
				</div>
			</div>

			<p className="mb-6 text-surface-400 leading-relaxed">
				The encrypted payload is transmitted across a simulated network wire.
				By sending the hybrid envelope, we ensure that even if a malicious
				actor intercepts the packets, they only see an unbreakable RSA lock
				and a scrambled AES stream.
			</p>

			<div className="mb-4 flex items-center gap-2">
				<div
					className={`h-3 w-3 rounded-full ${
						connectionStatus === "connected"
							? "bg-emerald-500"
							: connectionStatus === "connecting"
								? "bg-amber-500 animate-pulse"
								: "bg-surface-600"
					}`}
				/>
				<span className="text-sm text-surface-400 capitalize">
					{connectionStatus === "connected"
						? "Connected"
						: connectionStatus === "connecting"
							? "Establishing connection..."
							: "Disconnected"}
				</span>
			</div>

			<HandshakeTicker currentPacket={currentPacket} />

			<div className="relative mb-6 rounded-lg border border-surface-700/50 bg-transparent overflow-hidden h-64">
				{currentPacket && (
					<div className="absolute bottom-4 left-4 right-4 z-10 rounded bg-surface-950/80 backdrop-blur-sm px-4 py-2">
						<span className="text-sm text-surface-300 font-mono">
							{currentPacket}
						</span>
					</div>
				)}
			</div>

			<div className="mb-6 flex items-center gap-4">
				<button
					onClick={runWireSimulation}
					disabled={
						isAnimating || !rsaKeyPair || !wrappedSessionKey || !ciphertext
					}
					className="flex items-center gap-2 rounded-lg bg-surface-600 px-4 py-2 text-sm font-medium text-white hover:bg-surface-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<Play size={16} />
					{isAnimating ? "Transmitting..." : "Start Transmission"}
				</button>

				{isAnimating && (
					<button
						onClick={handleReset}
						className="flex items-center gap-2 rounded-lg bg-surface-700 px-4 py-2 text-sm font-medium text-white hover:bg-surface-600 transition-colors"
					>
						<RotateCcw size={16} />
						Reset
					</button>
				)}
			</div>

			<div className="rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6">
				<h3 className="mb-3 font-semibold text-white">
					Hybrid Packet Structure
				</h3>
				{isPedagogyMode ? (
					<PacketTooltip />
				) : (
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<span className="text-sm text-surface-400">
								<span className="font-mono text-blue-400">HEADER</span> - Packet
								metadata (32 bytes)
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-amber-500" />
							<span className="text-sm text-surface-400">
								<span className="font-mono text-amber-400">
									RSA_WRAPPED_KEY
								</span>{" "}
								- AES key encrypted with RSA (
								{wrappedSessionKey?.data.length ?? 256} bytes)
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-emerald-500" />
							<span className="text-sm text-surface-400">
								<span className="font-mono text-emerald-400">
									AES_ENCRYPTED_PAYLOAD
								</span>{" "}
								- Message encrypted with AES (
								{ciphertext?.data.length ?? "variable"} bytes)
							</span>
						</div>
					</div>
				)}
			</div>

			<p className="mt-6 text-sm text-surface-500">
				No plaintext data ever touches the wire — the zero-knowledge
				architecture ensures confidentiality.
			</p>
		</motion.div>
	);
}
