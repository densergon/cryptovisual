import { describe, expect, it } from "vitest";
import { AESVisualEngine } from "@/crypto-engine/aes-visual";

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function subtleEncryptBlock(
	keyBytes: Uint8Array,
	plaintext: Uint8Array,
): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey(
		"raw",
		keyBytes.buffer as ArrayBuffer,
		{ name: "AES-CBC" },
		false,
		["encrypt"],
	);
	const iv = new Uint8Array(16);
	iv.fill(0);
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-CBC", iv },
		key,
		plaintext.buffer as ArrayBuffer,
	);
	return new Uint8Array(encrypted.slice(0, 16));
}

function generateRandomKey(): Uint8Array {
	const key = new Uint8Array(32);
	crypto.getRandomValues(key);
	return key;
}

describe("AESVisualEngine encryptBlock", () => {
	it("matches known-answer test vector (NIST AES-256-ECB)", () => {
		const key = hexToBytes(
			"000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
		);
		const plaintext = hexToBytes("00112233445566778899aabbccddeeff");
		const expected = hexToBytes("8ea2b7ca516745bfeafc49904b496089");

		const ciphertext = AESVisualEngine.encryptBlock(plaintext, key);

		expect(bytesToHex(ciphertext)).toBe(bytesToHex(expected));
	});

	it("matches crypto.subtle for 100 random 256-bit keys", async () => {
		for (let i = 0; i < 100; i++) {
			const key = generateRandomKey();
			const plaintextBytes = new Uint8Array(16);
			crypto.getRandomValues(plaintextBytes);

			const pureJsResult = AESVisualEngine.encryptBlock(plaintextBytes, key);
			const subtleResult = await subtleEncryptBlock(key, plaintextBytes);

			expect(bytesToHex(pureJsResult)).toBe(bytesToHex(subtleResult));
		}
	});

	it("expandKey produces 15 round keys", () => {
		const key = new Uint8Array(32);
		crypto.getRandomValues(key);

		const roundKeys = AESVisualEngine.expandKey(key);

		expect(roundKeys).toHaveLength(15);
		for (const rk of roundKeys) {
			expect(rk).toHaveLength(16);
		}
	});

	it("runRound1 returns all intermediate states with correct lengths", () => {
		const key = new Uint8Array(32);
		crypto.getRandomValues(key);
		const plaintext = new Uint8Array(16);
		crypto.getRandomValues(plaintext);

		const result = AESVisualEngine.runRound1(plaintext, key);

		expect(result.inputState).toHaveLength(16);
		expect(result.subBytesState).toHaveLength(16);
		expect(result.shiftRowsState).toHaveLength(16);
		expect(result.mixColumnsState).toHaveLength(16);
		expect(result.addRoundKeyState).toHaveLength(16);
		expect(result.roundKey).toHaveLength(16);
	});

	it("produces different output for different keys", () => {
		const plaintext = new Uint8Array(16);
		crypto.getRandomValues(plaintext);

		const key1 = new Uint8Array(32);
		crypto.getRandomValues(key1);
		const key2 = new Uint8Array(32);
		crypto.getRandomValues(key2);

		const result1 = AESVisualEngine.encryptBlock(plaintext, key1);
		const result2 = AESVisualEngine.encryptBlock(plaintext, key2);

		expect(bytesToHex(result1)).not.toBe(bytesToHex(result2));
	});
});
