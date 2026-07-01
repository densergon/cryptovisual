import { createFileRoute } from "@tanstack/react-router";
import { Binary, Lock, RotateCcw, Shuffle, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { Application } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCryptoWorker } from "../../shared/providers/CryptoWorkerProvider";
import { BitFlipperScene } from "../../visualization/scenes/bit-flipper-scene";

export const Route = createFileRoute("/sandbox/bit-flipper")({
	component: BitFlipperSandbox,
});

interface DecryptionResult {
	text: string;
	isError: boolean;
	durationMs: number;
}

function BitFlipperSandbox() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const bitFlipperRef = useRef<BitFlipperScene | null>(null);
	const appRef = useRef<Application | null>(null);
	const worker = useCryptoWorker();

	const [flippedCount, setFlippedCount] = useState(0);
	const [totalBits, setTotalBits] = useState(0);
	const [flipPercentage, setFlipPercentage] = useState(0);
	const [isInitializing, setIsInitializing] = useState(true);
	const [plaintext] = useState("Hello, CryptoVisual!");
	const [originalDecryption, setOriginalDecryption] =
		useState<DecryptionResult | null>(null);
	const [modifiedDecryption, setModifiedDecryption] =
		useState<DecryptionResult | null>(null);
	const [isDecrypting, setIsDecrypting] = useState(false);

	const keyRef = useRef<string>("");
	const ivRef = useRef<string>("");

	useEffect(() => {
		if (!canvasRef.current) return;

		const initPixi = async () => {
			if (!worker) return;
			const app = new Application();
			await app.init({
				canvas: canvasRef.current!,
				backgroundAlpha: 0,
				autoDensity: true,
				resolution: window.devicePixelRatio || 1,
			});

			appRef.current = app;

			try {
				const { keyBytes, iv } = await worker.generateAESKey(256);
				if (!keyBytes || !iv) throw new Error("AES key generation failed");
				keyRef.current = keyBytes;
				ivRef.current = iv;

				const { ciphertext: ctHex } = await worker.encryptAES(
					keyBytes,
					plaintext,
				);
				if (!ctHex) throw new Error("AES encryption failed");

				const ctBytes = new Uint8Array(
					ctHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
				);

				const bitFlipper = new BitFlipperScene(app, app.stage);
				await bitFlipper.init(ctBytes);
				bitFlipperRef.current = bitFlipper;

				const stats = bitFlipper.getStats();
				setTotalBits(stats.totalBits);
			} catch (err) {
				console.error("BitFlipper init failed:", err);
			} finally {
				setIsInitializing(false);
			}
		};

		initPixi();

		return () => {
			if (bitFlipperRef.current) {
				bitFlipperRef.current.cleanup();
			}
			if (appRef.current) {
				appRef.current.destroy(true);
			}
		};
	}, [plaintext, worker]);

	const updateStats = useCallback(() => {
		if (!bitFlipperRef.current) return;
		const stats = bitFlipperRef.current.getStats();
		setFlippedCount(stats.flippedBits);
		setFlipPercentage(stats.flipPercentage);
	}, []);

	const handleFlipRandom = () => {
		if (!bitFlipperRef.current) return;
		bitFlipperRef.current.flipRandomBits(5);
		updateStats();
		setModifiedDecryption(null);
	};

	const handleReset = () => {
		if (!bitFlipperRef.current) return;
		bitFlipperRef.current.resetBits();
		updateStats();
		setModifiedDecryption(null);
	};

	const handleDecrypt = async () => {
		if (!bitFlipperRef.current || !keyRef.current || !ivRef.current || !worker)
			return;
		setIsDecrypting(true);
		setOriginalDecryption(null);
		setModifiedDecryption(null);

		const originalCt = bitFlipperRef.current.getOriginalCiphertext();
		const modifiedCt = bitFlipperRef.current.getModifiedCiphertext();
		const originalHex = BitFlipperScene.toHex(originalCt);
		const modifiedHex = BitFlipperScene.toHex(modifiedCt);

		try {
			const origResult = await worker.decryptAES(
				keyRef.current,
				originalHex,
				ivRef.current,
			);
			setOriginalDecryption({
				text: origResult.decryptedData ?? "(empty)",
				isError: false,
				durationMs: origResult.durationMs ?? 0,
			});
		} catch {
			setOriginalDecryption({
				text: "Decryption failed (auth tag mismatch)",
				isError: true,
				durationMs: 0,
			});
		}

		try {
			const modResult = await worker.decryptAES(
				keyRef.current,
				modifiedHex,
				ivRef.current,
			);
			setModifiedDecryption({
				text: modResult.decryptedData ?? "(empty)",
				isError: false,
				durationMs: modResult.durationMs ?? 0,
			});
		} catch {
			setModifiedDecryption({
				text: "Decryption failed (auth tag mismatch)",
				isError: true,
				durationMs: 0,
			});
		}

		setIsDecrypting(false);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-symmetric-500/10">
					<Binary size={20} className="text-symmetric-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-symmetric-400">
						Bit Flipper Sandbox
					</h2>
					<p className="text-sm text-surface-500">
						Real AES-GCM decryption — flip bits, observe the avalanche effect
					</p>
				</div>
			</div>

			<p className="mb-6 text-surface-400 leading-relaxed">
				Click on individual bits to flip them in a real AES-GCM ciphertext, then
				decrypt to see how even a single bit change corrupts the output or
				triggers authentication failure.
			</p>

			<div className="mb-6 grid grid-cols-3 gap-4">
				<div className="rounded-lg border border-surface-700 bg-surface-900 p-4">
					<div className="text-sm text-surface-500">Total Bits</div>
					<div className="text-2xl font-bold text-surface-300">{totalBits}</div>
				</div>
				<div className="rounded-lg border border-surface-700 bg-surface-900 p-4">
					<div className="text-sm text-surface-500">Flipped Bits</div>
					<div className="text-2xl font-bold text-amber-400">
						{flippedCount}
					</div>
				</div>
				<div className="rounded-lg border border-surface-700 bg-surface-900 p-4">
					<div className="text-sm text-surface-500">Flip Percentage</div>
					<div className="text-2xl font-bold text-blue-400">
						{flipPercentage.toFixed(1)}%
					</div>
				</div>
			</div>

			<div className="relative mb-6 overflow-hidden rounded-lg border border-surface-700 bg-surface-900">
				{isInitializing && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-950/80">
						<div className="flex items-center gap-3 text-surface-400">
							<div className="h-5 w-5 animate-spin rounded-full border-2 border-symmetric-400 border-t-transparent" />
							Generating AES key & encrypting...
						</div>
					</div>
				)}
				<canvas ref={canvasRef} className="h-[600px] w-full" />
			</div>

			<div className="mb-6 flex gap-3">
				<button
					type="button"
					onClick={handleFlipRandom}
					disabled={isInitializing}
					className="flex items-center gap-2 rounded-lg bg-surface-600 px-4 py-2 text-sm font-medium text-white hover:bg-surface-500 disabled:opacity-50 transition-colors"
				>
					<Shuffle size={16} />
					Flip 5 Random Bits
				</button>

				<button
					type="button"
					onClick={handleReset}
					disabled={isInitializing}
					className="flex items-center gap-2 rounded-lg bg-surface-700 px-4 py-2 text-sm font-medium text-white hover:bg-surface-600 disabled:opacity-50 transition-colors"
				>
					<RotateCcw size={16} />
					Reset All
				</button>

				<button
					type="button"
					onClick={handleDecrypt}
					disabled={isInitializing || isDecrypting || flippedCount === 0}
					className="flex items-center gap-2 rounded-lg bg-symmetric-600 px-4 py-2 text-sm font-medium text-white hover:bg-symmetric-500 disabled:opacity-50 transition-colors"
				>
					{isDecrypting ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							Decrypting...
						</>
					) : (
						<>
							<Unlock size={16} />
							Decrypt & Compare
						</>
					)}
				</button>
			</div>

			{(originalDecryption || modifiedDecryption) && (
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 grid gap-4 md:grid-cols-2"
				>
					<div className="rounded-lg border border-green-700/40 bg-green-950/30 p-5">
						<div className="mb-2 flex items-center gap-2">
							<Lock size={14} className="text-green-400" />
							<span className="text-sm font-semibold text-green-400">
								Original Ciphertext
							</span>
						</div>
						{originalDecryption && (
							<div
								className={`font-mono text-sm break-all ${
									originalDecryption.isError ? "text-red-400" : "text-green-300"
								}`}
							>
								{originalDecryption.text}
							</div>
						)}
						{originalDecryption && !originalDecryption.isError && (
							<div className="mt-2 text-xs text-surface-500">
								{originalDecryption.durationMs.toFixed(1)}ms
							</div>
						)}
					</div>

					<div className="rounded-lg border border-amber-700/40 bg-amber-950/30 p-5">
						<div className="mb-2 flex items-center gap-2">
							<Unlock size={14} className="text-amber-400" />
							<span className="text-sm font-semibold text-amber-400">
								Modified Ciphertext
							</span>
						</div>
						{modifiedDecryption && (
							<div
								className={`font-mono text-sm break-all ${
									modifiedDecryption.isError ? "text-red-400" : "text-amber-300"
								}`}
							>
								{modifiedDecryption.text}
							</div>
						)}
						{modifiedDecryption?.isError && (
							<div className="mt-2 text-xs text-red-400/70">
								AES-GCM auth tag verification failed — the ciphertext was
								altered
							</div>
						)}
						{modifiedDecryption && !modifiedDecryption.isError && (
							<div className="mt-2 text-xs text-surface-500">
								{modifiedDecryption.durationMs.toFixed(1)}ms
							</div>
						)}
					</div>
				</motion.div>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
					<h3 className="mb-3 font-semibold text-white">How It Works</h3>
					<ul className="space-y-2 text-sm text-surface-400">
						<li className="flex items-start gap-2">
							<span className="mt-1 text-green-400">•</span>
							<span>
								A real AES-256-GCM key is generated and encrypts a plaintext
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1 text-green-400">•</span>
							<span>Green cells are 0-bits, red cells are 1-bits</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1 text-green-400">•</span>
							<span>Yellow highlight indicates a flipped bit</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1 text-green-400">•</span>
							<span>Click any bit to toggle its value</span>
						</li>
					</ul>
				</div>

				<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
					<h3 className="mb-3 font-semibold text-white">Avalanche Effect</h3>
					<ul className="space-y-2 text-sm text-surface-400">
						<li className="flex items-start gap-2">
							<span className="mt-1 text-blue-400">•</span>
							<span>
								AES-GCM includes an authentication tag — any bit flip will be
								detected
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1 text-blue-400">•</span>
							<span>
								Without authenticated encryption, flipping bits can produce
								garbled output
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1 text-blue-400">•</span>
							<span>
								This demonstrates why authenticated encryption is essential
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1 text-blue-400">•</span>
							<span>
								All crypto operations run in a Web Worker — never on the main
								thread
							</span>
						</li>
					</ul>
				</div>
			</div>
		</motion.div>
	);
}
