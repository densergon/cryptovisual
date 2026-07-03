import { n as AESVisualEngine, t as AESEngine } from "./crypto-engine-CSsLj5MI.js";
import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { n as PredictPrompt, t as PREDICT_PROMPTS } from "./predict-prompts-BZyozWGc.js";
import { t as StepGuide } from "./StepGuide-CNGcpcGz.js";
import { n as useCanvas } from "./CanvasProvider-aqhBXwm5.js";
import { n as useWizard, o as usePedagogyMode } from "./wizard-provider-pbkfxoqq.js";
import { t as LiveRegion } from "./LiveRegion-bH5_dx26.js";
import { n as useAnimationSpeed } from "./AnimationSpeedProvider-DFGQ3vgf.js";
import { t as StateMatrixVisualizer } from "./state-matrix-scene-Dats1kKB.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Grid3x3, Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import gsap from "gsap";
//#region src/shared/components/pedagogy/ConfusionDiffusionLegend.tsx
function ConfusionDiffusionLegend() {
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .3 },
		className: "mb-6 rounded-lg border border-symmetric-500/30 bg-symmetric-500/5 p-4",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "mb-3 text-sm font-semibold text-symmetric-400 uppercase tracking-wide",
			children: "The Digital Blender — Confusion & Diffusion"
		}), /* @__PURE__ */ jsxs("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "rounded bg-surface-800 p-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx("span", {
						className: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-600/20 text-xs font-bold text-amber-400",
						children: "C"
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs font-semibold text-amber-400",
						children: "Confusion"
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-0.5 text-[11px] text-surface-400 leading-relaxed",
						children: [
							"Each ciphertext bit depends on multiple parts of the key, making it impossible to reverse-engineer the key from the output. In AES, ",
							/* @__PURE__ */ jsx("strong", {
								className: "text-amber-400",
								children: "SubBytes"
							}),
							" ",
							"creates confusion by replacing bytes via the S-box lookup table."
						]
					})] })]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "rounded bg-surface-800 p-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx("span", {
						className: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-cyan-600/20 text-xs font-bold text-cyan-400",
						children: "D"
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs font-semibold text-cyan-400",
						children: "Diffusion"
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-0.5 text-[11px] text-surface-400 leading-relaxed",
						children: [
							"Changing one plaintext bit flips many ciphertext bits (the avalanche effect). In AES,",
							" ",
							/* @__PURE__ */ jsx("strong", {
								className: "text-cyan-400",
								children: "ShiftRows"
							}),
							" and",
							" ",
							/* @__PURE__ */ jsx("strong", {
								className: "text-cyan-400",
								children: "MixColumns"
							}),
							" spread a single byte's influence across the entire 4x4 state matrix."
						]
					})] })]
				})
			})]
		})]
	});
}
//#endregion
//#region src/shared/components/pedagogy/OperationLegend.tsx
var OPERATION_DETAILS = {
	"SubBytes: Swapping values to break linear patterns": {
		label: "SubBytes",
		description: "Each byte is replaced via the S-box lookup table. This non-linear step creates confusion — hiding the relationship between key and ciphertext.",
		color: "bg-amber-600"
	},
	"ShiftRows: Diffusing bytes across the matrix": {
		label: "ShiftRows",
		description: "Rows of the state matrix are shifted by different offsets. Bytes diffuse across columns, starting the avalanche effect.",
		color: "bg-cyan-600"
	},
	"MixColumns: Blending columns for total diffusion": {
		label: "MixColumns",
		description: "Each column is transformed via Galois Field multiplication. Every output byte now depends on all input bytes of that column.",
		color: "bg-violet-600"
	},
	"AddRoundKey: Binding the state to the secret key": {
		label: "AddRoundKey",
		description: "The state is XORed with the round key. This binds the key material into the ciphertext.",
		color: "bg-emerald-600"
	},
	"Avalanche Effect: See how 1 bit flip changes everything": {
		label: "Avalanche Effect",
		description: "A single bit difference in the plaintext causes roughly 50% of ciphertext bits to flip. This is the hallmark of a strong cipher.",
		color: "bg-rose-600"
	}
};
function OperationLegend({ currentOperation }) {
	const { isPedagogyMode } = usePedagogyMode();
	if (!isPedagogyMode || !currentOperation) return null;
	const detail = OPERATION_DETAILS[currentOperation];
	return /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			y: 4
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .2 },
		className: "mt-2 rounded-lg border border-surface-700 bg-surface-800/80 p-3",
		children: detail ? /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ jsx("span", {
				className: `mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${detail.color} text-[10px] font-bold text-white`,
				children: detail.label.charAt(0)
			}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
				className: "text-xs font-semibold text-white",
				children: detail.label
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-0.5 text-[11px] text-surface-400 leading-relaxed",
				children: detail.description
			})] })]
		}) : /* @__PURE__ */ jsx("p", {
			className: "text-xs text-surface-400",
			children: currentOperation
		})
	}, currentOperation);
}
//#endregion
//#region src/routes/handshake.step-3.tsx?tsr-split=component
function AESCipherContent() {
	const { engine } = useCanvas();
	const worker = useCryptoWorker();
	const { speed } = useAnimationSpeed();
	const { send, aesKey, plaintext } = useWizard();
	const visualizerRef = useRef(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentOperation, setCurrentOperation] = useState("");
	const [authTagHex, setAuthTagHex] = useState(null);
	const { isPedagogyMode } = usePedagogyMode();
	const [showPredict, setShowPredict] = useState(true);
	const aesPrompt = PREDICT_PROMPTS.find((p) => p.step === 3);
	const runAESAnimation = async () => {
		if (!visualizerRef.current || !engine || isAnimating) return;
		if (!aesKey) return;
		setIsAnimating(true);
		setAuthTagHex(null);
		const visualizer = visualizerRef.current;
		visualizer.speedMultiplier = speed;
		try {
			if (!worker) throw new Error("Crypto worker not ready");
			const keyHex = Array.from(aesKey.keyBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
			const aesResult = await worker.encryptAES(keyHex, plaintext);
			setAuthTagHex(aesResult.authTag ?? null);
			send({
				type: "SET_CIPHERTEXT",
				ciphertext: {
					data: new Uint8Array(AESEngine.hexToArrayBuffer(aesResult.ciphertext)),
					iv: new Uint8Array(AESEngine.hexToArrayBuffer(aesResult.iv)),
					authTag: aesResult.authTag ? new Uint8Array(AESEngine.hexToArrayBuffer(aesResult.authTag)) : void 0,
					durationMs: aesResult.durationMs
				}
			});
			const plainBytes = new TextEncoder().encode(plaintext).slice(0, 16);
			const keyUint8 = aesKey.keyBytes.slice(0, 32);
			const sBox = new Uint8Array([
				99,
				124,
				119,
				123,
				242,
				107,
				111,
				197,
				48,
				1,
				103,
				43,
				254,
				215,
				171,
				118,
				202,
				130,
				201,
				125,
				250,
				89,
				71,
				240,
				173,
				212,
				162,
				175,
				156,
				164,
				114,
				192,
				183,
				253,
				147,
				38,
				54,
				63,
				247,
				204,
				52,
				165,
				229,
				241,
				113,
				216,
				49,
				21,
				4,
				199,
				35,
				195,
				24,
				150,
				5,
				154,
				7,
				18,
				128,
				226,
				235,
				39,
				178,
				117,
				9,
				131,
				44,
				26,
				27,
				110,
				90,
				160,
				82,
				59,
				214,
				179,
				41,
				227,
				47,
				132,
				83,
				209,
				0,
				237,
				32,
				252,
				177,
				91,
				106,
				203,
				190,
				57,
				74,
				76,
				88,
				207,
				208,
				239,
				170,
				251,
				67,
				77,
				51,
				133,
				69,
				249,
				2,
				127,
				80,
				60,
				159,
				168,
				81,
				163,
				64,
				143,
				146,
				157,
				56,
				245,
				188,
				182,
				218,
				33,
				16,
				255,
				243,
				210,
				205,
				12,
				19,
				236,
				95,
				151,
				68,
				23,
				196,
				167,
				126,
				61,
				100,
				93,
				25,
				115,
				96,
				129,
				79,
				220,
				34,
				42,
				144,
				136,
				70,
				238,
				184,
				20,
				222,
				94,
				11,
				219,
				224,
				50,
				58,
				10,
				73,
				6,
				36,
				92,
				194,
				211,
				172,
				98,
				145,
				149,
				228,
				121,
				231,
				200,
				55,
				109,
				141,
				213,
				78,
				169,
				108,
				86,
				244,
				234,
				101,
				122,
				174,
				8,
				186,
				120,
				37,
				46,
				28,
				166,
				180,
				198,
				232,
				221,
				116,
				31,
				75,
				189,
				139,
				138,
				112,
				62,
				181,
				102,
				72,
				3,
				246,
				14,
				97,
				53,
				87,
				185,
				134,
				193,
				29,
				158,
				225,
				248,
				152,
				17,
				105,
				217,
				142,
				148,
				155,
				30,
				135,
				233,
				206,
				85,
				40,
				223,
				140,
				161,
				137,
				13,
				191,
				230,
				66,
				104,
				65,
				153,
				45,
				15,
				176,
				84,
				187,
				22
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
			flippedPlain[0] ^= 1;
			const toHex = (bytes, len = 16) => Array.from(bytes.slice(0, len)).map((b) => b.toString(16).padStart(2, "0")).join("");
			let finalState = state;
			let flippedFinal = flippedPlain;
			try {
				const orig = await worker.runAESRoundOutputs(toHex(keyUint8), toHex(plainBytes));
				const flipped = await worker.runAESRoundOutputs(toHex(keyUint8), toHex(flippedPlain));
				finalState = new Uint8Array(orig.addRoundKeyState.match(/.{1,2}/g).map((h) => parseInt(h, 16)));
				flippedFinal = new Uint8Array(flipped.addRoundKeyState.match(/.{1,2}/g).map((h) => parseInt(h, 16)));
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
	const runKeyExpansionAnimation = useCallback(async () => {
		if (!visualizerRef.current || !engine || isAnimating) return;
		if (!aesKey) return;
		setIsAnimating(true);
		const visualizer = visualizerRef.current;
		visualizer.speedMultiplier = speed;
		try {
			const keyUint8 = aesKey.keyBytes.slice(0, 32);
			const roundKeys = AESVisualEngine.expandKey(keyUint8);
			setCurrentOperation("AES Key Expansion: Generating 15 round keys");
			for (let r = 0; r < roundKeys.length; r++) {
				const rKey = roundKeys[r];
				setCurrentOperation(`Round ${r} key: ${Array.from(rKey.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join("")}...`);
				visualizer.updateMatrix(rKey);
				await new Promise((resolve) => gsap.delayedCall(400 / speed, resolve));
			}
			setCurrentOperation(`Key expansion complete: ${roundKeys.length} round keys generated`);
		} catch (error) {
			console.error("Key expansion error:", error);
			setCurrentOperation("Key expansion error");
		} finally {
			setIsAnimating(false);
		}
	}, [
		visualizerRef,
		engine,
		isAnimating,
		aesKey,
		speed
	]);
	useEffect(() => {
		if (!engine) return;
		const setupScene = async () => {
			const gridContainer = document.getElementById("aes-grid-container");
			const visualizer = new StateMatrixVisualizer(engine.getApplication(), engine.getApplication().stage, gridContainer ?? void 0);
			visualizer.masterTimeline = engine.masterTimeline;
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
		if (visualizerRef.current) visualizerRef.current.speedMultiplier = speed;
	}, [speed]);
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
			/* @__PURE__ */ jsx(LiveRegion, {
				message: currentOperation,
				prefix: "AES Cipher"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-symmetric-500/10",
					children: /* @__PURE__ */ jsx(Grid3x3, {
						size: 20,
						className: "text-symmetric-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-bold text-symmetric-400",
						children: "AES Cipher"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-1",
						children: /* @__PURE__ */ jsx(StepGuide, { sections: [
							{
								title: "The Digital Blender",
								body: "AES works like a digital blender. Through multiple rounds of shuffling and swapping, it achieves 'Confusion' (hiding the relationship between the key and ciphertext) and 'Diffusion' (spreading the influence of a single plaintext bit across the entire ciphertext)."
							},
							{
								title: "SubBytes",
								body: "Each byte is replaced using a lookup table (S-box). This non-linear substitution is what gives AES its strength against algebraic attacks."
							},
							{
								title: "ShiftRows",
								body: "The rows of the 4x4 state are shifted by different offsets. This diffuses the bytes across columns, creating the avalanche effect where changing one plaintext bit changes many ciphertext bits."
							},
							{
								title: "MixColumns",
								body: "Each column is transformed using linear mixing in GF(2⁸). This combines the four bytes in each column, spreading influence across the entire state."
							},
							{
								title: "AddRoundKey",
								body: "The state is XORed with the round key derived from the key schedule. This ensures the key's influence reaches every byte of the state."
							}
						] })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500",
						children: "Step 3 of 6"
					})
				] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "The plaintext message is encrypted using the AES-256 session key. The AES algorithm operates on a 4x4 state matrix through multiple rounds of substitution and permutation, effectively 'blending' the data until it's indistinguishable from random noise."
			}),
			isPedagogyMode && /* @__PURE__ */ jsx(ConfusionDiffusionLegend, {}),
			/* @__PURE__ */ jsxs("div", {
				id: "aes-grid-container",
				className: "rounded-lg border border-symmetric-500/20 bg-surface-950/40 p-6 relative overflow-hidden",
				children: [
					isPedagogyMode && showPredict && aesPrompt && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 z-20 bg-surface-950/90 backdrop-blur-sm flex items-center justify-center p-4",
						children: /* @__PURE__ */ jsx(PredictPrompt, {
							prompt: aesPrompt,
							onReveal: () => {},
							onDismiss: () => setShowPredict(false)
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mb-4 flex items-center justify-between flex-wrap gap-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-semibold text-white",
							children: "AES State Matrix"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 flex-wrap",
							children: [
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: runAESAnimation,
									disabled: isAnimating || !aesKey,
									className: "flex items-center gap-2 rounded-md bg-symmetric-600 px-4 py-2 text-sm font-medium text-white hover:bg-symmetric-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
									children: [/* @__PURE__ */ jsx(Play, { size: 16 }), isAnimating ? "Animating..." : !aesKey ? "Generate key in Step 2 first" : "Play Animation"]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: runKeyExpansionAnimation,
									disabled: isAnimating || !aesKey,
									className: "flex items-center gap-2 rounded-md bg-hybrid-600 px-4 py-2 text-sm font-medium text-white hover:bg-hybrid-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
									children: [/* @__PURE__ */ jsx(Play, { size: 16 }), "Key Schedule"]
								}),
								(isAnimating || currentOperation) && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => {
										visualizerRef.current?.destroy();
										setCurrentOperation("");
										setAuthTagHex(null);
									},
									className: "flex items-center gap-2 rounded-md bg-surface-700 px-4 py-2 text-sm font-medium text-white hover:bg-surface-600 transition-colors",
									children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), "Reset"]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-full h-64 rounded-lg bg-surface-950/60 border border-symmetric-500/20 flex items-center justify-center",
								children: !currentOperation && !isAnimating && /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col items-center gap-3",
									children: [/* @__PURE__ */ jsx(Grid3x3, {
										size: 24,
										className: "text-surface-600"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-sm text-surface-500 font-medium",
										children: !aesKey ? "Generate a session key in Step 2 first" : "Press Play Animation to visualize AES"
									})]
								})
							}),
							currentOperation && /* @__PURE__ */ jsx("div", {
								className: "mt-3 rounded-md bg-surface-950/80 backdrop-blur-sm px-4 py-3 border border-symmetric-500/10",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-symmetric-400 animate-pulse" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm font-mono text-symmetric-400",
										children: currentOperation
									})]
								})
							}),
							/* @__PURE__ */ jsx(OperationLegend, { currentOperation })
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 grid grid-cols-2 gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700/50 bg-surface-950/20 p-4",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "text-sm font-semibold text-symmetric-400",
							children: "SubBytes"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-surface-500",
							children: "Non-linear substitution using S-box"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700/50 bg-surface-950/20 p-4",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "text-sm font-semibold text-symmetric-400",
							children: "ShiftRows"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-surface-500",
							children: "Cyclic shift of state matrix rows"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700/50 bg-surface-950/20 p-4",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "text-sm font-semibold text-symmetric-400",
							children: "MixColumns"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-surface-500",
							children: "Column mixing via Galois Field multiplication"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700/50 bg-surface-950/20 p-4",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "text-sm font-semibold text-symmetric-400",
							children: "AddRoundKey"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-surface-500",
							children: "XOR operation with round key"
						})]
					})
				]
			}),
			authTagHex && /* @__PURE__ */ jsxs("div", {
				className: "mt-4 rounded-lg border border-cyan-700/50 bg-cyan-950/20 p-4",
				children: [
					/* @__PURE__ */ jsx("h4", {
						className: "text-sm font-semibold text-cyan-400",
						children: "GCM Auth Tag"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 break-all font-mono text-xs text-cyan-300",
						children: authTagHex
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-xs text-surface-500",
						children: "AES operates in GCM mode: this 16-byte authentication tag is computed alongside encryption using GHASH (Galois field multiplication). It guarantees integrity — any ciphertext tampering causes the tag to mismatch, and step 6 rejects the decryption. You can test this with \"Simulate Tampered Packet\" in step 6."
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-sm text-surface-500",
				children: "AES-256 uses 14 rounds of substitution-permutation operations for strong encryption."
			})
		]
	});
}
function Step3AESCipher() {
	return /* @__PURE__ */ jsx(AESCipherContent, {});
}
//#endregion
export { Step3AESCipher as component };
