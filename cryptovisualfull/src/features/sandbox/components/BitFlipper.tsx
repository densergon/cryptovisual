import { RotateCcw, Unlock, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Application } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveRegion } from "../../../shared/components/LiveRegion";
import { useWebAudio } from "../../../shared/hooks/useWebAudio";
import { useCryptoWorker } from "../../../shared/providers/CryptoWorkerProvider";
import { StateMatrixVisualizer } from "../../../visualization/scenes/state-matrix-scene";

const STORAGE_KEY = "cv_bitflipper_ciphertext";
const STORAGE_KEY_ORIGINAL = "cv_bitflipper_original";

function loadFromStorage(): {
	ciphertext: Uint8Array | null;
	original: Uint8Array | null;
} {
	try {
		const ct = sessionStorage.getItem(STORAGE_KEY);
		const orig = sessionStorage.getItem(STORAGE_KEY_ORIGINAL);
		return {
			ciphertext: ct ? new Uint8Array(JSON.parse(ct)) : null,
			original: orig ? new Uint8Array(JSON.parse(orig)) : null,
		};
	} catch {
		return { ciphertext: null, original: null };
	}
}

function saveToStorage(ciphertext: Uint8Array, original: Uint8Array) {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ciphertext)));
		sessionStorage.setItem(
			STORAGE_KEY_ORIGINAL,
			JSON.stringify(Array.from(original)),
		);
	} catch {}
}

