import type { CryptoRequest, CryptoResponse, RSAKeyGenResponse, AESKeyGenResponse, RSAEncryptResponse, RSADecryptResponse, AESEncryptResponse, AESDecryptResponse, AESRoundOutputsResponse } from "./crypto.protocol";

export class CryptoWorkerClient {
	private worker: Worker;
	private pendingRequests: Map<
		string,
		{
			resolve: (response: CryptoResponse) => void;
			reject: (error: Error) => void;
		}
	> = new Map();

	constructor() {
		this.worker = new Worker(new URL("./crypto.worker.ts", import.meta.url), {
			type: "module",
		});

		this.worker.onmessage = (event: MessageEvent<CryptoResponse>) => {
			const response = event.data;
			const pending = this.pendingRequests.get(response.requestId);

			if (pending) {
				pending.resolve(response);
				this.pendingRequests.delete(response.requestId);
			}
		};

		this.worker.onerror = (error) => {
			console.error("Worker error:", error);
			this.pendingRequests.forEach((pending) => {
				pending.reject(new Error("Worker error"));
			});
			this.pendingRequests.clear();
		};
	}

	private sendRequest(request: CryptoRequest): Promise<CryptoResponse> {
		return new Promise((resolve, reject) => {
			this.pendingRequests.set(request.requestId, { resolve, reject });
			this.worker.postMessage(request);
		});
	}

	async ping(): Promise<boolean> {
		const response = await this.sendRequest({
			type: "PING_REQUEST",
			requestId: this.generateId(),
		});

		if (response.type === "PING_RESPONSE") {
			return response.payload.success;
		}
		return false;
	}

	async generateRSAKeyPair(keySize: 1024 | 2048 | 4096) {
		const response = await this.sendRequest({
			type: "RSA_KEYGEN_REQUEST",
			requestId: this.generateId(),
			payload: { keySize },
		});

		if (response.type === "RSA_KEYGEN_RESPONSE") {
			const payload = response.payload as RSAKeyGenResponse["payload"];
			if (payload.success) {
				return {
					publicKey: payload.publicKeyJWK!,
					privateKey: payload.privateKeyJWK!,
					keySize: payload.keySize!,
					durationMs: payload.durationMs!,
				};
			}
			throw new Error(payload.error || "RSA key generation failed");
		}
		throw new Error("Unexpected response type");
	}

	async generateAESKey(keySize: 128 | 192 | 256) {
		const response = await this.sendRequest({
			type: "AES_KEYGEN_REQUEST",
			requestId: this.generateId(),
			payload: { keySize },
		});

		if (response.type === "AES_KEYGEN_RESPONSE") {
			const payload = response.payload as AESKeyGenResponse["payload"];
			if (payload.success) {
				return {
					keyBytes: payload.keyBytes!,
					iv: payload.iv!,
					durationMs: payload.durationMs!,
				};
			}
			throw new Error(payload.error || "AES key generation failed");
		}
		throw new Error("Unexpected response type");
	}

	async encryptRSA(publicKey: JsonWebKey, data: string) {
		const response = await this.sendRequest({
			type: "RSA_ENCRYPT_REQUEST",
			requestId: this.generateId(),
			payload: { publicKeyJWK: publicKey, data },
		});

		if (response.type === "RSA_ENCRYPT_RESPONSE") {
			const payload = response.payload as RSAEncryptResponse["payload"];
			if (payload.success) {
				return {
					encryptedData: payload.encryptedData!,
					durationMs: payload.durationMs!,
				};
			}
			throw new Error(payload.error || "RSA encryption failed");
		}
		throw new Error("Unexpected response type");
	}

	async decryptRSA(privateKey: JsonWebKey, encryptedData: string) {
		const response = await this.sendRequest({
			type: "RSA_DECRYPT_REQUEST",
			requestId: this.generateId(),
			payload: { privateKeyJWK: privateKey, encryptedData },
		});

		if (response.type === "RSA_DECRYPT_RESPONSE") {
			const payload = response.payload as RSADecryptResponse["payload"];
			if (payload.success) {
				return {
					decryptedData: payload.decryptedData!,
					durationMs: payload.durationMs!,
				};
			}
			throw new Error(payload.error || "RSA decryption failed");
		}
		throw new Error("Unexpected response type");
	}

	async encryptAES(keyBytes: string, data: string) {
		const response = await this.sendRequest({
			type: "AES_ENCRYPT_REQUEST",
			requestId: this.generateId(),
			payload: { keyBytes, data },
		});

		if (response.type === "AES_ENCRYPT_RESPONSE") {
			const payload = response.payload as AESEncryptResponse["payload"];
			if (payload.success) {
				return {
					ciphertext: payload.ciphertext!,
					iv: payload.iv!,
					authTag: payload.authTag,
					durationMs: payload.durationMs!,
				};
			}
			throw new Error(payload.error || "AES encryption failed");
		}
		throw new Error("Unexpected response type");
	}

	async decryptAES(keyBytes: string, ciphertext: string, iv: string, authTag?: string) {
		const response = await this.sendRequest({
			type: "AES_DECRYPT_REQUEST",
			requestId: this.generateId(),
			payload: { keyBytes, ciphertext, iv, authTag },
		});

		if (response.type === "AES_DECRYPT_RESPONSE") {
			const payload = response.payload as AESDecryptResponse["payload"];
			if (payload.success) {
				return {
					decryptedData: payload.decryptedData!,
					durationMs: payload.durationMs!,
				};
			}
			throw new Error(payload.error || "AES decryption failed");
		}
		throw new Error("Unexpected response type");
	}

	async runAESRoundOutputs(plainTextHex: string, keyHex: string) {
		const response = await this.sendRequest({
			type: "AES_ROUND_OUTPUTS_REQUEST",
			requestId: this.generateId(),
			payload: { keyBytes: keyHex, plainTextBytes: plainTextHex },
		});

		if (response.type === "AES_ROUND_OUTPUTS_RESPONSE") {
			const payload = response.payload as AESRoundOutputsResponse["payload"];
			if (payload.success) {
				return {
					inputState: payload.inputState!,
					subBytesState: payload.subBytesState!,
					shiftRowsState: payload.shiftRowsState!,
					mixColumnsState: payload.mixColumnsState!,
					addRoundKeyState: payload.addRoundKeyState!,
					roundKey: payload.roundKey!,
				};
			}
			throw new Error(payload.error || "AES round outputs failed");
		}
		throw new Error("Unexpected response type");
	}

	terminate(): void {
		this.worker.terminate();
		this.pendingRequests.clear();
	}

	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	}
}
