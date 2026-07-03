import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowDown, ArrowRight, ArrowRightLeft, ChevronDown, Code2, Cpu, Database, Globe, Key, KeyRound, Layers, Lock, Radio, Server, Shield, Timer, Zap } from "lucide-react";
import { motion } from "motion/react";
//#region src/features/landing/components/architecture-flow-section.tsx
function ArchitectureFlowSection() {
	return /* @__PURE__ */ jsx("section", {
		className: "relative z-10 py-24 px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-4xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-16 text-center",
				children: [/* @__PURE__ */ jsx(motion.h2, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mb-4 text-3xl font-bold text-white md:text-5xl",
					children: "The Data Flow"
				}), /* @__PURE__ */ jsx(motion.p, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mx-auto max-w-2xl text-lg text-surface-400",
					children: "A zero-knowledge architecture where privacy is the default — mirroring how real TLS servers operate."
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "relative",
				children: [/* @__PURE__ */ jsx("div", { className: "absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-symmetric-500 via-hybrid-500 to-asymmetric-500 hidden md:block" }), /* @__PURE__ */ jsxs("div", {
					className: "space-y-8",
					children: [
						/* @__PURE__ */ jsx(FlowStep, {
							step: "1",
							title: "User Action",
							desc: "The user enters the wizard, types a message, and clicks Generate Keys.",
							icon: /* @__PURE__ */ jsx(Globe, { size: 20 }),
							label: "Browser",
							details: [
								"No data leaves the browser yet",
								"All cryptographic operations stay client-side",
								"Plaintext never touches the server"
							]
						}),
						/* @__PURE__ */ jsx(FlowArrow, {}),
						/* @__PURE__ */ jsx(FlowStep, {
							step: "2",
							title: "Web Worker",
							desc: "All cryptographic operations are offloaded to a dedicated Web Worker — keeping the main thread responsive.",
							icon: /* @__PURE__ */ jsx(Cpu, { size: 20 }),
							label: "Off-Main-Thread",
							details: [
								"RSA Key Generation (2048 or 4096 bits)",
								"AES-256-GCM Session Key creation",
								"Encryption, decryption, and key wrapping",
								"Zero-copy ArrayBuffer transfers for performance"
							]
						}),
						/* @__PURE__ */ jsx(FlowArrow, {}),
						/* @__PURE__ */ jsx(FlowStep, {
							step: "3",
							title: "Zero-Knowledge Backend",
							desc: "The backend only coordinates the session. It NEVER sees keys, plaintext, or encrypted data — architecturally honest to how real TLS works.",
							icon: /* @__PURE__ */ jsx(Server, { size: 20 }),
							label: "NestJS",
							details: [
								"Manages WebSocket connections for wire simulation",
								"Stores metadata: timestamps, session IDs, public keys",
								"Relays signaling — never touches the payload"
							]
						}),
						/* @__PURE__ */ jsx(FlowArrow, {}),
						/* @__PURE__ */ jsx(FlowStep, {
							step: "4",
							title: "Hybrid Security",
							desc: "The result: the speed of AES with the key-sharing power of RSA. The AES key is wrapped by RSA for transport, then unwrapped by the recipient.",
							icon: /* @__PURE__ */ jsx(Lock, { size: 20 }),
							label: "TLS 1.3 Inspired",
							details: [
								"RSA wraps the AES session key (digital envelope)",
								"AES-GCM encrypts the actual message data",
								"GCM authentication tag ensures integrity"
							]
						}),
						/* @__PURE__ */ jsx(FlowArrow, {}),
						/* @__PURE__ */ jsx(FlowStep, {
							step: "5",
							title: "Integrity Verified",
							desc: "On decryption, the GCM auth tag is checked first. If a single bit was tampered in transit, the entire decryption fails — no silent corruption.",
							icon: /* @__PURE__ */ jsx(Shield, { size: 20 }),
							label: "Authenticated Encryption",
							details: [
								"AEAD: Authenticated Encryption with Associated Data",
								"Any tampering → immediate integrity check failure",
								"Bit Flipper sandbox lets you test this live"
							]
						})
					]
				})]
			})]
		})
	});
}
function FlowStep({ step, title, desc, icon, label, details }) {
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			opacity: 0,
			y: 20
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: { once: true },
		className: "relative pl-12 md:pl-16",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface-800 border border-surface-700 md:left-0",
			children: /* @__PURE__ */ jsx("span", {
				className: "text-xs font-bold text-surface-400",
				children: step
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "rounded-xl border border-surface-700/50 bg-surface-950/60 p-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-lg bg-surface-800 text-surface-300",
							children: icon
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-lg font-bold text-white",
							children: title
						}),
						/* @__PURE__ */ jsx("span", {
							className: "rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-surface-500 border border-surface-700",
							children: label
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mb-4 text-surface-300",
					children: desc
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "space-y-2",
					children: details.map((detail, i) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-start gap-2 text-sm text-surface-400",
						children: [/* @__PURE__ */ jsx("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-surface-600" }), detail]
					}, i))
				})
			]
		})]
	});
}
function FlowArrow() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex justify-center pl-12 md:pl-16",
		children: /* @__PURE__ */ jsx(ArrowDown, {
			size: 16,
			className: "text-surface-600"
		})
	});
}
//#endregion
//#region src/features/landing/components/cipher-overview-section.tsx
function CipherOverviewSection() {
	return /* @__PURE__ */ jsx("section", {
		className: "relative z-10 py-24 px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-16 text-center",
				children: [/* @__PURE__ */ jsx(motion.h2, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mb-4 text-3xl font-bold text-white md:text-5xl",
					children: "The Ciphers at a Glance"
				}), /* @__PURE__ */ jsx(motion.p, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mx-auto max-w-2xl text-lg text-surface-400",
					children: "A quick primer on the two pillars of modern encryption."
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid gap-8 md:grid-cols-2",
				children: [/* @__PURE__ */ jsxs(motion.div, {
					initial: {
						opacity: 0,
						x: -20
					},
					whileInView: {
						opacity: 1,
						x: 0
					},
					viewport: { once: true },
					className: "rounded-2xl border border-asymmetric-500/20 bg-surface-950/60 p-8",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6 flex items-center gap-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-12 w-12 items-center justify-center rounded-xl bg-asymmetric-500/10 text-asymmetric-400",
								children: /* @__PURE__ */ jsx(KeyRound, { size: 24 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-xl font-bold text-white",
								children: "RSA (Asymmetric)"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm text-asymmetric-400 font-mono",
								children: "RSA-OAEP"
							})] })]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mb-6 text-surface-400 leading-relaxed",
							children: "RSA uses a pair of keys generated from large prime numbers. The public key is shared freely, while the private key is kept secret. Anyone can encrypt data with your public key, but only you can decrypt it with your private key."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-asymmetric-500" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm text-surface-300",
										children: "Key size: 2048 or 4096 bits"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-asymmetric-500" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm text-surface-300",
										children: "Used for: Key wrapping, digital signatures"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-asymmetric-500" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm text-surface-300",
										children: "Trade-off: Secure, but ~1000x slower than symmetric ciphers"
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ jsxs(motion.div, {
					initial: {
						opacity: 0,
						x: 20
					},
					whileInView: {
						opacity: 1,
						x: 0
					},
					viewport: { once: true },
					className: "rounded-2xl border border-symmetric-500/20 bg-surface-950/60 p-8",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6 flex items-center gap-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-12 w-12 items-center justify-center rounded-xl bg-symmetric-500/10 text-symmetric-400",
								children: /* @__PURE__ */ jsx(ArrowRightLeft, { size: 24 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-xl font-bold text-white",
								children: "AES (Symmetric)"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm text-symmetric-400 font-mono",
								children: "AES-256-GCM"
							})] })]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mb-6 text-surface-400 leading-relaxed",
							children: "AES uses a single secret key for both encryption and decryption. It processes data in 128-bit blocks through multiple rounds of substitution, permutation, and mixing, making the output appear completely random."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-symmetric-500" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm text-surface-300",
										children: "Key size: 256 bits"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-symmetric-500" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm text-surface-300",
										children: "Used for: Bulk data encryption"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-symmetric-500" }), /* @__PURE__ */ jsx("p", {
										className: "text-sm text-surface-300",
										children: "Trade-off: Blazingly fast, but requires secure key exchange"
									})]
								})
							]
						})
					]
				})]
			})]
		})
	});
}
//#endregion
//#region src/features/landing/components/concept-primer-section.tsx
var containerVariants$1 = {
	hidden: {},
	visible: { transition: { staggerChildren: .2 } }
};
var itemVariants$1 = {
	hidden: {
		opacity: 0,
		y: 20
	},
	visible: {
		opacity: 1,
		y: 0
	}
};
function ConceptPrimerSection() {
	return /* @__PURE__ */ jsx("section", {
		className: "relative z-10 py-24 px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-16 text-center",
				children: [/* @__PURE__ */ jsx(motion.h2, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mb-4 text-3xl font-bold text-white md:text-5xl",
					children: "Why Hybrid Encryption?"
				}), /* @__PURE__ */ jsx(motion.p, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mx-auto max-w-2xl text-lg text-surface-400",
					children: "The best of two worlds, combined for real-world security. This is how every HTTPS connection you use actually works."
				})]
			}), /* @__PURE__ */ jsxs(motion.div, {
				variants: containerVariants$1,
				initial: "hidden",
				whileInView: "visible",
				viewport: { once: true },
				className: "grid gap-8 md:grid-cols-3",
				children: [
					/* @__PURE__ */ jsxs(motion.div, {
						variants: itemVariants$1,
						className: "group relative rounded-2xl border border-asymmetric-500/30 bg-surface-950/60 p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-asymmetric-500/30 bg-asymmetric-500/10",
								children: /* @__PURE__ */ jsx(Key, {
									className: "text-asymmetric-400",
									size: 32
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xl font-bold text-white",
									children: "RSA (Asymmetric)"
								}), /* @__PURE__ */ jsx("span", {
									className: "rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-asymmetric-400 border border-asymmetric-500/30",
									children: "KEY EXCHANGE"
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mb-4 text-surface-400 leading-relaxed",
								children: [
									"Uses a mathematically linked pair of keys: a",
									" ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-asymmetric-300",
										children: "Public Key"
									}),
									" to encrypt and a",
									" ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-asymmetric-300",
										children: "Private Key"
									}),
									" to decrypt. It solves the key distribution problem — but at a cost."
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "rounded-lg bg-surface-900/50 p-3 text-sm text-surface-500 font-mono",
								children: "~250ms per keygen · 1000x slower than AES"
							})
						]
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						variants: itemVariants$1,
						className: "group relative rounded-2xl border border-symmetric-500/30 bg-surface-950/60 p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-symmetric-500/30 bg-symmetric-500/10",
								children: /* @__PURE__ */ jsx(Lock, {
									className: "text-symmetric-400",
									size: 32
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xl font-bold text-white",
									children: "AES (Symmetric)"
								}), /* @__PURE__ */ jsx("span", {
									className: "rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-symmetric-400 border border-symmetric-500/30",
									children: "BULK ENCRYPT"
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mb-4 text-surface-400 leading-relaxed",
								children: [
									"A single",
									" ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-symmetric-300",
										children: "shared secret key"
									}),
									" ",
									"for both encryption and decryption. Blazingly fast for large data — but how do you share the key safely?"
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "rounded-lg bg-surface-900/50 p-3 text-sm text-surface-500 font-mono",
								children: "~0.5ms per encrypt · 256-bit session key"
							})
						]
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						variants: itemVariants$1,
						className: "group relative rounded-2xl border border-hybrid-500/30 bg-surface-950/60 p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-hybrid-500/30 bg-hybrid-500/10",
								children: /* @__PURE__ */ jsx(Zap, {
									className: "text-hybrid-400",
									size: 32
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xl font-bold text-white",
									children: "Hybrid Model"
								}), /* @__PURE__ */ jsx("span", {
									className: "rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-hybrid-400 border border-hybrid-500/30",
									children: "TLS 1.3"
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mb-4 text-surface-400 leading-relaxed",
								children: [
									"Use slow but secure",
									" ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-hybrid-300",
										children: "RSA to wrap the AES key"
									}),
									", then use fast",
									" ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-hybrid-300",
										children: "AES to encrypt the message"
									}),
									". This is exactly how TLS/HTTPS works every time you visit a secure site."
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "rounded-lg bg-surface-900/50 p-3 text-sm text-surface-500 font-mono",
								children: "6 steps · best of both worlds"
							})
						]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/features/landing/components/final-cta-section.tsx
