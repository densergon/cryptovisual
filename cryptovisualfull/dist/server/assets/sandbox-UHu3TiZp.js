import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { t as LiveRegion } from "./LiveRegion-bH5_dx26.js";
import { t as StateMatrixVisualizer } from "./state-matrix-scene-Dats1kKB.js";
import { t as useReducedMotion } from "./useReducedMotion-Bbb4EYym.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { RotateCcw, Unlock, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Application } from "pixi.js";
//#region src/shared/hooks/useWebAudio.ts
function useWebAudio() {
	const reduced = useReducedMotion();
	const ctxRef = useRef(null);
	const getContext = useCallback(() => {
		if (reduced) return null;
		if (!ctxRef.current) try {
			ctxRef.current = new AudioContext();
		} catch {
			return null;
		}
		if (ctxRef.current.state === "suspended") ctxRef.current.resume();
		return ctxRef.current;
	}, [reduced]);
	return { playTone: useCallback((type) => {
		const ctx = getContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		switch (type) {
			case "packet_arrival":
				osc.frequency.setValueAtTime(880, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + .15);
				gain.gain.setValueAtTime(.15, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .2);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + .2);
				break;
			case "click":
				osc.frequency.setValueAtTime(600, ctx.currentTime);
				gain.gain.setValueAtTime(.08, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .05);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + .05);
				break;
			case "complete":
				osc.frequency.setValueAtTime(523, ctx.currentTime);
				osc.frequency.setValueAtTime(659, ctx.currentTime + .15);
				osc.frequency.setValueAtTime(784, ctx.currentTime + .3);
				gain.gain.setValueAtTime(.12, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .5);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + .5);
				break;
		}
	}, [getContext]) };
}
//#endregion
//#region src/features/sandbox/components/BitFlipper.tsx
var STORAGE_KEY = "cv_bitflipper_ciphertext";
var STORAGE_KEY_ORIGINAL = "cv_bitflipper_original";
function loadFromStorage() {
	try {
		const ct = sessionStorage.getItem(STORAGE_KEY);
		const orig = sessionStorage.getItem(STORAGE_KEY_ORIGINAL);
		return {
			ciphertext: ct ? new Uint8Array(JSON.parse(ct)) : null,
			original: orig ? new Uint8Array(JSON.parse(orig)) : null
		};
	} catch {
		return {
			ciphertext: null,
			original: null
		};
	}
}
function saveToStorage(ciphertext, original) {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ciphertext)));
		sessionStorage.setItem(STORAGE_KEY_ORIGINAL, JSON.stringify(Array.from(original)));
	} catch {}
}
function BitFlipper() {
	const canvasRef = useRef(null);
	const visualizerRef = useRef(null);
	const appRef = useRef(null);
	const worker = useCryptoWorker();
	const [ciphertext, setCiphertext] = useState(/* @__PURE__ */ new Uint8Array(16));
	const [originalCiphertext, setOriginalCiphertext] = useState(/* @__PURE__ */ new Uint8Array(16));
	const [isProcessing, setIsProcessing] = useState(false);
	const [diffCount, setDiffCount] = useState(0);
	const [originalDecrypt, setOriginalDecrypt] = useState(null);
	const [modifiedDecrypt, setModifiedDecrypt] = useState(null);
	const [isDecrypting, setIsDecrypting] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");
	const { playTone } = useWebAudio();
	const keyRef = useRef("");
	const ivRef = useRef("");
	const initializedRef = useRef(false);
	const toHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
	useEffect(() => {
		const init = async () => {
			if (!canvasRef.current || !worker || initializedRef.current) return;
			initializedRef.current = true;
			const app = new Application();
			await app.init({
				canvas: canvasRef.current,
				backgroundAlpha: 0,
				autoDensity: true,
				resolution: window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1
			});
			appRef.current = app;
			const visualizer = new StateMatrixVisualizer(app, app.stage);
			await visualizer.init();
			visualizerRef.current = visualizer;
			const stored = loadFromStorage();
			if (stored.ciphertext && stored.original && stored.ciphertext.length === 16) {
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
			const { ciphertext: ctBase64 } = await worker.encryptAES(keyBytes, "Sandbox mode active");
			if (!ctBase64) throw new Error("Encryption failed");
			const ct = new Uint8Array(Uint8Array.from(atob(ctBase64), (c) => c.charCodeAt(0)).slice(0, 16));
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
	const toggleBit = (index) => {
		const newCt = new Uint8Array(ciphertext);
		newCt[index] ^= 1;
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
		await visualizerRef.current.animateAvalancheEffect(originalCiphertext, ciphertext);
		setIsProcessing(false);
	}, [originalCiphertext, ciphertext]);
	const handleDecrypt = useCallback(async () => {
		if (!keyRef.current || !ivRef.current || !worker) return;
		setIsDecrypting(true);
		setOriginalDecrypt(null);
		setModifiedDecrypt(null);
		setStatusMessage("Decrypting...");
		try {
			setOriginalDecrypt((await worker.decryptAES(keyRef.current, toHex(originalCiphertext), ivRef.current)).decryptedData ?? "(empty)");
		} catch {
			setOriginalDecrypt("AUTH FAILED — decryption error");
		}
		try {
			setModifiedDecrypt((await worker.decryptAES(keyRef.current, toHex(ciphertext), ivRef.current)).decryptedData ?? "(empty)");
		} catch {
			setModifiedDecrypt("AUTH FAILED — bit flip detected");
		}
		setIsDecrypting(false);
		playTone("packet_arrival");
		setStatusMessage("Decryption comparison complete");
	}, [
		originalCiphertext,
		ciphertext,
		worker,
		playTone,
		toHex
	]);
	const reset = () => {
		setCiphertext(new Uint8Array(originalCiphertext));
		setDiffCount(0);
		visualizerRef.current?.updateMatrix(originalCiphertext);
		setModifiedDecrypt(null);
		saveToStorage(originalCiphertext, originalCiphertext);
		setStatusMessage("Reset to original ciphertext");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-6 p-6 rounded-xl border border-surface-700 bg-surface-900",
		children: [
			/* @__PURE__ */ jsx(LiveRegion, { message: statusMessage }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-xl font-bold text-white",
					children: "Bit Flipper Sandbox"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-surface-400",
					children: "Flip bits in the ciphertext to see the avalanche effect"
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ jsx(motion.button, {
							onClick: reset,
							whileTap: { scale: .9 },
							className: "p-2 rounded-lg bg-surface-700 text-surface-300 hover:bg-surface-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
							title: "Reset to original",
							children: /* @__PURE__ */ jsx(RotateCcw, { size: 18 })
						}),
						/* @__PURE__ */ jsxs(motion.button, {
							onClick: analyzeDiff,
							disabled: isProcessing,
							whileTap: { scale: .95 },
							className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400",
							children: [/* @__PURE__ */ jsx(Zap, { size: 16 }), isProcessing ? "Analyzing..." : "Analyze Diffusion"]
						}),
						/* @__PURE__ */ jsxs(motion.button, {
							onClick: handleDecrypt,
							disabled: isDecrypting,
							whileTap: { scale: .95 },
							className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-symmetric-600 text-white hover:bg-symmetric-500 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-symmetric-400",
							children: [/* @__PURE__ */ jsx(Unlock, { size: 16 }), isDecrypting ? "Decrypting..." : "Decrypt & Compare"]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "lg:col-span-2 relative rounded-lg border border-surface-800 bg-surface-950 overflow-hidden",
					role: "img",
					"aria-label": "State matrix visualization",
					children: [/* @__PURE__ */ jsx("canvas", {
						ref: canvasRef,
						className: "w-full h-80"
					}), /* @__PURE__ */ jsx("div", {
						className: "absolute top-4 left-4 pointer-events-none",
						children: /* @__PURE__ */ jsx("span", {
							className: "text-xs font-mono text-surface-500 uppercase tracking-widest",
							children: "State Matrix View"
						})
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-lg bg-surface-800 border border-surface-700",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500 uppercase",
								children: "Hamming Distance"
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-3xl font-mono font-bold text-amber-400",
								"aria-live": "polite",
								children: [diffCount, " bits"]
							})]
						}),
						(originalDecrypt || modifiedDecrypt) && /* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [originalDecrypt && /* @__PURE__ */ jsxs("div", {
								className: "p-3 rounded-lg bg-green-950/30 border border-green-700/40",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-green-400 uppercase block mb-1",
									children: "Original Decryption"
								}), /* @__PURE__ */ jsx("div", {
									className: "font-mono text-xs text-green-300 break-all",
									children: originalDecrypt
								})]
							}), modifiedDecrypt && /* @__PURE__ */ jsxs("div", {
								className: "p-3 rounded-lg bg-amber-950/30 border border-amber-700/40",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-amber-400 uppercase block mb-1",
									children: "Modified Decryption"
								}), /* @__PURE__ */ jsx("div", {
									className: "font-mono text-xs text-amber-300 break-all",
									children: modifiedDecrypt
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-lg bg-surface-800 border border-surface-700",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500 uppercase mb-2 block",
								children: "Ciphertext Bytes"
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-4 gap-2",
								children: Array.from(ciphertext).map((byte, i) => /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => toggleBit(i),
									className: `p-1 text-[10px] font-mono rounded border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${byte !== originalCiphertext[i] ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-surface-900 border-surface-700 text-surface-400"}`,
									"aria-label": `Byte ${i}: ${byte.toString(16).padStart(2, "0").toUpperCase()}. Click to flip bit.`,
									children: byte.toString(16).padStart(2, "0").toUpperCase()
								}, i))
							})]
						})
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/routes/sandbox.tsx?tsr-split=component
function SandboxPage() {
	return /* @__PURE__ */ jsx("div", {
		className: "max-w-5xl mx-auto p-6",
		children: /* @__PURE__ */ jsx(BitFlipper, {})
	});
}
//#endregion
export { SandboxPage as component };