export function BitFlipper() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const visualizerRef = useRef<StateMatrixVisualizer | null>(null);
	const appRef = useRef<Application | null>(null);
	const worker = useCryptoWorker();

	const [ciphertext, setCiphertext] = useState<Uint8Array>(new Uint8Array(16));
	const [originalCiphertext, setOriginalCiphertext] = useState<Uint8Array>(
		new Uint8Array(16),
	);
	const [isProcessing, setIsProcessing] = useState(false);
	const [diffCount, setDiffCount] = useState(0);
	const [originalDecrypt, setOriginalDecrypt] = useState<string | null>(null);
	const [modifiedDecrypt, setModifiedDecrypt] = useState<string | null>(null);
	const [isDecrypting, setIsDecrypting] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");
	const { playTone } = useWebAudio();

	const keyRef = useRef<string>("");
	const ivRef = useRef<string>("");
	const initializedRef = useRef(false);

	const toHex = (bytes: Uint8Array) =>
		Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

	useEffect(() => {
		const init = async () => {
			if (!canvasRef.current || !worker || initializedRef.current) return;
			initializedRef.current = true;

			const app = new Application();
			await app.init({
				canvas: canvasRef.current,
				backgroundAlpha: 0,
				autoDensity: true,
				resolution: window.devicePixelRatio
					? Math.min(window.devicePixelRatio, 2)
					: 1,
			});
			appRef.current = app;
			const visualizer = new StateMatrixVisualizer(app, app.stage);
			await visualizer.init();
			visualizerRef.current = visualizer;

			const stored = loadFromStorage();
			if (
				stored.ciphertext &&
				stored.original &&
				stored.ciphertext.length === 16
			) {
				setCiphertext(stored.ciphertext);
				setOriginalCiphertext(stored.original);
				visualizer.updateMatrix(stored.ciphertext);
				setStatusMessage("Restored previous session");
				return;
			}

			const { keyBytes, iv } = await worker.generateAESKey(256);
			if (!keyBytes || !iv) throw new Error("Key generation failed");
			keyRef.current = keyBytes;
			ivRef.current = iv;

			const { ciphertext: ctBase64 } = await worker.encryptAES(
				keyBytes,
				"Sandbox mode active",
			);
			if (!ctBase64) throw new Error("Encryption failed");
			const ct = new Uint8Array(
				Uint8Array.from(atob(ctBase64), (c) => c.charCodeAt(0)).slice(0, 16),
			);

			setCiphertext(ct);
			setOriginalCiphertext(ct);
			visualizer.updateMatrix(ct);
			saveToStorage(ct, ct);
			setStatusMessage("New ciphertext generated");
		};
		init();
		return () => {
			if (appRef.current) appRef.current.destroy(true);
		};
	}, [worker]);

	const toggleBit = (index: number) => {
		const newCt = new Uint8Array(ciphertext);
		newCt[index] ^= 0x01;
		setCiphertext(newCt);
		visualizerRef.current?.updateMatrix(newCt);
		setModifiedDecrypt(null);
		saveToStorage(newCt, originalCiphertext);
		playTone("click");
		setStatusMessage(`Bit ${index} flipped`);
	};

	const analyzeDiff = useCallback(async () => {
		setIsProcessing(true);
		if (!visualizerRef.current) return;

		let diffs = 0;
		for (let i = 0; i < 16; i++) {
			let xor = originalCiphertext[i] ^ ciphertext[i];
			while (xor > 0) {
				if (xor & 1) diffs++;
				xor >>= 1;
			}
		}
		setDiffCount(diffs);
		setStatusMessage(`Hamming distance: ${diffs} bits differ`);

		await visualizerRef.current.animateAvalancheEffect(
			originalCiphertext,
			ciphertext,
		);
		setIsProcessing(false);
	}, [originalCiphertext, ciphertext]);

	const handleDecrypt = useCallback(async () => {
		if (!keyRef.current || !ivRef.current || !worker) return;
		setIsDecrypting(true);
		setOriginalDecrypt(null);
		setModifiedDecrypt(null);
		setStatusMessage("Decrypting...");

		try {
			const result = await worker.decryptAES(
				keyRef.current,
				toHex(originalCiphertext),
				ivRef.current,
			);
			setOriginalDecrypt(result.decryptedData ?? "(empty)");
		} catch {
			setOriginalDecrypt("AUTH FAILED — decryption error");
		}

		try {
			const result = await worker.decryptAES(
				keyRef.current,
				toHex(ciphertext),
				ivRef.current,
			);
			setModifiedDecrypt(result.decryptedData ?? "(empty)");
		} catch {
			setModifiedDecrypt("AUTH FAILED — bit flip detected");
		}

		setIsDecrypting(false);
		playTone("packet_arrival");
		setStatusMessage("Decryption comparison complete");
	}, [originalCiphertext, ciphertext, worker, playTone, toHex]);

	const reset = () => {
		setCiphertext(new Uint8Array(originalCiphertext));
		setDiffCount(0);
		visualizerRef.current?.updateMatrix(originalCiphertext);
		setModifiedDecrypt(null);
		saveToStorage(originalCiphertext, originalCiphertext);
		setStatusMessage("Reset to original ciphertext");
	};

	return (
		<div className="flex flex-col gap-6 p-6 rounded-xl border border-surface-700 bg-surface-900">
			<LiveRegion message={statusMessage} />
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-bold text-white">Bit Flipper Sandbox</h3>
					<p className="text-sm text-surface-400">
						Flip bits in the ciphertext to see the avalanche effect
					</p>
				</div>
				<div className="flex gap-2">
					<motion.button
						onClick={reset}
						whileTap={{ scale: 0.9 }}
						className="p-2 rounded-lg bg-surface-700 text-surface-300 hover:bg-surface-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
						title="Reset to original"
					>
						<RotateCcw size={18} />
					</motion.button>
					<motion.button
						onClick={analyzeDiff}
						disabled={isProcessing}
						whileTap={{ scale: 0.95 }}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
					>
						<Zap size={16} />
						{isProcessing ? "Analyzing..." : "Analyze Diffusion"}
					</motion.button>
					<motion.button
						onClick={handleDecrypt}
						disabled={isDecrypting}
						whileTap={{ scale: 0.95 }}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-symmetric-600 text-white hover:bg-symmetric-500 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-symmetric-400"
					>
						<Unlock size={16} />
						{isDecrypting ? "Decrypting..." : "Decrypt & Compare"}
					</motion.button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div
					className="lg:col-span-2 relative rounded-lg border border-surface-800 bg-surface-950 overflow-hidden"
					role="img"
					aria-label="State matrix visualization"
				>
					<canvas ref={canvasRef} className="w-full h-80" />
					<div className="absolute top-4 left-4 pointer-events-none">
						<span className="text-xs font-mono text-surface-500 uppercase tracking-widest">
							State Matrix View
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="p-4 rounded-lg bg-surface-800 border border-surface-700">
						<span className="text-xs text-surface-500 uppercase">
							Hamming Distance
						</span>
						<div
							className="text-3xl font-mono font-bold text-amber-400"
							aria-live="polite"
						>
							{diffCount} bits
						</div>
					</div>

					{(originalDecrypt || modifiedDecrypt) && (
						<div className="space-y-2">
							{originalDecrypt && (
								<div className="p-3 rounded-lg bg-green-950/30 border border-green-700/40">
									<span className="text-xs text-green-400 uppercase block mb-1">
										Original Decryption
									</span>
									<div className="font-mono text-xs text-green-300 break-all">
										{originalDecrypt}
									</div>
								</div>
							)}
							{modifiedDecrypt && (
								<div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/40">
									<span className="text-xs text-amber-400 uppercase block mb-1">
										Modified Decryption
									</span>
									<div className="font-mono text-xs text-amber-300 break-all">
										{modifiedDecrypt}
									</div>
								</div>
							)}
						</div>
					)}

					<div className="p-4 rounded-lg bg-surface-800 border border-surface-700">
						<span className="text-xs text-surface-500 uppercase mb-2 block">
							Ciphertext Bytes
						</span>
						<div className="grid grid-cols-4 gap-2">
							{Array.from(ciphertext).map((byte, i) => (
								<button
									key={i}
									onClick={() => toggleBit(i)}
									className={`p-1 text-[10px] font-mono rounded border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
										byte !== originalCiphertext[i]
											? "bg-amber-500/20 border-amber-500 text-amber-400"
											: "bg-surface-900 border-surface-700 text-surface-400"
									}`}
									aria-label={`Byte ${i}: ${byte.toString(16).padStart(2, "0").toUpperCase()}. Click to flip bit.`}
								>
									{byte.toString(16).padStart(2, "0").toUpperCase()}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
