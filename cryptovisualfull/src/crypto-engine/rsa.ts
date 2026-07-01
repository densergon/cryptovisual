import type {
	AESDecryptParams,
	AESEncryptParams,
	AESKey,
	AESKeyGenParams,
	CryptoResult,
	EncryptedData,
	RSADecryptParams,
	RSAEncryptParams,
	RSAKeyGenParams,
	RSAKeyPair,
	RSAKeyPairExported,
} from "./types";

export class RSAEngine {
	static async generateKeyPair(
		params: RSAKeyGenParams,
	): Promise<CryptoResult<RSAKeyPair>> {
		const start = performance.now();

		try {
			const keyPair = await crypto.subtle.generateKey(
				{
					name: "RSA-OAEP",
					modulusLength: params.keySize,
					publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
					hash: "SHA-256",
				},
				true,
				["encrypt", "decrypt"],
			);

			const publicKeyJWK = await crypto.subtle.exportKey(
				"jwk",
				keyPair.publicKey,
			);
			const privateKeyJWK = await crypto.subtle.exportKey(
				"jwk",
				keyPair.privateKey,
			);

			const durationMs = performance.now() - start;

			return {
				success: true,
				data: {
					publicKey: keyPair.publicKey,
					privateKey: keyPair.privateKey,
					publicKeyJWK,
					privateKeyJWK,
					keySize: params.keySize,
					generatedAt: Date.now(),
					durationMs,
				},
				durationMs,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start,
			};
		}
	}

	static async encrypt(
		params: RSAEncryptParams,
	): Promise<CryptoResult<Uint8Array>> {
		const start = performance.now();

		try {
			const encrypted = await crypto.subtle.encrypt(
				{
					name: "RSA-OAEP",
				},
				params.publicKey,
				params.data as any,
			);

			return {
				success: true,
				data: new Uint8Array(encrypted),
				durationMs: performance.now() - start,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start,
			};
		}
	}

	static async decrypt(
		params: RSADecryptParams,
	): Promise<CryptoResult<Uint8Array>> {
		const start = performance.now();

		try {
			const decrypted = await crypto.subtle.decrypt(
				{
					name: "RSA-OAEP",
				},
				params.privateKey,
				params.encryptedData as any,
			);

			return {
				success: true,
				data: new Uint8Array(decrypted),
				durationMs: performance.now() - start,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start,
			};
		}
	}

	static async exportKeyPair(keyPair: RSAKeyPair): Promise<RSAKeyPairExported> {
		return {
			publicKey: keyPair.publicKeyJWK,
			privateKey: keyPair.privateKeyJWK,
			keySize: keyPair.keySize,
			generatedAt: keyPair.generatedAt,
			durationMs: keyPair.durationMs,
		};
	}

	static async importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
		return await crypto.subtle.importKey(
			"jwk",
			jwk,
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			true,
			["encrypt"],
		);
	}

	static async importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
		return await crypto.subtle.importKey(
			"jwk",
			jwk,
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			true,
			["decrypt"],
		);
	}
}

export class AESEngine {
	static async generateKey(
		params: AESKeyGenParams,
	): Promise<CryptoResult<AESKey>> {
		const start = performance.now();

		try {
			const key = await crypto.subtle.generateKey(
				{
					name: "AES-GCM",
					length: params.keySize,
				},
				true,
				["encrypt", "decrypt"],
			);

			const keyBytes = await crypto.subtle.exportKey("raw", key);
			const iv = crypto.getRandomValues(new Uint8Array(12));

			return {
				success: true,
				data: {
					key,
					keyBytes: new Uint8Array(keyBytes),
					iv,
					generatedAt: Date.now(),
				},
				durationMs: performance.now() - start,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start,
			};
		}
	}

	static async encrypt(
		params: AESEncryptParams,
	): Promise<CryptoResult<EncryptedData>> {
		const start = performance.now();
		const iv = params.iv || (crypto.getRandomValues(new Uint8Array(12)) as any);

		try {
			const encrypted = await crypto.subtle.encrypt(
				{
					name: "AES-GCM",
					iv,
				},
				params.key,
				params.data as any,
			);

			const ciphertext = new Uint8Array(encrypted);
			const authTag = ciphertext.slice(-16);
			const actualCiphertext = ciphertext.slice(0, -16);

			return {
				success: true,
				data: {
					ciphertext: actualCiphertext,
					iv: iv as any,
					authTag: authTag as any,
				},
				durationMs: performance.now() - start,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start,
			};
		}
	}

	static async decrypt(
		params: AESDecryptParams,
	): Promise<CryptoResult<Uint8Array>> {
		const start = performance.now();

		try {
			const authTag = params.authTag;
			const decryptData = authTag
				? (() => {
						const combined = new Uint8Array(
							params.encryptedData.length + authTag.length,
						);
						combined.set(params.encryptedData);
						combined.set(authTag, params.encryptedData.length);
						return combined;
					})()
				: params.encryptedData;

			const decrypted = await crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: params.iv as any,
				},
				params.key,
				decryptData as any,
			);

			return {
				success: true,
				data: new Uint8Array(decrypted),
				durationMs: performance.now() - start,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start,
			};
		}
	}

	static arrayBufferToHex(buffer: ArrayBuffer): string {
		return Array.from(new Uint8Array(buffer))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	static hexToArrayBuffer(hex: string): ArrayBuffer {
		const bytes = new Uint8Array(hex.length / 2);
		for (let i = 0; i < hex.length; i += 2) {
			bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
		}
		return bytes.buffer;
	}

	static async importKey(keyBytes: ArrayBuffer): Promise<CryptoKey> {
		return await crypto.subtle.importKey(
			"raw",
			keyBytes as any,
			{
				name: "AES-GCM",
				length: keyBytes.byteLength * 8,
			},
			true,
			["encrypt", "decrypt"],
		);
	}
}
