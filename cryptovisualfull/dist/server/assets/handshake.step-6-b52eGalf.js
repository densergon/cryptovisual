import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { n as PredictPrompt, t as PREDICT_PROMPTS } from "./predict-prompts-BZyozWGc.js";
import { t as StepGuide } from "./StepGuide-CNGcpcGz.js";
import { n as useWizard, o as usePedagogyMode } from "./wizard-provider-pbkfxoqq.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, CheckCircle, KeyRound, Loader2, Lock, Unlock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
//#region src/shared/components/Celebration.tsx
function Celebration() {
	const [particles, setParticles] = useState([]);
	const [isActive, setIsActive] = useState(true);
	useEffect(() => {
		const colors = [
			"#4ade80",
			"#facc15",
			"#a855f7",
			"#3b82f6",
			"#ef4444"
		];
		setParticles(Array.from({ length: 100 }).map((_, i) => ({
			id: i,
			x: window.innerWidth / 2,
			y: window.innerHeight * .7,
			color: colors[Math.floor(Math.random() * colors.length)],
			size: Math.random() * 8 + 4,
			vx: (Math.random() - .5) * 15,
			vy: Math.random() * -15 - 10,
			angle: Math.random() * Math.PI * 2
		})));
		const timer = setTimeout(() => setIsActive(false), 5e3);
		return () => clearTimeout(timer);
	}, []);
	return /* @__PURE__ */ jsx(AnimatePresence, { children: isActive && /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 pointer-events-none z-[100] overflow-hidden",
		children: particles.map((p) => /* @__PURE__ */ jsx(motion.div, {
			initial: {
				x: p.x,
				y: p.y,
				opacity: 1,
				rotate: 0
			},
			animate: {
				x: p.x + p.vx * 50,
				y: p.y + p.vy * 50 + 200,
				opacity: 0,
				rotate: p.angle * 360
			},
			transition: {
				duration: 2 + Math.random() * 2,
				ease: "easeOut"
			},
			style: {
				position: "absolute",
				width: p.size,
				height: p.size,
				backgroundColor: p.color,
				borderRadius: "2px"
			}
		}, p.id))
	}) });
}
//#endregion
//#region src/shared/components/pedagogy/KeyMatchGlow.tsx
function KeyMatchGlow() {
	return /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			scale: .9
		},
		animate: {
			opacity: 1,
			scale: 1
		},
		transition: {
			duration: .5,
			ease: "easeOut"
		},
		className: "mb-4",
		children: /* @__PURE__ */ jsxs(motion.div, {
			className: "rounded-lg border-2 border-success/50 bg-success/5 p-4 text-center",
			animate: { boxShadow: [
				"0 0 0px rgba(74, 222, 128, 0)",
				"0 0 20px rgba(74, 222, 128, 0.3)",
				"0 0 0px rgba(74, 222, 128, 0)"
			] },
			transition: {
				duration: 2,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut"
			},
			children: [/* @__PURE__ */ jsxs(motion.div, {
				animate: { scale: [
					1,
					1.05,
					1
				] },
				transition: {
					duration: 1.5,
					repeat: Number.POSITIVE_INFINITY
				},
				className: "flex items-center justify-center gap-2",
				children: [/* @__PURE__ */ jsx(CheckCircle, {
					size: 24,
					className: "text-success"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-sm font-semibold text-success",
					children: "Key Match Verified"
				})]
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-surface-400",
				children: "The decrypted session key matches the original — the handshake is cryptographically intact."
			})]
		})
	});
}
//#endregion
//#region src/shared/components/pedagogy/TwoStepUnlock.tsx
function TwoStepUnlock() {
	const [phase, setPhase] = useState("envelope");
	useEffect(() => {
		const t1 = setTimeout(() => setPhase("decrypt"), 1500);
		const t2 = setTimeout(() => setPhase("done"), 3e3);
		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wide",
			children: "Two-Step Unlock"
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-3",
			children: /* @__PURE__ */ jsxs(AnimatePresence, {
				mode: "wait",
				children: [
					phase === "envelope" && /* @__PURE__ */ jsx(motion.div, {
						initial: {
							opacity: 0,
							x: -20
						},
						animate: {
							opacity: 1,
							x: 0
						},
						exit: {
							opacity: 0,
							x: -20
						},
						transition: { duration: .3 },
						className: "rounded-lg border border-asymmetric-500/30 bg-asymmetric-500/5 p-3",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(Lock, {
								size: 20,
								className: "text-asymmetric-400"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-asymmetric-400",
								children: "1. Unwrap Envelope"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-surface-400",
								children: "RSA private key decrypts the wrapped session key"
							})] })]
						})
					}, "step1"),
					phase === "decrypt" && /* @__PURE__ */ jsx(motion.div, {
						initial: {
							opacity: 0,
							x: -20
						},
						animate: {
							opacity: 1,
							x: 0
						},
						exit: {
							opacity: 0,
							x: -20
						},
						transition: { duration: .3 },
						className: "rounded-lg border border-symmetric-500/30 bg-symmetric-500/5 p-3",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(KeyRound, {
								size: 20,
								className: "text-symmetric-400"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-symmetric-400",
								children: "2. Decrypt Message"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-surface-400",
								children: "Recovered AES session key decrypts the payload"
							})] })]
						})
					}, "step2"),
					phase === "done" && /* @__PURE__ */ jsx(motion.div, {
						initial: {
							opacity: 0,
							scale: .95
						},
						animate: {
							opacity: 1,
							scale: 1
						},
						transition: { duration: .4 },
						className: "rounded-lg border border-success/30 bg-success/5 p-3",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(Unlock, {
								size: 20,
								className: "text-success"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-success",
								children: "3. Integrity Verified"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-surface-400",
								children: "Message authentic and untampered — hybrid handshake complete"
							})] })]
						})
					}, "done")
				]
			})
		})]
	});
}
//#endregion
//#region src/routes/handshake.step-6.tsx?tsr-split=component
function Step6Decrypt() {
	const { rsaKeyPair, wrappedSessionKey, ciphertext, plaintext } = useWizard();
	const worker = useCryptoWorker();
	const { isPedagogyMode } = usePedagogyMode();
	const [isDecrypting, setIsDecrypting] = useState(false);
	const [decryptedText, setDecryptedText] = useState(null);
	const [unwrapDuration, setUnwrapDuration] = useState();
	const [aesDuration, setAesDuration] = useState();
	const [tampered, setTampered] = useState(false);
	const [shouldDecrypt, setShouldDecrypt] = useState(true);
	const [showPredict, setShowPredict] = useState(true);
	const decryptPrompt = PREDICT_PROMPTS.find((p) => p.step === 6);
	const uint8ArrayToHex = (arr) => Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
	useEffect(() => {
		if (!rsaKeyPair || !wrappedSessionKey || !ciphertext || !worker || !shouldDecrypt) return;
		const doDecrypt = async () => {
			setIsDecrypting(true);
			try {
				const wrappedKeyHex = uint8ArrayToHex(wrappedSessionKey.data);
				const unwrapResult = await worker.decryptRSA(rsaKeyPair.privateKey, wrappedKeyHex);
				setUnwrapDuration(unwrapResult.durationMs);
				const authTagHex = ciphertext.authTag ? uint8ArrayToHex(ciphertext.authTag) : void 0;
				let ciphertextHex = uint8ArrayToHex(ciphertext.data);
				if (tampered && ciphertext.data.length > 0) {
					const flipped = new Uint8Array(ciphertext.data);
					flipped[0] ^= 1;
					ciphertextHex = uint8ArrayToHex(flipped);
				}
				const ivHex = uint8ArrayToHex(ciphertext.iv);
				const decryptResult = await worker.decryptAES(unwrapResult.decryptedData, ciphertextHex, ivHex, authTagHex);
				setAesDuration(decryptResult.durationMs);
				setDecryptedText(decryptResult.decryptedData);
			} catch (error) {
				console.error("Decryption failed:", error);
				setDecryptedText("[decryption failed]");
			} finally {
				setIsDecrypting(false);
			}
		};
		doDecrypt();
	}, [
		rsaKeyPair,
		wrappedSessionKey,
		ciphertext,
		worker,
		tampered,
		shouldDecrypt
	]);
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
			decryptedText && !tampered && /* @__PURE__ */ jsx(Celebration, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-asymmetric-500/10",
					children: /* @__PURE__ */ jsx(Unlock, {
						size: 20,
						className: "text-asymmetric-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-bold text-asymmetric-400",
						children: "Decrypt"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-1",
						children: /* @__PURE__ */ jsx(StepGuide, { sections: [{
							title: "Closing the Loop",
							body: "The recipient uses their RSA private key to 'unlock' the digital envelope from Step 4. Once the AES session key is recovered, it is used to decrypt the payload. Because we use authenticated encryption, we can prove the message is authentic and untampered."
						}, {
							title: "Integrity Check",
							body: "Beyond just decryption, the Auth Tag (MAC) is verified. If even a single bit of the ciphertext was changed during transit, the decryption would fail, alerting the recipient to a potential attack."
						}] })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-surface-500",
						children: "Step 6 of 6"
					})
				] })]
			}),
			isDecrypting && /* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3 rounded-lg border border-asymmetric-500/30 bg-surface-950/60 backdrop-blur-sm p-4",
				children: [/* @__PURE__ */ jsx(Loader2, {
					size: 18,
					className: "animate-spin text-asymmetric-400"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-sm text-surface-300",
					children: "Unwrapping envelope and decrypting payload..."
				})]
			}),
			isPedagogyMode && decryptedText && /* @__PURE__ */ jsx(TwoStepUnlock, {}),
			isPedagogyMode && decryptedText && /* @__PURE__ */ jsx(KeyMatchGlow, {}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "The recipient uses their RSA private key to unwrap the digital envelope and recover the AES session key. With the key in hand, the payload is decrypted and the message's integrity is verified."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6 relative overflow-hidden",
				children: [
					isPedagogyMode && showPredict && decryptPrompt && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 z-20 bg-surface-950/90 backdrop-blur-sm flex items-center justify-center p-4",
						children: /* @__PURE__ */ jsx(PredictPrompt, {
							prompt: decryptPrompt,
							onReveal: () => {},
							onDismiss: () => setShowPredict(false)
						})
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "mb-3 font-semibold text-white",
						children: "Decryption Flow"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "rounded bg-surface-800/60 p-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-asymmetric-500",
									children: "1. Unwrap Envelope (RSA)"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-surface-400",
									children: unwrapDuration != null ? `RSA private key decrypted the session key in ${unwrapDuration.toFixed(1)}ms` : "RSA private key decrypts the session key"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "rounded bg-surface-800/60 p-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-symmetric-500",
									children: "2. Decrypt Message (AES)"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-surface-400",
									children: aesDuration != null ? `AES session key decrypted the payload in ${aesDuration.toFixed(1)}ms` : "AES session key decrypts the payload"
								})]
							}),
							/* @__PURE__ */ jsxs(motion.div, {
								initial: decryptedText ? {
									opacity: 0,
									scale: .95
								} : void 0,
								animate: decryptedText ? {
									opacity: 1,
									scale: 1
								} : void 0,
								transition: {
									duration: .3,
									ease: [
										.25,
										.1,
										.25,
										1
									]
								},
								className: `rounded bg-surface-800/60 p-3 ${decryptedText && !tampered ? "ring-1 ring-success/30" : ""}`,
								children: [/* @__PURE__ */ jsx("span", {
									className: `text-xs font-bold ${tampered ? "text-red-400" : "text-success"}`,
									children: isDecrypting ? "Decrypting..." : tampered ? "3. Integrity Check Failed: Message Tampered" : "3. Integrity Verified: Message Authentic"
								}), /* @__PURE__ */ jsx("pre", {
									className: "mt-1 text-sm text-surface-300 font-mono",
									children: isDecrypting ? "Decrypting..." : tampered ? "[decryption rejected — auth tag mismatch]" : decryptedText ?? plaintext
								})]
							})
						]
					})
				]
			}),
			tampered && /* @__PURE__ */ jsxs("div", {
				className: "mt-4 rounded-lg border border-red-500/40 bg-surface-950/60 backdrop-blur-sm p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 mb-2",
					children: [/* @__PURE__ */ jsx(AlertTriangle, {
						size: 18,
						className: "text-red-400"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-sm font-semibold text-red-400",
						children: "Integrity Check Failed"
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-surface-400",
					children: "The ciphertext was altered during transmission. GCM authentication tag verification detected the tampering and rejected the decryption. This demonstrates why authenticated encryption (GCM) is essential over non-authenticated modes like ECB or CBC."
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setDecryptedText(null);
							setUnwrapDuration(void 0);
							setAesDuration(void 0);
							setTampered(false);
							setShouldDecrypt(true);
						},
						className: "rounded-lg bg-symmetric-600 px-6 py-2.5 font-medium text-white hover:bg-symmetric-500 transition-colors text-sm",
						children: "Retry Decryption"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setDecryptedText(null);
							setUnwrapDuration(void 0);
							setAesDuration(void 0);
							setTampered(true);
							setShouldDecrypt(true);
						},
						className: "rounded-lg bg-red-700 px-6 py-2.5 font-medium text-white hover:bg-red-600 transition-colors text-sm",
						children: "Simulate Tampered Packet"
					}),
					decryptedText && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => window.location.href = "/handshake/step-1",
						className: "rounded-lg bg-surface-700 px-6 py-2.5 font-medium text-white hover:bg-surface-600 transition-colors text-sm",
						children: "Start Over"
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-sm text-surface-500",
				children: "The hybrid handshake is complete. The message was encrypted and decrypted securely — never exposed on the wire."
			})
		]
	});
}
//#endregion
export { Step6Decrypt as component };
