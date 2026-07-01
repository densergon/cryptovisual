import { createFileRoute } from "@tanstack/react-router";
import { Grid3x3, Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AESEngine, AESVisualEngine } from "../crypto-engine";
import { useWizard } from "../state/wizard-provider";
import { LiveRegion } from "../shared/components/LiveRegion";
import { StepGuide } from "../shared/components/StepGuide";
import { useAnimationSpeed } from "../shared/providers/AnimationSpeedProvider";
import { useCanvas } from "../shared/providers/CanvasProvider";
import { useCryptoWorker } from "../shared/providers/CryptoWorkerProvider";
import { StateMatrixVisualizer } from "../visualization/scenes/state-matrix-scene";

function AESCipherContent() {
	const { engine } = useCanvas();
	const worker = useCryptoWorker();
	const { speed } = useAnimationSpeed();
	const { send } = useWizard();
	const visualizerRef = useRef<StateMatrixVisualizer | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentOperation, setCurrentOperation] = useState<string>("");

	const runAESAnimation = async () => {
		if (!visualizerRef.current || !engine || isAnimating) return;

		setIsAnimating(true);
		const visualizer = visualizerRef.current;
		visualizer.speedMultiplier = speed;

		try {
			if (!worker) throw new Error("Crypto worker not ready");
			const { keyBytes } = await worker.generateAESKey(256);
			if (!keyBytes) throw new Error("Key generation failed");
			const plaintext = "Hello CryptoWorld!";
			const aesResult = await worker.encryptAES(keyBytes, plaintext);
			const ciphertextBytes = new Uint8Array(
				AESEngine.hexToArrayBuffer(aesResult.ciphertext),
			);
			const ivBytes = new Uint8Array(
				AESEngine.hexToArrayBuffer(aesResult.iv),
			);
			const authTagBytes = aesResult.authTag
				? new Uint8Array(AESEngine.hexToArrayBuffer(aesResult.authTag))
				: undefined;
			send({
				type: "SET_CIPHERTEXT",
				ciphertext: {
					data: ciphertextBytes,
					iv: ivBytes,
					authTag: authTagBytes,
					durationMs: aesResult.durationMs,
				},
			});

			const plainBytes = new TextEncoder().encode(plaintext).slice(0, 16);
			const keyUint8 = new Uint8Array(
				Uint8Array.from(atob(keyBytes), (c) => c.charCodeAt(0)),
			).slice(0, 16);

			const sBox = new Uint8Array([
				0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
				0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
				0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
				0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
				0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
				0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
				0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
				0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
				0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
				0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
				0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
				0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
				0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
				0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
				0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
				0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
				0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
				0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
				0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
				0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
				0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
				0xb0, 0x54, 0xbb, 0x16,
			]);

			visualizer.updateMatrix(plainBytes);

			setCurrentOperation("SubBytes: Swapping values to break linear patterns");
			let state = await visualizer.animateSubBytes(sBox, plainBytes);

			setCurrentOperation("ShiftRows: Diffusing bytes across the matrix");
			state = await visualizer.animateShiftRows(state);

			setCurrentOperation("MixColumns: Blending columns for total diffusion");
			state = await visualizer.animateMixColumns(state);

			setCurrentOperation("AddRoundKey: Binding the state to the secret key");
			state = await visualizer.animateAddRoundKey(state, keyUint8);

			setCurrentOperation("Avalanche Effect: See how 1 bit flip changes everything");
			const flippedPlain = new Uint8Array(plainBytes);
			flippedPlain[0] ^= 0x01;

			const toHex = (bytes: Uint8Array, len = 16) =>
				Array.from(bytes.slice(0, len))
					.map((b) => b.toString(16).padStart(2, "0"))
					.join("");

			let finalState: Uint8Array = state;
			let flippedFinal: Uint8Array = flippedPlain;
			try {
				const orig = await worker.runAESRoundOutputs(
					toHex(keyUint8),
					toHex(plainBytes),
				);
				const flipped = await worker.runAESRoundOutputs(
					toHex(keyUint8),
					toHex(flippedPlain),
				);
				finalState = new Uint8Array(
					orig.addRoundKeyState.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)),
				);
				flippedFinal = new Uint8Array(
					flipped.addRoundKeyState.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)),
				);
			} catch (e) {
				console.warn("AESRoundOutputs not available:", e);
			}

			await visualizer.animateAvalancheEffect(finalState, flippedFinal);

			setCurrentOperation("Animation complete");
		} catch (error) {
			console.error("AES animation error:", error);
			setCurrentOperation("Animation error");
		} finally {
			setIsAnimating(false);
		}
	};

	const runKeyExpansionAnimation = async () => {
		if (!visualizerRef.current || !engine || isAnimating) return;

		setIsAnimating(true);
		const visualizer = visualizerRef.current;
		visualizer.speedMultiplier = speed;

		try {
			if (!worker) throw new Error("Crypto worker not ready");
			const { keyBytes } = await worker.generateAESKey(256);
			if (!keyBytes) throw new Error("Key generation failed");

			const keyUint8 = new Uint8Array(
				Uint8Array.from(atob(keyBytes), (c) => c.charCodeAt(0)),
			).slice(0, 32);

			const roundKeys = AESVisualEngine.expandKey(keyUint8);

			setCurrentOperation("AES Key Expansion: Generating 15 round keys");

			for (let r = 0; r < 15; r++) {
				setCurrentOperation(
					`Round ${r} key: ${Array.from(roundKeys[r].slice(0, 4))
						.map((b) => b.toString(16).padStart(2, "0"))
						.join("")}...`,
				);
				visualizer.updateMatrix(roundKeys[r]);
				await new Promise((resolve) => setTimeout(resolve, 400 / speed));
			}

			setCurrentOperation(
				`Key expansion complete: ${roundKeys.length} round keys generated`,
			);
		} catch (error) {
			console.error("Key expansion error:", error);
			setCurrentOperation("Key expansion error");
		} finally {
			setIsAnimating(false);
		}
	};

	useEffect(() => {
		if (!engine) return;

		const setupScene = async () => {
			const visualizer = new StateMatrixVisualizer(
				engine.getApplication(),
				engine.getApplication().stage as any,
			);
			await visualizer.init();
			visualizerRef.current = visualizer;
		};

		setupScene();

		return () => {
			visualizerRef.current?.destroy();
			visualizerRef.current = null;
		};
	}, [engine]);

	useEffect(() => {
		if (visualizerRef.current) {
			visualizerRef.current.speedMultiplier = speed;
		}
	}, [speed]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1 }}
		>
			<LiveRegion message={currentOperation} />
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-symmetric-500/10">
					<Grid3x3 size={20} className="text-symmetric-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-symmetric-400">AES Cipher</h2>
					<div className="mt-1">
						<StepGuide
							sections={[
								{
									title: "The Digital Blender",
									body: "AES works like a digital blender. Through multiple rounds of shuffling and swapping, it achieves 'Confusion' (hiding the relationship between the key and ciphertext) and 'Diffusion' (spreading the influence of a single plaintext bit across the entire ciphertext).",
								},
								{
									title: "SubBytes",
									body: "Each byte is replaced using a lookup table (S-box). This non-linear substitution is what gives AES its strength against algebraic attacks.",
								},
								{
									title: "ShiftRows",
									body: "The rows of the 4x4 state are shifted by different offsets. This diffuses the bytes across columns, creating the avalanche effect where changing one plaintext bit changes many ciphertext bits.",
								},
								{
									title: "MixColumns",
									body: "Each column is transformed using linear mixing in GF(2⁸). This combines the four bytes in each column, spreading influence across the entire state.",
								},
								{
									title: "AddRoundKey",
									body: "The state is XORed with the round key derived from the key schedule. This ensures the key's influence reaches every byte of the state.",
								},
							]}
						/>
					</div>
					<p className="text-sm text-surface-500">Step 3 of 6</p>
				</div>
			</div>

			<p className="mb-6 text-surface-400 leading-relaxed">
				The plaintext message is encrypted using the AES-256 session key. The
				AES algorithm operates on a 4x4 state matrix through multiple rounds of
				substitution and permutation, effectively 'blending' the data until it's
				indistinguishable from random noise.
			</p>

			<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold text-white">AES State Matrix</h3>
					<div className="flex gap-2">
						<button
							onClick={runAESAnimation}
							disabled={isAnimating}
							className="flex items-center gap-2 rounded-md bg-symmetric-600 px-4 py-2 text-sm font-medium text-white hover:bg-symmetric-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Play size={16} />
							{isAnimating ? "Animating..." : "Play Animation"}
						</button>
						<button
							onClick={runKeyExpansionAnimation}
							disabled={isAnimating}
							className="flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Play size={16} />
							Key Schedule
						</button>
						{isAnimating && (
							<button
								onClick={() => visualizerRef.current?.pause()}
								className="flex items-center gap-2 rounded-md bg-surface-700 px-4 py-2 text-sm font-medium text-white hover:bg-surface-600 transition-colors"
							>
								<RotateCcw size={16} />
								Reset
							</button>
						)}
					</div>
				</div>

				<div className="relative">
					<div className="w-full h-64 rounded-lg bg-surface-900/50 border border-surface-800 flex items-center justify-center">
						<span className="text-xs text-surface-600 uppercase tracking-widest">
							Visualization on shared canvas
						</span>
					</div>
					{currentOperation && (
						<div className="mt-3 rounded-md bg-surface-800 px-4 py-3">
							<p className="text-sm font-mono text-symmetric-400">
								{currentOperation}
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
					<h4 className="text-sm font-semibold text-symmetric-400">SubBytes</h4>
					<p className="mt-1 text-xs text-surface-500">
						Non-linear substitution using S-box
					</p>
				</div>
				<div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
					<h4 className="text-sm font-semibold text-symmetric-400">
						ShiftRows
					</h4>
					<p className="mt-1 text-xs text-surface-500">
						Cyclic shift of state matrix rows
					</p>
				</div>
				<div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
					<h4 className="text-sm font-semibold text-symmetric-400">
						MixColumns
					</h4>
					<p className="mt-1 text-xs text-surface-500">
						Column mixing via Galois Field multiplication
					</p>
				</div>
				<div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
					<h4 className="text-sm font-semibold text-symmetric-400">
						AddRoundKey
					</h4>
					<p className="mt-1 text-xs text-surface-500">
						XOR operation with round key
					</p>
				</div>
			</div>

			<p className="mt-6 text-sm text-surface-500">
				AES-256 uses 14 rounds of substitution-permutation operations for strong
				encryption.
			</p>
		</motion.div>
	);
}

function Step3AESCipher() {
	return <AESCipherContent />;
}

export const Route = createFileRoute("/handshake/step-3")({
	component: Step3AESCipher,
});
