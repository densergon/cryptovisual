import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { n as PredictPrompt, t as PREDICT_PROMPTS } from "./predict-prompts-BZyozWGc.js";
import { t as StepGuide } from "./StepGuide-CNGcpcGz.js";
import { n as useCanvas } from "./CanvasProvider-aqhBXwm5.js";
import { n as useWizard, o as usePedagogyMode } from "./wizard-provider-pbkfxoqq.js";
import { n as BitStreamVisualizer } from "./scenes-BztwBKKR.js";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { KeyRound } from "lucide-react";
import { motion } from "motion/react";
//#region src/shared/components/pedagogy/PerformanceComparison.tsx
function PerformanceComparison({ rsaDurationMs, aesDurationMs }) {
	if (rsaDurationMs == null && aesDurationMs == null) return null;
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
		className: "mb-6 rounded-lg border border-symmetric-500/30 bg-surface-900 p-4",
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "mb-3 text-sm font-semibold text-symmetric-400 uppercase tracking-wide",
				children: "Performance: AES vs RSA"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-3",
				children: [rsaDurationMs != null && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-1 flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-asymmetric-400 font-mono",
						children: "RSA-2048 Keygen"
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-surface-400 font-mono",
						children: [rsaDurationMs.toFixed(1), "ms"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "h-3 w-full overflow-hidden rounded-full bg-surface-800",
					children: /* @__PURE__ */ jsx(motion.div, {
						className: "h-full rounded-full bg-asymmetric-500",
						initial: { width: "0%" },
						animate: { width: `${Math.min(rsaDurationMs / 500 * 100, 100)}%` },
						transition: {
							duration: .8,
							ease: "easeOut"
						}
					})
				})] }), aesDurationMs != null && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-1 flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-symmetric-400 font-mono",
						children: "AES-256 Keygen"
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-surface-400 font-mono",
						children: [aesDurationMs.toFixed(1), "ms"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "h-3 w-full overflow-hidden rounded-full bg-surface-800",
					children: /* @__PURE__ */ jsx(motion.div, {
						className: "h-full rounded-full bg-symmetric-500",
						initial: { width: "0%" },
						animate: { width: `${Math.min(aesDurationMs / 500 * 100, 100)}%` },
						transition: {
							duration: .8,
							ease: "easeOut"
						}
					})
				})] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-[10px] text-surface-600 italic",
				children: "AES key generation is orders of magnitude faster than RSA. This is why hybrid encryption uses RSA only for key exchange."
			})
		]
	});
}
//#endregion
//#region src/shared/components/pedagogy/WhyAESBox.tsx
function WhyAESBox() {
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
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "mb-2 text-sm font-semibold text-symmetric-400 uppercase tracking-wide",
				children: "Why AES?"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-2 text-xs text-surface-400 leading-relaxed",
				children: "RSA is like a bank vault — incredibly secure, but slow and bulky for everyday use. AES is like a house key — fast, lightweight, but both parties need a copy."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 text-xs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded bg-surface-800 p-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-asymmetric-400",
						children: "RSA"
					}), /* @__PURE__ */ jsxs("ul", {
						className: "mt-1 list-inside list-disc text-surface-500 space-y-0.5",
						children: [
							/* @__PURE__ */ jsx("li", { children: "Slow (100-1000x slower than AES)" }),
							/* @__PURE__ */ jsx("li", { children: "Encrypts small data only (key size limit)" }),
							/* @__PURE__ */ jsx("li", { children: "Asymmetric — different keys for enc/dec" })
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded bg-surface-800 p-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-symmetric-400",
						children: "AES"
					}), /* @__PURE__ */ jsxs("ul", {
						className: "mt-1 list-inside list-disc text-surface-500 space-y-0.5",
						children: [
							/* @__PURE__ */ jsx("li", { children: "Fast (hardware-accelerated on most CPUs)" }),
							/* @__PURE__ */ jsx("li", { children: "Encrypts arbitrarily large data" }),
							/* @__PURE__ */ jsx("li", { children: "Symmetric — same key for enc/dec" })
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-[10px] text-surface-600 italic",
				children: "Hybrid encryption uses RSA to safely deliver the AES key, then AES for the actual data — the best of both worlds."
			})
		]
	});
}
//#endregion
//#region src/routes/handshake.step-2.tsx?tsr-split=component
function Step2SessionKey() {
	const { engine } = useCanvas();
	const worker = useCryptoWorker();
	const bitStreamSceneRef = useRef(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [keyDuration, setKeyDuration] = useState();
	const { goNext, aesKey, rsaKeyPair, plaintext, send } = useWizard();
	const { isPedagogyMode } = usePedagogyMode();
	const arrayToHex = (arr) => Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
	const hexToUint8Array = (hex) => {
		const match = hex.match(/.{1,2}/g);
		return new Uint8Array(match ? match.map((byte) => parseInt(byte, 16)) : []);
	};
	const [showPredict, setShowPredict] = useState(true);
	const sessionPrompt = PREDICT_PROMPTS.find((p) => p.step === 2);
	const [error, setError] = useState(null);
	const [keyData, setKeyData] = useState(() => {
		if (aesKey) return {
			keyBytes: arrayToHex(aesKey.keyBytes),
			iv: arrayToHex(aesKey.iv),
			durationMs: aesKey.durationMs
		};
		return null;
	});
	useEffect(() => {
		if (!engine) return;
		const setupScene = async () => {
			const bitStreamScene = new BitStreamVisualizer(engine.getApplication(), engine.getApplication().stage);
			bitStreamScene.masterTimeline = engine.masterTimeline;
			await bitStreamScene.init();
			bitStreamSceneRef.current = bitStreamScene;
		};
		setupScene();
		return () => {
			bitStreamSceneRef.current?.destroy();
			bitStreamSceneRef.current = null;
		};
	}, [engine]);
	const handleGenerateKey = async () => {
		setIsGenerating(true);
		setError(null);
		try {
			if (!worker) throw new Error("Crypto worker not ready");
			const result = await worker.generateAESKey(256);
			if (!result.keyBytes || !result.iv) throw new Error("Key generation failed");
			setKeyData(result);
			setKeyDuration(result.durationMs);
			send({
				type: "SET_AES_KEY",
				key: {
					keyBytes: hexToUint8Array(result.keyBytes),
					iv: hexToUint8Array(result.iv),
					durationMs: result.durationMs ?? 0
				}
			});
			if (bitStreamSceneRef.current) bitStreamSceneRef.current.play();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Session key generation failed");
			console.error("AES key generation failed:", err);
		} finally {
			setIsGenerating(false);
		}
	};
	const formatKeyBytes = (hex) => {
		return (hex.match(/.{1,2}/g) || []).map((b, i) => i % 8 === 0 ? `\n0x${b}` : `0x${b}`).join(" ");
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
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-symmetric-500/10",
					children: /* @__PURE__ */ jsx(KeyRound, {
						size: 20,
						className: "text-symmetric-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-bold text-symmetric-400",
						children: "Session Key"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-1",
						children: /* @__PURE__ */ jsx(StepGuide, { sections: [
							{
								title: "The Hybrid Secret",
								body: "Why not use RSA for everything? Because RSA is computationally expensive and slow for large files. We use a 'Hybrid' approach: AES for the heavy lifting (bulk encryption) and RSA only to protect the AES key itself."
							},
							{
								title: "AES Symmetric Encryption",
								body: "AES is a symmetric cipher — the same key encrypts and decrypts. It's incredibly fast and efficient, making it the gold standard for securing the actual content of your messages."
							},
							{
								title: "Why an IV?",
								body: "The initialization vector (IV) ensures that encrypting the same message twice produces different ciphertext. It prevents attackers from detecting patterns. The IV is not secret but must be unique per encryption."
							}
						] })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500",
						children: "Step 2 of 6"
					})
				] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "Since RSA is too slow for large amounts of data, we generate a temporary AES-256 session key. This symmetric key handles the bulk encryption with incredible speed, while the RSA keys from Step 1 will be used only to securely transport this session key."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ jsx("label", {
					htmlFor: "plaintext-input",
					className: "mb-1.5 block text-xs font-medium text-surface-400",
					children: "Your Message"
				}), /* @__PURE__ */ jsx("input", {
					id: "plaintext-input",
					type: "text",
					value: plaintext,
					maxLength: 256,
					onChange: (e) => send({
						type: "SET_PLAINTEXT",
						plaintext: e.target.value
					}),
					className: "w-full max-w-md rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-surface-200 placeholder-surface-600 focus:border-symmetric-500 focus:outline-none focus:ring-1 focus:ring-symmetric-500 transition-colors",
					placeholder: "Type your message here..."
				})]
			}),
			error && /* @__PURE__ */ jsx("div", {
				className: "mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400",
				children: error
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 rounded-lg border border-symmetric-500/20 bg-surface-950/40 min-h-64 relative overflow-hidden",
				children: [
					isPedagogyMode && showPredict && sessionPrompt && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 z-20 bg-surface-950/90 backdrop-blur-sm flex items-center justify-center p-4",
						children: /* @__PURE__ */ jsx(PredictPrompt, {
							prompt: sessionPrompt,
							onReveal: () => {},
							onDismiss: () => setShowPredict(false)
						})
					}),
					!isGenerating && !keyData && !showPredict && /* @__PURE__ */ jsxs("div", {
						className: "absolute inset-0 flex items-center justify-center flex-col gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "h-12 w-12 rounded-full border-2 border-dashed border-surface-700 flex items-center justify-center",
							children: /* @__PURE__ */ jsx(KeyRound, {
								size: 20,
								className: "text-surface-600"
							})
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-surface-500 font-medium",
							children: "Click \"Generate Session Key\" to start the animation"
						})]
					}),
					isGenerating && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 flex items-center justify-center",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 rounded-lg bg-surface-950/80 px-4 py-2",
							children: [/* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-symmetric-400 animate-pulse" }), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-surface-400 font-mono",
								children: "Generating 256-bit session key..."
							})]
						})
					})
				]
			}),
			isPedagogyMode && /* @__PURE__ */ jsx(WhyAESBox, {}),
			/* @__PURE__ */ jsx(PerformanceComparison, {
				rsaDurationMs: rsaKeyPair?.durationMs,
				aesDurationMs: keyDuration
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex gap-3",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					id: "aes-button",
					onClick: handleGenerateKey,
					disabled: isGenerating,
					className: "rounded-lg bg-symmetric-600 px-6 py-2.5 font-medium text-white hover:bg-symmetric-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
					children: isGenerating ? "Generating 256-bit session key..." : "Generate Session Key"
				}), keyData && /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: goNext,
					className: "rounded-lg bg-surface-700 px-6 py-2.5 font-medium text-white hover:bg-surface-600 transition-colors",
					children: "Continue"
				})]
			}),
			keyData && /* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-3 font-semibold text-white",
					children: "AES-256 Session Key Generated"
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded bg-surface-800/60 p-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500",
								children: "Session Key"
							}), /* @__PURE__ */ jsx("pre", {
								className: "mt-1 text-xs text-symmetric-300 font-mono break-all",
								children: formatKeyBytes(keyData.keyBytes)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded bg-surface-800/60 p-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500",
								children: "Initialization Vector (IV)"
							}), /* @__PURE__ */ jsx("pre", {
								className: "mt-1 text-xs text-symmetric-300 font-mono",
								children: keyData.iv
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-xs text-surface-500",
							children: [
								"Generation Time: ",
								keyData.durationMs?.toFixed(2),
								"ms"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-sm text-surface-500",
				children: "AES-256 provides a 256-bit key space — 2²⁵⁶ possible combinations, which is currently infeasible to brute force."
			})
		]
	});
}
//#endregion
export { Step2SessionKey as component };
