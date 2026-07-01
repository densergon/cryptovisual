import { AESEngine, RSAEngine } from "../crypto-engine";
import { AESVisualEngine } from "../crypto-engine/aes-visual";
import type { CryptoRequest, CryptoResponse } from "./crypto.protocol";

self.onmessage = async (event: MessageEvent<CryptoRequest>) => {
	const request = event.data;

	try {
		switch (request.type) {
			case "PING_REQUEST": {
				const response: CryptoResponse = {
					type: "PING_RESPONSE",
					requestId: request.requestId,
					payload: {
						success: true,
						timestamp: Date.now(),
					},
				};
				self.postMessage(response);
				break;
			}

			case "RSA_KEYGEN_REQUEST": {
				const result = await RSAEngine.generateKeyPair({
					keySize: request.payload.keySize,
				});

				const response: CryptoResponse = {
					type: "RSA_KEYGEN_RESPONSE",
					requestId: request.requestId,
					payload: result.success
						? {
								success: true,
								publicKeyJWK: result.data?.publicKeyJWK,
								privateKeyJWK: result.data?.privateKeyJWK,
								keySize: result.data?.keySize,
								durationMs: result.durationMs,
							}
						: {
								success: false,
								error: result.error,
							},
				};
				self.postMessage(response);
				break;
			}

			case "RSA_ENCRYPT_REQUEST": {
				const publicKey = await RSAEngine.importPublicKey(
					request.payload.publicKeyJWK,
				);
				const data = new TextEncoder().encode(request.payload.data);

				const result = await RSAEngine.encrypt({
					data,
					publicKey,
				});

				const response: CryptoResponse = {
					type: "RSA_ENCRYPT_RESPONSE",
					requestId: request.requestId,
					payload: result.success
						? {
								success: true,
								encryptedData: AESEngine.arrayBufferToHex(
									(result.data! as Uint8Array).buffer as ArrayBuffer,
								),
								durationMs: result.durationMs,
							}
						: {
								success: false,
								error: result.error,
							},
				};
				self.postMessage(response);
				break;
			}

			case "RSA_DECRYPT_REQUEST": {
				const privateKey = await RSAEngine.importPrivateKey(
					request.payload.privateKeyJWK,
				);
				const encryptedData = AESEngine.hexToArrayBuffer(
					request.payload.encryptedData,
				);

				const result = await RSAEngine.decrypt({
					encryptedData: new Uint8Array(encryptedData),
					privateKey,
				});

				const response: CryptoResponse = {
					type: "RSA_DECRYPT_RESPONSE",
					requestId: request.requestId,
					payload: result.success
						? {
								success: true,
								decryptedData: new TextDecoder().decode(result.data),
								durationMs: result.durationMs,
							}
						: {
								success: false,
								error: result.error,
							},
				};
				self.postMessage(response);
				break;
			}

			case "AES_KEYGEN_REQUEST": {
				const result = await AESEngine.generateKey({
					keySize: request.payload.keySize,
				});

				const response: CryptoResponse = {
					type: "AES_KEYGEN_RESPONSE",
					requestId: request.requestId,
					payload: result.success
						? {
								success: true,
								keyBytes: AESEngine.arrayBufferToHex(
									result.data?.keyBytes.buffer as ArrayBuffer,
								),
								iv: AESEngine.arrayBufferToHex(
									result.data?.iv.buffer as ArrayBuffer,
								),
								durationMs: result.durationMs,
							}
						: {
								success: false,
								error: result.error,
							},
				};
				self.postMessage(response);
				break;
			}

			case "AES_ENCRYPT_REQUEST": {
				const keyBytes = AESEngine.hexToArrayBuffer(request.payload.keyBytes);
				const key = await AESEngine.importKey(keyBytes);
				const data = new TextEncoder().encode(request.payload.data);

				const result = await AESEngine.encrypt({
					data,
					key,
				});

				const response: CryptoResponse = {
					type: "AES_ENCRYPT_RESPONSE",
					requestId: request.requestId,
					payload: result.success
						? {
								success: true,
								ciphertext: AESEngine.arrayBufferToHex(
									(result.data?.ciphertext as Uint8Array).buffer as ArrayBuffer,
								),
								iv: AESEngine.arrayBufferToHex(
									(result.data?.iv as Uint8Array).buffer as ArrayBuffer,
								),
								authTag: result.data?.authTag
									? AESEngine.arrayBufferToHex(
											(result.data?.authTag as Uint8Array)
												.buffer as ArrayBuffer,
										)
									: undefined,
								durationMs: result.durationMs,
							}
						: {
								success: false,
								error: result.error,
							},
				};
				self.postMessage(response);
				break;
			}

			case "AES_DECRYPT_REQUEST": {
				const keyBytes = AESEngine.hexToArrayBuffer(request.payload.keyBytes);
				const key = await AESEngine.importKey(keyBytes);
				const ciphertext = AESEngine.hexToArrayBuffer(
					request.payload.ciphertext,
				);
				const iv = AESEngine.hexToArrayBuffer(request.payload.iv);

				const result = await AESEngine.decrypt({
					encryptedData: new Uint8Array(ciphertext),
					key,
					iv: new Uint8Array(iv),
				});

				const response: CryptoResponse = {
					type: "AES_DECRYPT_RESPONSE",
					requestId: request.requestId,
					payload: result.success
						? {
								success: true,
								decryptedData: new TextDecoder().decode(result.data),
								durationMs: result.durationMs,
							}
						: {
								success: false,
								error: result.error,
							},
				};
				self.postMessage(response);
				break;
			}

			case "AES_ROUND_OUTPUTS_REQUEST": {
				const keyBytes = AESEngine.hexToArrayBuffer(request.payload.keyBytes);
				const plainTextBytes = AESEngine.hexToArrayBuffer(
					request.payload.plainTextBytes,
				);
				const key = new Uint8Array(keyBytes);
				const plaintext = new Uint8Array(plainTextBytes);

				const roundResult = AESVisualEngine.runRound1(plaintext, key);

				const toHexString = (arr: Uint8Array) =>
					Array.from(arr)
						.map((b) => b.toString(16).padStart(2, "0"))
						.join("");

				const response: CryptoResponse = {
					type: "AES_ROUND_OUTPUTS_RESPONSE",
					requestId: request.requestId,
					payload: {
						success: true,
						inputState: toHexString(roundResult.inputState),
						subBytesState: toHexString(roundResult.subBytesState),
						shiftRowsState: toHexString(roundResult.shiftRowsState),
						mixColumnsState: toHexString(roundResult.mixColumnsState),
						addRoundKeyState: toHexString(roundResult.addRoundKeyState),
						roundKey: toHexString(roundResult.roundKey),
					},
				};
				self.postMessage(response);
				break;
			}

			default: {
				const _exhaustive: never = request;
				throw new Error(
					`Unknown request type: ${(_exhaustive as CryptoRequest).type}`,
				);
			}
		}
	} catch (error) {
		const responseTypeMap: Partial<
			Record<CryptoRequest["type"], CryptoResponse["type"]>
		> = {
			PING_REQUEST: "PING_RESPONSE",
			RSA_KEYGEN_REQUEST: "RSA_KEYGEN_RESPONSE",
			RSA_ENCRYPT_REQUEST: "RSA_ENCRYPT_RESPONSE",
			RSA_DECRYPT_REQUEST: "RSA_DECRYPT_RESPONSE",
			AES_KEYGEN_REQUEST: "AES_KEYGEN_RESPONSE",
			AES_ENCRYPT_REQUEST: "AES_ENCRYPT_RESPONSE",
			AES_DECRYPT_REQUEST: "AES_DECRYPT_RESPONSE",
			AES_ROUND_OUTPUTS_REQUEST: "AES_ROUND_OUTPUTS_RESPONSE",
		};
		const responseType = responseTypeMap[request.type] ?? "PING_RESPONSE";
		const errorResponse: CryptoResponse = {
			type: responseType,
			requestId: (request as CryptoRequest).requestId,
			payload: {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			} as never,
		};
		self.postMessage(errorResponse);
	}
};
