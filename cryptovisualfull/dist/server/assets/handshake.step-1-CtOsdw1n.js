import { r as BruteForceWorkerClient } from "./crypto-engine-CSsLj5MI.js";
import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { n as PredictPrompt, t as PREDICT_PROMPTS } from "./predict-prompts-BZyozWGc.js";
import { t as StepGuide } from "./StepGuide-CNGcpcGz.js";
import { n as useCanvas } from "./CanvasProvider-aqhBXwm5.js";
import { n as useWizard, o as usePedagogyMode } from "./wizard-provider-pbkfxoqq.js";
import { t as KeygenVisualizer } from "./scenes-BztwBKKR.js";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Key, Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";
//#region src/features/keygen/components/BruteForcePanel.tsx
function generateChallenge() {
	const isPrime = (n) => {
		if (n < 2) return false;
		for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
		return true;
	};
	const randomPrime = (bits) => {
		const min = 1 << bits - 1;
		const max = (1 << bits) - 1;
		while (true) {
			const n = min + Math.floor(Math.random() * (max - min));
			if (isPrime(n)) return n;
		}
	};
	const p = randomPrime(8);
	let q;
	do
		q = randomPrime(8);
	while (q === p);
	return {
		p,
		q,
		modulus: p * q
	};
}
function BruteForcePanel({ onComplete }) {
	const [isRunning, setIsRunning] = useState(false);
	const [current, setCurrent] = useState(0);
	const [max, setMax] = useState(0);
	const [foundFactor, setFoundFactor] = useState(null);
	const [durationMs, setDurationMs] = useState(null);
	const [iterations, setIterations] = useState(0);
	const [modulus, setModulus] = useState(null);
	const clientRef = useRef(null);
	const progress = max > 0 ? Math.min(current / max * 100, 100) : 0;
	const startBruteForce = async () => {
		const { modulus: mod } = generateChallenge();
		setModulus(mod);
		setFoundFactor(null);
		setDurationMs(null);
		setIterations(0);
		setCurrent(0);
		setIsRunning(true);
		const client = new BruteForceWorkerClient();
		clientRef.current = client;
		try {
			const result = await client.startBruteForce(mod, (progress) => {
				setCurrent(progress.current);
				setMax(progress.max);
				if (progress.found && progress.p && progress.q) setFoundFactor({
					p: progress.p,
					q: progress.q
				});
			});
			setIterations(result.iterations);
			setDurationMs(result.durationMs);
			onComplete?.(result.p, result.q, result.durationMs);
		} catch (error) {
			console.error("Brute-force failed:", error);
		} finally {
			setIsRunning(false);
		}
	};
	useEffect(() => {
		return () => {
			clientRef.current?.terminate();
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-6 rounded-lg border border-red-500/30 bg-surface-950/60 p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-1 flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-red-400",
					children: "Break Me!"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-[10px] text-surface-500",
					children: "See how small keys can be cracked in seconds"
				})]
			}),
			!isRunning && !foundFactor && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: startBruteForce,
				className: "rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600",
				children: "Run Brute-Force Attack"
			}),
			isRunning && /* @__PURE__ */ jsxs("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-red-400 animate-pulse" }), /* @__PURE__ */ jsxs("span", {
							className: "text-xs font-mono text-red-400",
							children: [
								"Cracking modulus ",
								modulus,
								"..."
							]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "h-2 w-full overflow-hidden rounded-full bg-surface-800",
						children: /* @__PURE__ */ jsx(motion.div, {
							className: "h-full rounded-full bg-red-500",
							initial: { width: "0%" },
							animate: { width: `${progress}%` },
							transition: { duration: .1 }
						})
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-[10px] text-surface-500 font-mono",
						children: [
							"Trying factor ",
							current.toLocaleString(),
							" of ",
							max.toLocaleString()
						]
					})
				]
			}),
			foundFactor && /* @__PURE__ */ jsxs("div", {
				className: "mt-3 space-y-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/30",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs font-bold text-red-400",
						children: "Cracked! Private key discovered"
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-2 font-mono text-xs text-surface-300",
						children: [/* @__PURE__ */ jsxs("p", { children: [
							"Modulus ",
							modulus,
							" = ",
							foundFactor.p,
							" × ",
							foundFactor.q
						] }), /* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-surface-500",
							children: [
								"Iterations: ",
								iterations.toLocaleString(),
								" | Time:",
								" ",
								durationMs?.toFixed(1),
								"ms"
							]
						})]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "rounded-lg bg-hybrid-500/10 p-3 ring-1 ring-hybrid-500/30",
					children: /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-hybrid-300",
						children: [
							"This is why 2048-bit keys matter. A 16-bit modulus has only ~",
							Math.floor(Math.sqrt(65535)).toLocaleString(),
							" possible factors to check. A 2048-bit modulus has roughly",
							" ",
							(10 ** 308).toExponential(0),
							" possibilities — more than the atoms in the observable universe."
						]
					})
				})]
			})
		]
	});
}
//#endregion
//#region src/shared/components/pedagogy/PadlockMetaphor.tsx
function PadlockMetaphor() {
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
		className: "mb-6 rounded-lg border border-asymmetric-500/30 bg-asymmetric-500/5 p-4",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "mb-3 text-sm font-semibold text-asymmetric-400 uppercase tracking-wide",
			children: "The Padlock Metaphor"
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center gap-2",
					children: [/* @__PURE__ */ jsx(Unlock, {
						size: 32,
						className: "text-asymmetric-400"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[10px] text-asymmetric-500 font-mono",
						children: "Public Key"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center gap-2",
					children: [/* @__PURE__ */ jsx(Lock, {
						size: 32,
						className: "text-asymmetric-300"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[10px] text-asymmetric-500 font-mono",
						children: "Private Key"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex-1 text-xs text-surface-400 leading-relaxed",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"Think of your",
						" ",
						/* @__PURE__ */ jsx("strong", {
							className: "text-asymmetric-400",
							children: "Public Key"
						}),
						" as an open padlock — you can hand it out to anyone. They snap it shut to encrypt a message, but only you have the",
						" ",
						/* @__PURE__ */ jsx("strong", {
							className: "text-asymmetric-300",
							children: "Private Key"
						}),
						" to open it."
					] })
				})
			]
		})]
	});
}
//#endregion
//#region src/shared/components/pedagogy/PrimeSearchTicker.tsx
var MOCK_PRIMES = [
	"2",
	"3",
	"5",
	"7",
	"11",
	"13",
	"17",
	"19",
	"23",
	"29",
	"31",
	"37",
	"41",
	"43",
	"47",
	"53",
	"59",
	"61",
	"67",
	"71",
	"73",
	"79",
	"83",
	"89",
	"97",
	"101",
	"103",
	"107",
	"109",
	"113",
	"127",
	"131",
	"137",
	"139",
	"149",
	"151",
	"157",
	"163",
	"167",
	"173",
	"179",
	"181",
	"191",
	"193",
	"197",
	"199",
	"211",
	"223",
	"227",
	"229",
	"233",
	"239",
	"241",
	"251",
	"257",
	"263",
	"269",
	"271",
	"277",
	"281",
	"283",
	"293",
	"307",
	"311",
	"313",
	"317",
	"331",
	"337",
	"347",
	"349",
	"353",
	"359",
	"367",
	"373",
	"379",
	"383",
	"389",
	"397",
	"401",
	"409",
	"419",
	"421",
	"431",
	"433",
	"439",
	"443",
	"449",
	"457",
	"461",
	"463",
	"467",
	"479",
	"487",
	"491",
	"499",
	"503",
	"509",
	"521",
	"523",
	"541",
	"547",
	"557",
	"563",
	"569",
	"571",
	"577",
	"587",
	"593",
	"599",
	"601",
	"607",
	"613",
	"617",
	"619",
	"631",
	"641",
	"643",
	"647",
	"653",
	"659",
	"661",
	"673",
	"677",
	"683",
	"691"
];
function PrimeSearchTicker({ isGenerating }) {
	const [displayIndex, setDisplayIndex] = useState(0);
	useEffect(() => {
		if (!isGenerating) {
			setDisplayIndex(0);
			return;
		}
		const interval = setInterval(() => {
			setDisplayIndex((prev) => (prev + 1) % MOCK_PRIMES.length);
		}, 120);
		return () => clearInterval(interval);
	}, [isGenerating]);
	if (!isGenerating) return null;
	const current = MOCK_PRIMES[displayIndex];
	return /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			height: 0
		},
		animate: {
			opacity: 1,
			height: "auto"
		},
		exit: {
			opacity: 0,
			height: 0
		},
		className: "mb-4 overflow-hidden",
		children: /* @__PURE__ */ jsxs("div", {
			className: "rounded-lg border border-asymmetric-500/20 bg-surface-900 p-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-xs text-surface-500 font-mono shrink-0",
							children: "Testing prime:"
						}),
						/* @__PURE__ */ jsx(motion.span, {
							initial: {
								opacity: 0,
								y: -4
							},
							animate: {
								opacity: 1,
								y: 0
							},
							className: "text-sm font-mono text-asymmetric-400",
							children: current
						}, current),
						/* @__PURE__ */ jsx("span", {
							className: "text-[10px] text-surface-600 font-mono ml-auto",
							children: "Miller–Rabin primality test"
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-800",
					children: /* @__PURE__ */ jsx(motion.div, {
						className: "h-full rounded-full bg-asymmetric-500",
						initial: { width: "0%" },
						animate: { width: `${(displayIndex + 1) / MOCK_PRIMES.length * 100}%` },
						transition: { duration: .3 }
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-[10px] text-surface-600",
					children: "RSA-2048 picks two large primes (~308 digits each). The product of these primes forms the modulus of your public key."
				})
			]
		})
	});
}
//#endregion
//#region src/routes/handshake.step-1.tsx?tsr-split=component
function Step1Keygen() {
	const { engine } = useCanvas();
	const worker = useCryptoWorker();
	const keygenSceneRef = useRef(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [keySize, setKeySize] = useState(2048);
	const [showBruteForce, setShowBruteForce] = useState(false);
	const { goNext, rsaKeyPair, send } = useWizard();
	const { isPedagogyMode } = usePedagogyMode();
	const [showPredict, setShowPredict] = useState(true);
	const keygenPrompt = PREDICT_PROMPTS.find((p) => p.step === 1);
	const [error, setError] = useState(null);
	const [keyData, setKeyData] = useState(rsaKeyPair);
	useEffect(() => {
		if (!engine) return;
		const setupScene = async () => {
			const keygenScene = new KeygenVisualizer(engine.getApplication(), engine.getApplication().stage);
			keygenScene.masterTimeline = engine.masterTimeline;
			await keygenScene.init();
			keygenSceneRef.current = keygenScene;
			if (rsaKeyPair) keygenScene.play();
		};
		setupScene();
		return () => {
			keygenSceneRef.current?.destroy();
			keygenSceneRef.current = null;
		};
	}, [engine, rsaKeyPair]);
	const handleGenerateKeys = async () => {
		setIsGenerating(true);
		setError(null);
		try {
			if (!worker) throw new Error("Crypto worker not ready");
			if (keySize === 16) return;
			const result = await worker.generateRSAKeyPair(keySize);
			if (!result.publicKey || !result.privateKey) throw new Error("Key generation failed");
			setKeyData(result);
			send({
				type: "SET_RSA_KEYPAIR",
				keyPair: result
			});
			if (keygenSceneRef.current) keygenSceneRef.current.play();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Key generation failed");
			console.error("Key generation failed:", err);
		} finally {
			setIsGenerating(false);
		}
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
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-asymmetric-500/10",
					children: /* @__PURE__ */ jsx(Key, {
						size: 20,
						className: "text-asymmetric-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-bold text-asymmetric-400",
						children: "Key Generation"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-1",
						children: /* @__PURE__ */ jsx(StepGuide, {
							autoOpen: true,
							sections: [
								{
									title: "The Padlock Metaphor",
									body: "Think of your Public Key as an open padlock. You can hand it out to anyone in the world. They can use it to snap a box shut (encrypt), but only you possess the physical Private Key required to open it (decrypt)."
								},
								{
									title: "The Math Behind the Lock",
									body: "The security of RSA comes from the difficulty of factoring the product of two massive prime numbers. While multiplying them is easy, reversing the process is computationally infeasible for current computers."
								},
								{
									title: "Why 2048 Bits?",
									body: "Larger keys are more secure but slower. 2048 bits is the current industry standard and provides adequate security for most applications. 4096-bit keys are available for higher security needs."
								}
							]
						})
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500",
						children: "Step 1 of 6"
					})
				] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "The secure handshake begins by generating an asymmetric RSA key pair. Think of this as creating your unique identity on the web: a public key that the world uses to send you secret messages, and a private key that you keep guarded to unlock them."
			}),
			isPedagogyMode && showBruteForce && /* @__PURE__ */ jsx(BruteForcePanel, {}),
			!showBruteForce && /* @__PURE__ */ jsxs("div", {
				className: "mb-6 rounded-lg border border-asymmetric-500/20 bg-surface-950/40 min-h-64 relative overflow-hidden",
				children: [
					isPedagogyMode && showPredict && keygenPrompt && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 z-20 bg-surface-950/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto",
						children: /* @__PURE__ */ jsx(PredictPrompt, {
							prompt: keygenPrompt,
							onReveal: () => {},
							onDismiss: () => setShowPredict(false)
						})
					}),
					!isGenerating && !keyData && !showPredict && /* @__PURE__ */ jsxs("div", {
						className: "absolute inset-0 flex items-center justify-center flex-col gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "h-12 w-12 rounded-full border-2 border-dashed border-surface-700 flex items-center justify-center",
							children: /* @__PURE__ */ jsx(Key, {
								size: 20,
								className: "text-surface-600"
							})
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-surface-500 font-medium",
							children: "Click \"Generate Keys\" to start the animation"
						})]
					}),
					isGenerating && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 flex items-center justify-center",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 rounded-lg bg-surface-950/80 px-4 py-2",
							children: [/* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-asymmetric-400 animate-pulse" }), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-surface-400 font-mono",
								children: "Searching for massive prime numbers..."
							})]
						})
					})
				]
			}),
			error && /* @__PURE__ */ jsx("div", {
				className: "mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400",
				children: error
			}),
			isPedagogyMode && /* @__PURE__ */ jsx(PadlockMetaphor, {}),
			isPedagogyMode && /* @__PURE__ */ jsx(PrimeSearchTicker, { isGenerating }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "key-size-select",
							className: "text-xs text-surface-400",
							children: "RSA Key Size:"
						}), /* @__PURE__ */ jsxs("select", {
							id: "key-size-select",
							value: keySize,
							onChange: (e) => {
								const val = Number(e.target.value);
								setKeySize(val);
								setShowBruteForce(val === 16);
							},
							disabled: isGenerating || !!keyData,
							className: "rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-sm text-surface-200 focus:border-asymmetric-500 focus:outline-none focus:ring-1 focus:ring-asymmetric-500 disabled:opacity-50 disabled:cursor-not-allowed",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: 2048,
									children: "2048 bits (standard)"
								}),
								/* @__PURE__ */ jsx("option", {
									value: 4096,
									children: "4096 bits (high security, ~4x slower)"
								}),
								/* @__PURE__ */ jsx("option", {
									value: 16,
									className: "text-red-400",
									children: "16 bits (break me)"
								})
							]
						})]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						id: "keygen-button",
						onClick: handleGenerateKeys,
						disabled: isGenerating,
						className: "rounded-lg bg-asymmetric-600 px-6 py-2.5 font-medium text-white hover:bg-asymmetric-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
						children: isGenerating ? "Searching for massive prime numbers..." : "Generate Keys"
					}),
					keyData && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: goNext,
						className: "rounded-lg bg-surface-700 px-6 py-2.5 font-medium text-white hover:bg-surface-600 transition-colors",
						children: "Continue"
					})
				]
			}),
			keyData && /* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-3 font-semibold text-white",
					children: "RSA Key Pair Generated"
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded bg-surface-800/60 p-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500",
								children: "Public Key"
							}), /* @__PURE__ */ jsx("pre", {
								className: "mt-1 text-xs text-asymmetric-300 font-mono break-all",
								children: JSON.stringify(keyData.publicKey, null, 2)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded bg-surface-800/60 p-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500",
								children: "Private Key (secret)"
							}), /* @__PURE__ */ jsx("pre", {
								className: "mt-1 text-xs text-asymmetric-300 font-mono break-all",
								children: JSON.stringify(keyData.privateKey, null, 2)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-4 text-xs text-surface-500",
							children: [/* @__PURE__ */ jsxs("span", { children: [
								"Key Size: ",
								keyData.keySize,
								" bits"
							] }), /* @__PURE__ */ jsxs("span", { children: [
								"Generation Time: ",
								keyData.durationMs?.toFixed(2),
								"ms"
							] })]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-sm text-surface-500",
				children: "RSA key sizes typically range from 2048 to 4096 bits. Larger keys provide stronger security but slower performance."
			})
		]
	});
}
//#endregion
export { Step1Keygen as component };
