export interface PredictPrompt {
	step: number;
	animationId: string;
	question: string;
	choices: string[];
	correctIndex: number;
	explanation: string;
	revealLabel: string;
}

export const PREDICT_PROMPTS: PredictPrompt[] = [
	{
		step: 1,
		animationId: "keygen-split",
		question:
			"When you generate an RSA key pair, what do you share with the world?",
		choices: [
			"Both the public and private key",
			"Only the public key",
			"Only the private key",
			"Neither — you keep both secret",
		],
		correctIndex: 1,
		explanation:
			"The public key is shared freely — it locks (encrypts) data. The private key stays secret with you — it unlocks (decrypts) data. This asymmetry is the foundation of hybrid encryption.",
		revealLabel:
			"Public key highlights, private key dims — only you keep the private key",
	},
	{
		step: 2,
		animationId: "bitstream-crystallize",
		question: "Why doesn't RSA encrypt the entire message directly?",
		choices: [
			"RSA only works with small keys and cannot encrypt large messages",
			"RSA is too slow — AES is ~500x faster per block",
			"RSA is not secure enough for bulk data",
			"Both RSA and AES are needed to achieve forward secrecy",
		],
		correctIndex: 1,
		explanation:
			"RSA is computationally expensive: ~25ms per operation vs AES at ~0.05ms. That's ~500x slower. For large messages, RSA would be impractically slow, so we use it only to encrypt the AES session key.",
		revealLabel:
			"Speed comparison: RSA 25ms vs AES 0.05ms per block — AES is ~500x faster",
	},
	{
		step: 3,
		animationId: "aes-avalanche",
		question: "What happens if you flip 1 bit of plaintext before encryption?",
		choices: [
			"Only that 1 bit changes in the ciphertext",
			"About 50% of the ciphertext bits change (avalanche effect)",
			"The encryption fails because the input is corrupted",
			"All 128 bits of the ciphertext are flipped",
		],
		correctIndex: 1,
		explanation:
			"AES achieves the avalanche effect: changing 1 plaintext bit causes ~64 of 128 ciphertext bits to flip (~50%). This property is essential — it means similar plaintexts produce completely different ciphertexts, preventing pattern analysis.",
		revealLabel:
			"Avalanche effect shows ~50% bit difference from a single bit flip",
	},
	{
		step: 6,
		animationId: "decrypt-chain",
		question: "Can the server decrypt your message without your private key?",
		choices: [
			"Yes — the server holds a master key that can decrypt everything",
			"No — the private key never leaves your browser",
			"Yes — the AES session key is stored on the server",
			"No — but the server can ask you to share your private key",
		],
		correctIndex: 1,
		explanation:
			"This is the Zero-Knowledge architecture: your private key is generated in your browser and never sent to the server. The server only stores the RSA-wrapped session key and AES ciphertext — it cannot decrypt anything without your private key.",
		revealLabel:
			"Zero-knowledge architecture: the server never sees or stores private keys",
	},
];
