import { n as useCryptoWorker } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Binary, Lock, RotateCcw, Shuffle, Unlock } from "lucide-react";
import { motion } from "motion/react";
import gsap from "gsap";
import { Application, Graphics, Text } from "pixi.js";
//#region src/visualization/scenes/bit-flipper-scene.ts
var BitFlipperScene = class {
	container;
	bits;
	config;
	ciphertext;
	originalCiphertext;
	constructor(_app, container) {
		this.container = container;
		this.bits = [];
		this.ciphertext = /* @__PURE__ */ new Uint8Array(32);
		this.originalCiphertext = /* @__PURE__ */ new Uint8Array(32);
		this.config = {
			cellWidth: 40,
			cellHeight: 50,
			gap: 6,
			gridColor: 4871528,
			zeroColor: 4766584,
			oneColor: 16082277,
			flippedColor: 16179294,
			textColor: 16777215,
			fontSize: 16
		};
	}
	async init(ciphertext) {
		if (ciphertext) {
			this.ciphertext = ciphertext;
			this.originalCiphertext = new Uint8Array(ciphertext);
		} else {
			for (let i = 0; i < 32; i++) this.ciphertext[i] = Math.floor(Math.random() * 256);
			this.originalCiphertext = new Uint8Array(this.ciphertext);
		}
		this.createBitGrid();
	}
	createBitGrid() {
		const bytesPerRow = 8;
		for (let byteIndex = 0; byteIndex < this.ciphertext.length; byteIndex++) {
			const byte = this.ciphertext[byteIndex];
			for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
				const bitValue = byte >> 7 - bitIndex & 1;
				const globalBitIndex = byteIndex * 8 + bitIndex;
				const row = Math.floor(globalBitIndex / (bytesPerRow * 8));
				const x = 50 + globalBitIndex % (bytesPerRow * 8) * (this.config.cellWidth + this.config.gap);
				const y = 50 + row * (this.config.cellHeight * 8 + this.config.gap * 8);
				const bitRow = Math.floor(bitIndex / 8);
				const cellX = x + bitIndex % 8 * (this.config.cellWidth + this.config.gap);
				const cellY = y + bitRow * (this.config.cellHeight + this.config.gap);
				const cell = this.createBitCell(cellX, cellY, bitValue, globalBitIndex, byteIndex, bitIndex);
				this.bits.push(cell);
				this.container.addChild(cell.graphics);
				this.container.addChild(cell.text);
			}
			const byteLabel = new Text({
				text: `Byte ${byteIndex}`,
				style: {
					fontSize: 10,
					fill: 7438486
				}
			});
			byteLabel.x = 50 + bytesPerRow * (this.config.cellWidth + this.config.gap) + 10;
			byteLabel.y = 50 + byteIndex * (this.config.cellHeight + this.config.gap);
			this.container.addChild(byteLabel);
		}
	}
	createBitCell(x, y, value, globalIndex, _byteIndex, _bitIndex) {
		const graphics = new Graphics();
		const color = value === 0 ? this.config.zeroColor : this.config.oneColor;
		graphics.roundRect(0, 0, this.config.cellWidth, this.config.cellHeight, 4);
		graphics.fill({
			color,
			alpha: .8
		});
		graphics.stroke({
			width: 2,
			color: this.config.gridColor,
			alpha: 1
		});
		graphics.x = x;
		graphics.y = y;
		graphics.eventMode = "static";
		graphics.cursor = "pointer";
		const text = new Text({
			text: value.toString(),
			style: {
				fontSize: this.config.fontSize,
				fill: 16777215,
				fontWeight: "bold"
			}
		});
		text.anchor.set(.5);
		text.x = this.config.cellWidth / 2;
		text.y = this.config.cellHeight / 2;
		graphics.on("pointerdown", () => {
			this.flipBit(globalIndex);
		});
		graphics.on("pointerover", () => {
			graphics.alpha = .7;
		});
		graphics.on("pointerout", () => {
			graphics.alpha = 1;
		});
		return {
			graphics,
			text,
			index: globalIndex,
			originalValue: value,
			currentValue: value,
			isFlipped: false
		};
	}
	flipBit(bitIndex) {
		if (bitIndex < 0 || bitIndex >= this.bits.length) return;
		const bit = this.bits[bitIndex];
		const byteIndex = Math.floor(bitIndex / 8);
		const bitPosition = bitIndex % 8;
		this.ciphertext[byteIndex] ^= 1 << 7 - bitPosition;
		bit.isFlipped = !bit.isFlipped;
		bit.currentValue = bit.isFlipped ? bit.originalValue === 0 ? 1 : 0 : bit.originalValue;
		gsap.to(bit.graphics.scale, {
			x: .8,
			y: .8,
			duration: .1,
			yoyo: true,
			repeat: 1
		});
		const color = bit.isFlipped ? this.config.flippedColor : bit.currentValue === 0 ? this.config.zeroColor : this.config.oneColor;
		bit.graphics.clear();
		bit.graphics.roundRect(0, 0, this.config.cellWidth, this.config.cellHeight, 4);
		bit.graphics.fill({
			color,
			alpha: .8
		});
		bit.text.text = bit.currentValue.toString();
		if (bit.isFlipped) bit.graphics.stroke({
			width: 3,
			color: this.config.flippedColor,
			alpha: .8
		});
		else bit.graphics.stroke({
			width: 2,
			color: this.config.gridColor,
			alpha: 1
		});
	}
	flipRandomBits(count = 5) {
		const flippedIndices = /* @__PURE__ */ new Set();
		while (flippedIndices.size < count) {
			const randomIndex = Math.floor(Math.random() * this.bits.length);
			if (!flippedIndices.has(randomIndex)) {
				flippedIndices.add(randomIndex);
				this.flipBit(randomIndex);
			}
		}
	}
	resetBits() {
		this.bits.forEach((bit) => {
			if (bit.isFlipped) this.flipBit(bit.index);
		});
	}
	getFlippedCount() {
		return this.bits.filter((b) => b.isFlipped).length;
	}
	getModifiedCiphertext() {
		return new Uint8Array(this.ciphertext);
	}
	getOriginalCiphertext() {
		return new Uint8Array(this.originalCiphertext);
	}
	static toHex(bytes) {
		return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	getStats() {
		const flipped = this.getFlippedCount();
		return {
			totalBits: this.bits.length,
			flippedBits: flipped,
			flipPercentage: flipped / this.bits.length * 100
		};
	}
	cleanup() {
		this.bits.forEach((bit) => {
			if (this.container.children.includes(bit.graphics)) this.container.removeChild(bit.graphics);
			if (this.container.children.includes(bit.text)) this.container.removeChild(bit.text);
		});
		this.bits = [];
	}
};
//#endregion
//#region src/routes/sandbox/bit-flipper.tsx?tsr-split=component
function BitFlipperSandbox() {
	const canvasRef = useRef(null);
	const bitFlipperRef = useRef(null);
	const appRef = useRef(null);
	const worker = useCryptoWorker();
	const [flippedCount, setFlippedCount] = useState(0);
	const [totalBits, setTotalBits] = useState(0);
	const [flipPercentage, setFlipPercentage] = useState(0);
	const [isInitializing, setIsInitializing] = useState(true);
	const [plaintext] = useState("Hello, CryptoVisual!");
	const [originalDecryption, setOriginalDecryption] = useState(null);
	const [modifiedDecryption, setModifiedDecryption] = useState(null);
	const [isDecrypting, setIsDecrypting] = useState(false);
	const keyRef = useRef("");
	const ivRef = useRef("");
	useEffect(() => {
		if (!canvasRef.current) return;
		const initPixi = async () => {
			if (!worker) return;
			const app = new Application();
			await app.init({
				canvas: canvasRef.current,
				backgroundAlpha: 0,
				autoDensity: true,
				resolution: window.devicePixelRatio || 1
			});
			appRef.current = app;
			try {
				const { keyBytes, iv } = await worker.generateAESKey(256);
				if (!keyBytes || !iv) throw new Error("AES key generation failed");
				keyRef.current = keyBytes;
				ivRef.current = iv;
				const { ciphertext: ctHex } = await worker.encryptAES(keyBytes, plaintext);
				if (!ctHex) throw new Error("AES encryption failed");
				const ctBytes = new Uint8Array(ctHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
				const bitFlipper = new BitFlipperScene(app, app.stage);
				await bitFlipper.init(ctBytes);
				bitFlipperRef.current = bitFlipper;
				setTotalBits(bitFlipper.getStats().totalBits);
			} catch (err) {
				console.error("BitFlipper init failed:", err);
			} finally {
				setIsInitializing(false);
			}
		};
		initPixi();
		return () => {
			if (bitFlipperRef.current) bitFlipperRef.current.cleanup();
			if (appRef.current) appRef.current.destroy(true);
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
		if (!bitFlipperRef.current || !keyRef.current || !ivRef.current || !worker) return;
		setIsDecrypting(true);
		setOriginalDecryption(null);
		setModifiedDecryption(null);
		const originalCt = bitFlipperRef.current.getOriginalCiphertext();
		const modifiedCt = bitFlipperRef.current.getModifiedCiphertext();
		const originalHex = BitFlipperScene.toHex(originalCt);
		const modifiedHex = BitFlipperScene.toHex(modifiedCt);
		try {
			const origResult = await worker.decryptAES(keyRef.current, originalHex, ivRef.current);
			setOriginalDecryption({
				text: origResult.decryptedData ?? "(empty)",
				isError: false,
				durationMs: origResult.durationMs ?? 0
			});
		} catch {
			setOriginalDecryption({
				text: "Decryption failed (auth tag mismatch)",
				isError: true,
				durationMs: 0
			});
		}
		try {
			const modResult = await worker.decryptAES(keyRef.current, modifiedHex, ivRef.current);
			setModifiedDecryption({
				text: modResult.decryptedData ?? "(empty)",
				isError: false,
				durationMs: modResult.durationMs ?? 0
			});
		} catch {
			setModifiedDecryption({
				text: "Decryption failed (auth tag mismatch)",
				isError: true,
				durationMs: 0
			});
		}
		setIsDecrypting(false);
	};
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: { delay: .1 },
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 items-center justify-center rounded-lg bg-symmetric-500/10",
					children: /* @__PURE__ */ jsx(Binary, {
						size: 20,
						className: "text-symmetric-400"
					})
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-2xl font-bold text-symmetric-400",
					children: "Bit Flipper Sandbox"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-surface-500",
					children: "Real AES-GCM decryption — flip bits, observe the avalanche effect"
				})] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 text-surface-400 leading-relaxed",
				children: "Click on individual bits to flip them in a real AES-GCM ciphertext, then decrypt to see how even a single bit change corrupts the output or triggers authentication failure."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 grid grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700 bg-surface-900 p-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-sm text-surface-500",
							children: "Total Bits"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-2xl font-bold text-surface-300",
							children: totalBits
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700 bg-surface-900 p-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-sm text-surface-500",
							children: "Flipped Bits"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-2xl font-bold text-amber-400",
							children: flippedCount
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-surface-700 bg-surface-900 p-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-sm text-surface-500",
							children: "Flip Percentage"
						}), /* @__PURE__ */ jsxs("div", {
							className: "text-2xl font-bold text-blue-400",
							children: [flipPercentage.toFixed(1), "%"]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mb-6 overflow-hidden rounded-lg border border-surface-700 bg-surface-900",
				children: [isInitializing && /* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 z-10 flex items-center justify-center bg-surface-950/80",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 text-surface-400",
						children: [/* @__PURE__ */ jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-symmetric-400 border-t-transparent" }), "Generating AES key & encrypting..."]
					})
				}), /* @__PURE__ */ jsx("canvas", {
					ref: canvasRef,
					className: "h-[600px] w-full"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex gap-3",
				children: [
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleFlipRandom,
						disabled: isInitializing,
						className: "flex items-center gap-2 rounded-lg bg-surface-600 px-4 py-2 text-sm font-medium text-white hover:bg-surface-500 disabled:opacity-50 transition-colors",
						children: [/* @__PURE__ */ jsx(Shuffle, { size: 16 }), "Flip 5 Random Bits"]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleReset,
						disabled: isInitializing,
						className: "flex items-center gap-2 rounded-lg bg-surface-700 px-4 py-2 text-sm font-medium text-white hover:bg-surface-600 disabled:opacity-50 transition-colors",
						children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), "Reset All"]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: handleDecrypt,
						disabled: isInitializing || isDecrypting || flippedCount === 0,
						className: "flex items-center gap-2 rounded-lg bg-symmetric-600 px-4 py-2 text-sm font-medium text-white hover:bg-symmetric-500 disabled:opacity-50 transition-colors",
						children: isDecrypting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" }), "Decrypting..."] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Unlock, { size: 16 }), "Decrypt & Compare"] })
					})
				]
			}),
			(originalDecryption || modifiedDecryption) && /* @__PURE__ */ jsxs(motion.div, {
				initial: {
					opacity: 0,
					y: 8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				className: "mb-6 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-green-700/40 bg-green-950/30 p-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-2 flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Lock, {
								size: 14,
								className: "text-green-400"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm font-semibold text-green-400",
								children: "Original Ciphertext"
							})]
						}),
						originalDecryption && /* @__PURE__ */ jsx("div", {
							className: `font-mono text-sm break-all ${originalDecryption.isError ? "text-red-400" : "text-green-300"}`,
							children: originalDecryption.text
						}),
						originalDecryption && !originalDecryption.isError && /* @__PURE__ */ jsxs("div", {
							className: "mt-2 text-xs text-surface-500",
							children: [originalDecryption.durationMs.toFixed(1), "ms"]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-amber-700/40 bg-amber-950/30 p-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-2 flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Unlock, {
								size: 14,
								className: "text-amber-400"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm font-semibold text-amber-400",
								children: "Modified Ciphertext"
							})]
						}),
						modifiedDecryption && /* @__PURE__ */ jsx("div", {
							className: `font-mono text-sm break-all ${modifiedDecryption.isError ? "text-red-400" : "text-amber-300"}`,
							children: modifiedDecryption.text
						}),
						modifiedDecryption?.isError && /* @__PURE__ */ jsx("div", {
							className: "mt-2 text-xs text-red-400/70",
							children: "AES-GCM auth tag verification failed — the ciphertext was altered"
						}),
						modifiedDecryption && !modifiedDecryption.isError && /* @__PURE__ */ jsxs("div", {
							className: "mt-2 text-xs text-surface-500",
							children: [modifiedDecryption.durationMs.toFixed(1), "ms"]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-surface-700 bg-surface-900 p-6",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "mb-3 font-semibold text-white",
						children: "How It Works"
					}), /* @__PURE__ */ jsxs("ul", {
						className: "space-y-2 text-sm text-surface-400",
						children: [
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-green-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "A real AES-256-GCM key is generated and encrypts a plaintext" })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-green-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "Green cells are 0-bits, red cells are 1-bits" })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-green-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "Yellow highlight indicates a flipped bit" })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-green-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "Click any bit to toggle its value" })]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-surface-700 bg-surface-900 p-6",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "mb-3 font-semibold text-white",
						children: "Avalanche Effect"
					}), /* @__PURE__ */ jsxs("ul", {
						className: "space-y-2 text-sm text-surface-400",
						children: [
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-blue-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "AES-GCM includes an authentication tag — any bit flip will be detected" })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-blue-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "Without authenticated encryption, flipping bits can produce garbled output" })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-blue-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "This demonstrates why authenticated encryption is essential" })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-1 text-blue-400",
									children: "•"
								}), /* @__PURE__ */ jsx("span", { children: "All crypto operations run in a Web Worker — never on the main thread" })]
							})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
export { BitFlipperSandbox as component };