function FinalCTASection() {
	return /* @__PURE__ */ jsx("section", {
		className: "relative z-10 py-24 px-4",
		children: /* @__PURE__ */ jsxs(motion.div, {
			initial: {
				opacity: 0,
				y: 20
			},
			whileInView: {
				opacity: 1,
				y: 0
			},
			viewport: { once: true },
			className: "mx-auto max-w-4xl rounded-3xl border border-symmetric-500/20 bg-surface-950/60 backdrop-blur-sm p-8 text-center md:p-12",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "mb-6 text-3xl font-bold",
					children: "Ready to Visualize?"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mx-auto mb-10 max-w-xl text-surface-400",
					children: "Experience the full 6-step wizard. Generate keys, encrypt data, and simulate the network wire in real-time."
				}),
				/* @__PURE__ */ jsxs(Link, {
					to: "/handshake/step-1",
					suppressHydrationWarning: true,
					className: "inline-flex items-center gap-2 rounded-xl bg-symmetric-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-symmetric-500 hover:scale-105 active:scale-95",
					children: ["Start the Journey ", /* @__PURE__ */ jsx(ArrowRight, { size: 20 })]
				})
			]
		})
	});
}
//#endregion
//#region src/features/landing/components/animated-background.tsx
function AnimatedBackground() {
	const styleInjected = useRef(false);
	useEffect(() => {
		if (styleInjected.current) return;
		styleInjected.current = true;
		const styleId = "bg-animation-style";
		if (!document.getElementById(styleId)) {
			const style = document.createElement("style");
			style.id = styleId;
			style.textContent = `
				@keyframes gradient-move {
					0% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
					33% { transform: translate(5%, 5%) rotate(120deg) scale(1.1); }
					66% { transform: translate(-5%, 3%) rotate(240deg) scale(0.95); }
					100% { transform: translate(0%, 0%) rotate(360deg) scale(1); }
				}
				.bg-blob-1 { animation: gradient-move 20s ease-in-out infinite; }
				.bg-blob-2 { animation: gradient-move 25s ease-in-out infinite reverse; }
				.bg-blob-3 { animation: gradient-move 30s ease-in-out infinite; animation-delay: -5s; }
			`;
			document.head.appendChild(style);
		}
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 overflow-hidden bg-surface-950",
		children: [
			/* @__PURE__ */ jsx("div", { className: "bg-blob-1 absolute -left-[20%] -top-[20%] h-[80%] w-[80%] rounded-full bg-asymmetric-600/20 blur-[120px]" }),
			/* @__PURE__ */ jsx("div", { className: "bg-blob-2 absolute -right-[20%] top-[20%] h-[70%] w-[70%] rounded-full bg-symmetric-600/20 blur-[120px]" }),
			/* @__PURE__ */ jsx("div", { className: "bg-blob-3 absolute -bottom-[10%] left-[30%] h-[60%] w-[60%] rounded-full bg-hybrid-600/20 blur-[120px]" }),
			/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-surface-950/60" })
		]
	});
}
//#endregion
//#region src/features/landing/components/hero-section.tsx
function HeroSection() {
	return /* @__PURE__ */ jsxs("section", {
		className: "relative flex h-screen w-full items-center justify-center overflow-hidden",
		children: [
			/* @__PURE__ */ jsx(AnimatedBackground, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 flex flex-col items-center justify-center px-4 text-center",
				children: [
					/* @__PURE__ */ jsxs(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .8,
							ease: "easeOut"
						},
						className: "mb-8 flex items-center gap-6 md:gap-8",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-14 w-14 items-center justify-center rounded-2xl border border-asymmetric-500/30 bg-asymmetric-500/10 shadow-lg shadow-asymmetric-500/10 md:h-16 md:w-16",
									children: /* @__PURE__ */ jsx(Key, {
										className: "text-asymmetric-400",
										size: 28
									})
								}), /* @__PURE__ */ jsx("span", {
									className: "mt-2 text-xs font-medium text-asymmetric-400",
									children: "RSA"
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "text-2xl text-surface-600",
								children: "+"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-14 w-14 items-center justify-center rounded-2xl border border-symmetric-500/30 bg-symmetric-500/10 shadow-lg shadow-symmetric-500/10 md:h-16 md:w-16",
									children: /* @__PURE__ */ jsx(Lock, {
										className: "text-symmetric-400",
										size: 28
									})
								}), /* @__PURE__ */ jsx("span", {
									className: "mt-2 text-xs font-medium text-symmetric-400",
									children: "AES"
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "text-2xl text-surface-600",
								children: "="
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-14 w-14 items-center justify-center rounded-2xl border border-hybrid-500/30 bg-hybrid-500/10 shadow-lg shadow-hybrid-500/10 md:h-16 md:w-16",
									children: /* @__PURE__ */ jsx(Zap, {
										className: "text-hybrid-400",
										size: 28
									})
								}), /* @__PURE__ */ jsx("span", {
									className: "mt-2 text-xs font-medium text-hybrid-400",
									children: "Hybrid"
								})]
							})
						]
					}),
					/* @__PURE__ */ jsx(motion.h1, {
						initial: {
							opacity: 0,
							y: 30
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .8,
							delay: .2,
							ease: "easeOut"
						},
						className: "mb-4 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl",
						children: /* @__PURE__ */ jsx("span", {
							className: "bg-gradient-to-r from-symmetric-400 via-hybrid-400 to-asymmetric-400 bg-clip-text text-transparent",
							children: "CryptoVisual"
						})
					}),
					/* @__PURE__ */ jsx(motion.p, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .6,
							delay: .4,
							ease: "easeOut"
						},
						className: "mx-auto mb-10 max-w-2xl text-lg text-surface-400 md:text-xl",
						children: "Master the art of hybrid encryption. Visualize RSA, AES, and the TLS handshake through high-performance animations."
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .6,
							delay: .6,
							ease: "easeOut"
						},
						className: "flex flex-wrap justify-center gap-4",
						children: [/* @__PURE__ */ jsxs(Link, {
							to: "/handshake/step-1",
							suppressHydrationWarning: true,
							className: "group relative flex items-center gap-2 overflow-hidden rounded-xl bg-symmetric-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-symmetric-500 hover:scale-105 active:scale-95",
							children: [/* @__PURE__ */ jsx("span", { children: "Start the Experience" }), /* @__PURE__ */ jsx(ArrowRight, {
								size: 20,
								className: "transition-transform group-hover:translate-x-1"
							})]
						}), /* @__PURE__ */ jsx("a", {
							href: "#explore",
							className: "flex items-center justify-center rounded-xl border border-surface-700/50 bg-surface-950/40 backdrop-blur-sm px-8 py-4 text-lg font-medium text-surface-300 transition-all hover:bg-surface-950/70",
							children: "Explore Project"
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				transition: {
					duration: 1,
					delay: 1.2
				},
				className: "absolute bottom-8 left-1/2 -translate-x-1/2 z-10",
				children: /* @__PURE__ */ jsxs("a", {
					href: "#explore",
					"aria-label": "Scroll down to explore",
					className: "flex flex-col items-center gap-2 text-surface-500 transition-colors hover:text-surface-300",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs tracking-widest uppercase",
						children: "Scroll"
					}), /* @__PURE__ */ jsx(ChevronDown, {
						size: 20,
						className: "animate-bounce"
					})]
				})
			})
		]
	});
}
//#endregion
//#region src/features/landing/components/stack-section.tsx
var frontendItems = [
	{
		name: "TanStack Start",
		desc: "Framework & Routing",
		icon: /* @__PURE__ */ jsx(Code2, { size: 20 })
	},
	{
		name: "React 19",
		desc: "UI Library",
		icon: /* @__PURE__ */ jsx(Code2, { size: 20 })
	},
	{
		name: "XState v5",
		desc: "State Machine",
		icon: /* @__PURE__ */ jsx(Layers, { size: 20 })
	},
	{
		name: "Tailwind CSS v4",
		desc: "Styling",
		icon: /* @__PURE__ */ jsx(Layers, { size: 20 })
	},
	{
		name: "Motion (FM)",
		desc: "DOM Animations",
		icon: /* @__PURE__ */ jsx(Zap, { size: 20 })
	},
	{
		name: "PixiJS v8",
		desc: "Canvas Rendering",
		icon: /* @__PURE__ */ jsx(Zap, { size: 20 })
	},
	{
		name: "GSAP 3.12+",
		desc: "Timeline Animations",
		icon: /* @__PURE__ */ jsx(Zap, { size: 20 })
	}
];
var cryptoItems = [{
	name: "Web Crypto API",
	desc: "Native Browser Crypto (RSA, AES)",
	icon: /* @__PURE__ */ jsx(Cpu, { size: 20 })
}, {
	name: "Web Workers",
	desc: "Off-Main Thread Processing",
	icon: /* @__PURE__ */ jsx(Cpu, { size: 20 })
}];
var backendItems = [
	{
		name: "NestJS 11",
		desc: "API & WS Gateway",
		icon: /* @__PURE__ */ jsx(Server, { size: 20 })
	},
	{
		name: "PostgreSQL 17",
		desc: "Relational Database",
		icon: /* @__PURE__ */ jsx(Database, { size: 20 })
	},
	{
		name: "WebSockets",
		desc: "Real-time Communication",
		icon: /* @__PURE__ */ jsx(Radio, { size: 20 })
	}
];
var containerVariants = {
	hidden: {},
	visible: { transition: { staggerChildren: .1 } }
};
var itemVariants = {
	hidden: {
		opacity: 0,
		scale: .95
	},
	visible: {
		opacity: 1,
		scale: 1
	}
};
function StackSection() {
	return /* @__PURE__ */ jsx("section", {
		id: "explore",
		className: "relative z-10 py-24 px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-16 text-center",
				children: [/* @__PURE__ */ jsx(motion.h2, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mb-4 text-3xl font-bold text-white md:text-5xl",
					children: "Built For Performance & Education"
				}), /* @__PURE__ */ jsx(motion.p, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mx-auto max-w-2xl text-lg text-surface-400",
					children: "A modern, type-safe stack chosen for high-performance visualization and rigorous cryptographic correctness."
				})]
			}), /* @__PURE__ */ jsxs(motion.div, {
				variants: containerVariants,
				initial: "hidden",
				whileInView: "visible",
				viewport: { once: true },
				className: "space-y-8",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "mb-4 text-sm font-bold uppercase tracking-widest text-surface-500",
						children: "Frontend"
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: frontendItems.map((tech) => /* @__PURE__ */ jsx(TechCard, { tech }, tech.name))
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "mb-4 text-sm font-bold uppercase tracking-widest text-surface-500",
						children: "Cryptography"
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: cryptoItems.map((tech) => /* @__PURE__ */ jsx(TechCard, { tech }, tech.name))
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "mb-4 text-sm font-bold uppercase tracking-widest text-surface-500",
						children: "Backend & Data"
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: backendItems.map((tech) => /* @__PURE__ */ jsx(TechCard, { tech }, tech.name))
					})] })
				]
			})]
		})
	});
}
function TechCard({ tech }) {
	return /* @__PURE__ */ jsxs(motion.div, {
		variants: itemVariants,
		className: "flex items-center gap-4 rounded-xl border border-surface-700/50 bg-surface-950/60 p-4 transition-colors hover:border-surface-600/50 hover:bg-surface-900/50",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800 text-surface-300",
			children: tech.icon
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "font-bold text-white",
			children: tech.name
		}), /* @__PURE__ */ jsx("div", {
			className: "text-sm text-surface-400",
			children: tech.desc
		})] })]
	});
}
//#endregion
//#region src/features/landing/components/stats-section.tsx
var stats = [
	{
		icon: /* @__PURE__ */ jsx(Cpu, { className: "text-asymmetric-400" }),
		label: "RSA-2048 Keygen",
		value: "~250ms",
		desc: "Two large primes found and verified in a Web Worker"
	},
	{
		icon: /* @__PURE__ */ jsx(Timer, { className: "text-symmetric-400" }),
		label: "AES-256-GCM Encrypt",
		value: "~0.5ms",
		desc: "14 rounds of substitution-permutation on a 128-bit block"
	},
	{
		icon: /* @__PURE__ */ jsx(Shield, { className: "text-hybrid-400" }),
		label: "Hybrid Handshake",
		value: "6 Steps",
		desc: "Full TLS 1.3-inspired key exchange visualized step by step"
	}
];
function StatsSection() {
	return /* @__PURE__ */ jsx("section", {
		className: "relative z-10 py-24 px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-12 text-center",
				children: [/* @__PURE__ */ jsx(motion.h2, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "mb-4 text-3xl font-bold text-white md:text-5xl",
					children: "By the Numbers"
				}), /* @__PURE__ */ jsx(motion.p, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: { once: true },
					className: "text-surface-400",
					children: "Real cryptographic operations, measured in your browser"
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "grid gap-6 md:grid-cols-3",
				children: stats.map((stat, i) => /* @__PURE__ */ jsxs(motion.div, {
					initial: {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					transition: { delay: i * .15 },
					viewport: { once: true },
					className: "rounded-2xl border border-surface-700/50 bg-surface-950/60 backdrop-blur-sm p-6 text-center",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-800",
							children: stat.icon
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-3xl font-bold text-white mb-1",
							children: stat.value
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-sm font-medium text-surface-300 mb-2",
							children: stat.label
						}),
						/* @__PURE__ */ jsx("div", {
							className: "text-xs text-surface-500",
							children: stat.desc
						})
					]
				}, stat.label))
			})]
		})
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function Home() {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative w-full bg-surface-950 text-surface-100",
		children: [
			/* @__PURE__ */ jsx(HeroSection, {}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" }),
			/* @__PURE__ */ jsx(ConceptPrimerSection, {}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" }),
			/* @__PURE__ */ jsx(CipherOverviewSection, {}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" }),
			/* @__PURE__ */ jsx(ArchitectureFlowSection, {}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" }),
			/* @__PURE__ */ jsx(StackSection, {}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" }),
			/* @__PURE__ */ jsx(StatsSection, {}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" }),
			/* @__PURE__ */ jsx(FinalCTASection, {}),
			/* @__PURE__ */ jsx("footer", {
				className: "relative z-10 border-t border-surface-800 py-12 px-4 text-center",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto max-w-6xl",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "mb-6 text-2xl font-bold text-surface-300",
							children: "CryptoVisual"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm text-surface-500",
							children: [
								"Built for engineers, students, and the curious.",
								/* @__PURE__ */ jsx("br", {}),
								"Exploring the intersection of Mathematics, Security, and Art."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-8 flex justify-center gap-6 text-surface-600",
							children: [/* @__PURE__ */ jsx("a", {
								href: "https://github.com/anomalyco/cryptovisual",
								target: "_blank",
								rel: "noreferrer",
								className: "transition-colors hover:text-surface-400",
								children: "GitHub"
							}), /* @__PURE__ */ jsx("a", {
								href: "/handshake/step-1",
								className: "transition-colors hover:text-surface-400",
								children: "Start Tutorial"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mx-auto mt-8 max-w-2xl text-xs text-surface-600",
							children: "CryptoVisual is an educational tool. It is NOT audited for production cryptographic use. Do not use this code to secure real data."
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Home as component };
