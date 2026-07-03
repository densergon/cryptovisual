import { useCallback, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { motion } from "motion/react";
//#region src/shared/hooks/usePredictReveal.ts
function usePredictReveal(prompt) {
	const [state, setState] = useState({
		isAnswered: false,
		selectedIndex: null,
		isCorrect: null,
		showExplanation: false
	});
	const [wasSkipped, setWasSkipped] = useState(false);
	const selectAnswer = useCallback((index) => {
		setState({
			isAnswered: true,
			selectedIndex: index,
			isCorrect: index === prompt.correctIndex,
			showExplanation: true
		});
	}, [prompt.correctIndex]);
	const skip = useCallback(() => {
		setWasSkipped(true);
		setState({
			isAnswered: true,
			selectedIndex: null,
			isCorrect: null,
			showExplanation: true
		});
	}, []);
	const dismissReveal = useCallback(() => {
		setState({
			isAnswered: false,
			selectedIndex: null,
			isCorrect: null,
			showExplanation: false
		});
	}, []);
	return {
		...state,
		wasSkipped,
		prompt,
		selectAnswer,
		skip,
		dismissReveal
	};
}
//#endregion
//#region src/shared/components/pedagogy/PredictPrompt.tsx
function PredictPrompt({ prompt, onReveal, onDismiss }) {
	const { isAnswered, selectedIndex, isCorrect, wasSkipped, selectAnswer, skip, dismissReveal } = usePredictReveal(prompt);
	return /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			y: -8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			y: -8
		},
		transition: {
			duration: .2,
			ease: [
				.25,
				.1,
				.25,
				1
			]
		},
		className: "rounded-lg border border-hybrid-500/30 bg-surface-950/95 backdrop-blur-sm p-3",
		role: "region",
		"aria-label": "Predict and reveal",
		children: !isAnswered ? /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-2 flex items-center gap-2",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-hybrid-400",
					children: "Predict"
				})
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-3 text-sm font-medium text-surface-200 leading-snug",
				children: prompt.question
			}),
			/* @__PURE__ */ jsx("div", {
				className: "space-y-1.5",
				children: prompt.choices.map((choice, i) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						selectAnswer(i);
						if (i === prompt.correctIndex) onReveal();
					},
					className: "w-full rounded-lg border border-surface-700 bg-surface-900/80 px-3 py-1.5 text-left text-xs text-surface-300 transition-colors hover:border-hybrid-500/50 hover:bg-surface-800 hover:text-surface-200",
					children: [/* @__PURE__ */ jsx("span", {
						className: "mr-2 text-[10px] text-surface-600",
						children: String.fromCharCode(65 + i)
					}), choice]
				}, i))
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					skip();
					onReveal();
				},
				className: "mt-2 text-[10px] text-surface-600 transition-colors hover:text-surface-400",
				children: "Skip — show me the answer"
			})
		] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-1 flex items-center gap-2",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-hybrid-400",
					children: "Reveal"
				})
			}),
			!wasSkipped && selectedIndex !== null && /* @__PURE__ */ jsx("div", {
				className: `mb-2 rounded-lg px-3 py-1.5 text-xs font-medium ${isCorrect ? "bg-success/10 text-success ring-1 ring-success/30" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"}`,
				children: isCorrect ? "Correct!" : "Not quite — here's why"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg bg-surface-900/80 p-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs text-surface-300 leading-relaxed",
					children: prompt.explanation
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex items-center gap-2 rounded-md bg-hybrid-500/10 px-2.5 py-1.5",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[9px] font-medium uppercase tracking-wider text-hybrid-400",
						children: "Watch:"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-surface-300",
						children: prompt.revealLabel
					})]
				})]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					dismissReveal();
					onDismiss();
				},
				className: "mt-2 text-[10px] text-surface-600 transition-colors hover:text-surface-400",
				children: "Dismiss"
			})
		] })
	});
}
//#endregion
//#region src/shared/constants/predict-prompts.ts
var PREDICT_PROMPTS = [
	{
		step: 1,
		animationId: "keygen-split",
		question: "When you generate an RSA key pair, what do you share with the world?",
		choices: [
			"Both the public and private key",
			"Only the public key",
			"Only the private key",
			"Neither — you keep both secret"
		],
		correctIndex: 1,
		explanation: "The public key is shared freely — it locks (encrypts) data. The private key stays secret with you — it unlocks (decrypts) data. This asymmetry is the foundation of hybrid encryption.",
		revealLabel: "Public key highlights, private key dims — only you keep the private key"
	},
	{
		step: 2,
		animationId: "bitstream-crystallize",
		question: "Why doesn't RSA encrypt the entire message directly?",
		choices: [
			"RSA only works with small keys and cannot encrypt large messages",
			"RSA is too slow — AES is ~500x faster per block",
			"RSA is not secure enough for bulk data",
			"Both RSA and AES are needed to achieve forward secrecy"
		],
		correctIndex: 1,
		explanation: "RSA is computationally expensive: ~25ms per operation vs AES at ~0.05ms. That's ~500x slower. For large messages, RSA would be impractically slow, so we use it only to encrypt the AES session key.",
		revealLabel: "Speed comparison: RSA 25ms vs AES 0.05ms per block — AES is ~500x faster"
	},
	{
		step: 3,
		animationId: "aes-avalanche",
		question: "What happens if you flip 1 bit of plaintext before encryption?",
		choices: [
			"Only that 1 bit changes in the ciphertext",
			"About 50% of the ciphertext bits change (avalanche effect)",
			"The encryption fails because the input is corrupted",
			"All 128 bits of the ciphertext are flipped"
		],
		correctIndex: 1,
		explanation: "AES achieves the avalanche effect: changing 1 plaintext bit causes ~64 of 128 ciphertext bits to flip (~50%). This property is essential — it means similar plaintexts produce completely different ciphertexts, preventing pattern analysis.",
		revealLabel: "Avalanche effect shows ~50% bit difference from a single bit flip"
	},
	{
		step: 6,
		animationId: "decrypt-chain",
		question: "Can the server decrypt your message without your private key?",
		choices: [
			"Yes — the server holds a master key that can decrypt everything",
			"No — the private key never leaves your browser",
			"Yes — the AES session key is stored on the server",
			"No — but the server can ask you to share your private key"
		],
		correctIndex: 1,
		explanation: "This is the Zero-Knowledge architecture: your private key is generated in your browser and never sent to the server. The server only stores the RSA-wrapped session key and AES ciphertext — it cannot decrypt anything without your private key.",
		revealLabel: "Zero-knowledge architecture: the server never sees or stores private keys"
	}
];
//#endregion
export { PredictPrompt as n, PREDICT_PROMPTS as t };
