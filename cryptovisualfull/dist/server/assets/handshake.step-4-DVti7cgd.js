import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { t as StepGuide } from "./StepGuide-CNGcpcGz.js";
import { n as useWizard, o as usePedagogyMode } from "./wizard-provider-pbkfxoqq.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Combine, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
//#region src/shared/components/pedagogy/EnvelopeWithTooltip.tsx
function EnvelopeWithTooltip({ wrappedKeyHex }) {
	const [isHovered, setIsHovered] = useState(false);
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: "relative w-full text-left",
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
		onFocus: () => setIsHovered(true),
		onBlur: () => setIsHovered(false),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 rounded bg-surface-800 p-3 transition-colors hover:bg-surface-700",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-lg bg-hybrid-500/20",
					children: /* @__PURE__ */ jsx(Mail, {
						size: 16,
						className: "text-hybrid-400"
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs text-surface-500",
						children: "Wrapped Key"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-hybrid-300 font-mono truncate max-w-[300px]",
						children: wrappedKeyHex ?? "0xB8 0x2A 0xF4 0x1C 0x9D 0xE3 ..."
					})]
				}),
				/* @__PURE__ */ jsx(motion.div, {
					animate: { rotate: isHovered ? 10 : 0 },
					transition: { duration: .2 },
					className: "text-hybrid-400",
					children: /* @__PURE__ */ jsx(Mail, { size: 20 })
				})
			]
		}), isHovered && /* @__PURE__ */ jsx(motion.div, {
			initial: {
				opacity: 0,
				y: 4,
				scale: .96
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: 4,
				scale: .96
			},
			transition: { duration: .15 },
			className: "absolute -top-2 left-1/2 z-20 w-64 -translate-x-1/2 -translate-y-full",
			children: /* @__PURE__ */ jsx("div", {
				className: "rounded-lg border border-surface-600 bg-surface-800 p-3 shadow-xl",
				children: /* @__PURE__ */ jsxs("p", {
					className: "text-xs text-surface-300 leading-relaxed",
					children: [
						"The AES session key is encrypted with the RSA public key and placed inside this",
						" ",
						/* @__PURE__ */ jsx("strong", {
							className: "text-hybrid-400",
							children: "digital envelope"
						}),
						". Only the holder of the corresponding RSA private key can open it."
					]
				})
			})
		})]
	});
}
//#endregion
//#region src/shared/components/pedagogy/KEMEnvelopeAnimation.tsx
function KEMEnvelopeAnimation() {
	const { aesKey, rsaKeyPair, wrappedSessionKey } = useWizard();
	const [phase, setPhase] = useState("idle");
	if (!aesKey || !rsaKeyPair || !wrappedSessionKey) return null;
	const handleSeal = () => {
		setPhase("sealing");
		setTimeout(() => setPhase("sealed"), 1200);
	};
	const aesKeyPreview = Array.from(aesKey.keyBytes.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join(" ");
	const wrapRatio = wrappedSessionKey.data.length / aesKey.keyBytes.length;
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
		className: "mb-6 rounded-lg border border-hybrid-500/30 bg-surface-900 p-4",
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "mb-3 text-sm font-semibold text-hybrid-400 uppercase tracking-wide",
				children: "Key Encapsulation Mechanism (KEM)"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-center gap-6 py-4",
				children: [
					/* @__PURE__ */ jsxs(motion.div, {
						animate: phase === "sealing" ? {
							scale: .8,
							opacity: .5,
							x: 40
						} : phase === "sealed" ? {
							opacity: .3,
							scale: .6
						} : {},
						transition: { duration: .6 },
						className: "flex flex-col items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "flex h-12 w-12 items-center justify-center rounded-lg bg-symmetric-500/20",
								children: /* @__PURE__ */ jsx(KeyRound, {
									size: 22,
									className: "text-symmetric-400"
								})
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[10px] font-mono text-symmetric-400",
								children: [aesKeyPreview, "..."]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[10px] text-surface-500",
								children: "AES Key"
							})
						]
					}),
					/* @__PURE__ */ jsx(motion.div, {
						animate: phase === "sealing" ? { rotate: 180 } : {},
						transition: { duration: .4 },
						className: "text-surface-600",
						children: /* @__PURE__ */ jsx(Lock, { size: 20 })
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						animate: phase === "sealed" ? {
							scale: [
								1,
								1.15,
								1
							],
							transition: { duration: .5 }
						} : {},
						className: "relative flex flex-col items-center gap-2",
						children: [/* @__PURE__ */ jsxs(motion.div, {
							animate: phase === "sealing" ? {
								y: [
									0,
									-4,
									0
								],
								transition: {
									repeat: Infinity,
									duration: .4
								}
							} : {},
							className: "flex h-14 w-14 items-center justify-center rounded-xl bg-hybrid-500/20",
							children: [/* @__PURE__ */ jsx(Mail, {
								size: 26,
								className: "text-hybrid-400"
							}), phase === "sealed" && /* @__PURE__ */ jsx(motion.div, {
								initial: { scale: 0 },
								animate: { scale: 1 },
								transition: {
									type: "spring",
									stiffness: 300
								},
								className: "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-asymmetric-500",
								children: /* @__PURE__ */ jsx(Lock, {
									size: 10,
									className: "text-white"
								})
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] text-surface-500",
							children: phase === "sealed" ? "Sealed Envelope" : "Digital Envelope"
						})]
					})
				]
			}),
			phase === "idle" && /* @__PURE__ */ jsx("div", {
				className: "flex justify-center",
				children: /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: handleSeal,
					className: "rounded-md bg-hybrid-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-hybrid-500 transition-colors",
					children: "Seal Envelope with RSA"
				})
			}),
			phase === "sealing" && /* @__PURE__ */ jsxs(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				className: "flex flex-col items-center gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-xs text-hybrid-400 font-mono",
					children: [/* @__PURE__ */ jsx("span", { children: "RSA-OAEP" }), /* @__PURE__ */ jsx("span", {
						className: "text-surface-600",
						children: "encapsulating..."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "h-1.5 w-48 overflow-hidden rounded-full bg-surface-800",
					children: /* @__PURE__ */ jsx(motion.div, {
						className: "h-full rounded-full bg-hybrid-500",
						initial: { width: "0%" },
						animate: { width: "100%" },
						transition: {
							duration: 1.2,
							ease: "easeInOut"
						}
					})
				})]
			}),
			phase === "sealed" && /* @__PURE__ */ jsxs(motion.div, {
				initial: {
					opacity: 0,
					y: 6
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { delay: .2 },
				className: "space-y-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-center gap-4 text-xs text-surface-400",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						"AES key size:",
						" ",
						/* @__PURE__ */ jsxs("span", {
							className: "font-mono text-symmetric-400",
							children: [aesKey.keyBytes.length * 8, " bits"]
						})
					] }), /* @__PURE__ */ jsxs("span", { children: [
						"Wrapped size:",
						" ",
						/* @__PURE__ */ jsxs("span", {
							className: "font-mono text-hybrid-400",
							children: [wrappedSessionKey.data.length * 8, " bits"]
						})
					] })]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-[10px] text-surface-600 text-center",
					children: [
						"RSA-OAEP expands the key from ",
						aesKey.keyBytes.length,
						"B to",
						" ",
						wrappedSessionKey.data.length,
						"B (",
						wrapRatio.toFixed(1),
						"x overhead). This is the price of asymmetric encryption."
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/routes/handshake.step-4.tsx?tsr-split=component
function Step4HybridEnvelope() {
	const { aesKey, rsaKeyPair, wrappedSessionKey, plaintext, send } = useWizard();
	const worker = useCryptoWorker();
	const { isPedagogyMode } = usePedagogyMode();
	const [isWrapping, setIsWrapping] = useState(false);
	const [wrapDuration, setWrapDuration] = useState();
	const hexToUint8Array = (hex) => {
		const match = hex.match(/.{1,2}/g);
		return new Uint8Array(match ? match.map((byte) => parseInt(byte, 16)) : []);
	};
	useEffect(() => {
		if (!aesKey || !rsaKeyPair || !worker || wrappedSessionKey || isWrapping) return;
		const doWrap = async () => {
			setIsWrapping(true);
			try {
				const keyHex = Array.from(aesKey.keyBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
				const result = await worker.encryptRSA(rsaKeyPair.publicKey, keyHex);
				const data = hexToUint8Array(result.encryptedData);
				setWrapDuration(result.durationMs);
				send({
					type: "SET_WRAPPED_KEY",
					wrappedKey: {
						data,
						durationMs: result.durationMs
					}
				});
				const messageText = plaintext;
				const aesKeyHex = keyHex;
				const aesResult = await worker.encryptAES(aesKeyHex, messageText);
				send({
					type: "SET_CIPHERTEXT",
					ciphertext: {
						data: hexToUint8Array(aesResult.ciphertext),
						iv: hexToUint8Array(aesResult.iv),
						authTag: aesResult.authTag ? hexToUint8Array(aesResult.authTag) : void 0,
						durationMs: aesResult.durationMs
					}
				});
			} catch (error) {
				console.error("Hybrid envelope wrapping failed:", error);
			} finally {
				setIsWrapping(false);
			}
		};
		doWrap();
	}, [
		aesKey,
		rsaKeyPair,
		worker,
		wrappedSessionKey,
		send,
		isWrapping
	]);
	const wrappedHex = wrappedSessionKey?.data && Array.from(wrappedSessionKey.data.slice(0, 6)).map((b) => `0x${b.toString(16).padStart(2, "0").toUpperCase()}`).join(" ");
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
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-hybrid-500/10",
					children: /* @__PURE__ */ jsx(Combine, {
						size: 20,
						className: "text-hybrid-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-bold text-hybrid-400",
						children: "Hybrid Envelope"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-1",
						children: /* @__PURE__ */ jsx(StepGuide, { sections: [
							{
								title: "The Hybrid Advantage",
								body: "Why not use RSA for everything? Because RSA is computationally expensive and slow for large files. We use a 'Hybrid' approach: RSA encrypts the AES key, while AES handles the bulk data. This gives us the best of both worlds: security and performance."
							},
							{
								title: "The Digital Envelope",
								body: "Imagine the ciphertext as a secure \"Box\" and the RSA-encrypted session key as the \"Envelope\" taped to the top. The recipient uses their Private Key to open the envelope, finds the AES key, and uses it to unlock the box."
							},
							{
								title: "RSA-OAEP vs Signing",
								body: "This step uses RSA-OAEP (Optimal Asymmetric Encryption Padding) to encrypt the AES key — a 'key encapsulation' mechanism. RSA can also sign messages (prove authorship) using RSASSA-PKCS1-v1_5, which is mathematically distinct: encryption uses the public key to hide data, signing uses the private key to create a verifiable tag. Many protocols use both: encrypt with OAEP, sign with PSS."
							}
						] })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500",
						children: "Step 4 of 6"
					})
				] })]
			}),
			isWrapping && /* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3 rounded-lg border border-hybrid-500/30 bg-surface-950/60 backdrop-blur-sm p-4",
				children: [/* @__PURE__ */ jsx(Loader2, {
					size: 18,
					className: "animate-spin text-hybrid-400"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-sm text-surface-300",
					children: "Wrapping AES session key with RSA-2048..."
				})]
			}),
			isPedagogyMode && wrappedSessionKey && /* @__PURE__ */ jsx(KEMEnvelopeAnimation, {}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "The AES session key is now wrapped using the RSA public key. This creates a secure digital envelope, combining the speed of AES for the bulk payload with the mathematical security of RSA for the key exchange."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-3 font-semibold text-white",
					children: "Digital Envelope"
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [isPedagogyMode ? /* @__PURE__ */ jsx(EnvelopeWithTooltip, { wrappedKeyHex: wrappedHex }) : /* @__PURE__ */ jsxs("div", {
						className: "rounded bg-surface-800/60 p-3",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-surface-500",
								children: "Wrapped Key (RSA Encrypted)"
							}),
							/* @__PURE__ */ jsx("pre", {
								className: "mt-1 text-sm text-hybrid-300 font-mono truncate",
								children: wrappedHex || "0xB8 0x2A 0xF4 0x1C 0x9D 0xE3 ..."
							}),
							wrapDuration != null && /* @__PURE__ */ jsxs("span", {
								className: "mt-1 block text-[10px] text-surface-600 font-mono",
								children: [
									"RSA wrap: ",
									wrapDuration.toFixed(1),
									"ms"
								]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "rounded bg-surface-800/60 p-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-surface-500",
							children: "AES-Encrypted Payload (The Box)"
						}), /* @__PURE__ */ jsx("pre", {
							className: "mt-1 text-sm text-symmetric-300 font-mono truncate",
							children: "0x7E 0x1B 0xA3 0xCC 0x59 0xF8 ..."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-sm text-surface-500",
				children: "The envelope contains both the wrapped key and the encrypted message, ensuring only the owner of the corresponding RSA private key can open it."
			})
		]
	});
}
//#endregion
export { Step4HybridEnvelope as component };
