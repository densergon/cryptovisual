import type { RSAKeySize } from "../crypto-engine/types";

export interface RSAKeyGenRequest {
	type: "RSA_KEYGEN_REQUEST";
	requestId: string;
	payload: {
		keySize: RSAKeySize;
	};
}

export interface RSAKeyGenResponse {
	type: "RSA_KEYGEN_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		publicKeyJWK?: JsonWebKey;
		privateKeyJWK?: JsonWebKey;
		keySize?: number;
		durationMs?: number;
		error?: string;
	};
}

export interface RSAEncryptRequest {
	type: "RSA_ENCRYPT_REQUEST";
	requestId: string;
	payload: {
		publicKeyJWK: JsonWebKey;
		data: string;
	};
}

export interface RSAEncryptResponse {
	type: "RSA_ENCRYPT_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		encryptedData?: string;
		durationMs?: number;
		error?: string;
	};
}

export interface RSADecryptRequest {
	type: "RSA_DECRYPT_REQUEST";
	requestId: string;
	payload: {
		privateKeyJWK: JsonWebKey;
		encryptedData: string;
	};
}

export interface RSADecryptResponse {
	type: "RSA_DECRYPT_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		decryptedData?: string;
		durationMs?: number;
		error?: string;
	};
}

export interface AESKeyGenRequest {
	type: "AES_KEYGEN_REQUEST";
	requestId: string;
	payload: {
		keySize: 128 | 192 | 256;
	};
}

export interface AESKeyGenResponse {
	type: "AES_KEYGEN_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		keyBytes?: string;
		iv?: string;
		durationMs?: number;
		error?: string;
	};
}

export interface AESEncryptRequest {
	type: "AES_ENCRYPT_REQUEST";
	requestId: string;
	payload: {
		keyBytes: string;
		data: string;
	};
}

export interface AESEncryptResponse {
	type: "AES_ENCRYPT_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		ciphertext?: string;
		iv?: string;
		authTag?: string;
		durationMs?: number;
		error?: string;
	};
}

export interface AESDecryptRequest {
	type: "AES_DECRYPT_REQUEST";
	requestId: string;
	payload: {
		keyBytes: string;
		ciphertext: string;
		iv: string;
	};
}

export interface AESDecryptResponse {
	type: "AES_DECRYPT_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		decryptedData?: string;
		durationMs?: number;
		error?: string;
	};
}

export interface PingRequest {
	type: "PING_REQUEST";
	requestId: string;
}

export interface PingResponse {
	type: "PING_RESPONSE";
	requestId: string;
	payload: {
		success: true;
		timestamp: number;
	};
}

export interface AESRoundOutputsRequest {
	type: "AES_ROUND_OUTPUTS_REQUEST";
	requestId: string;
	payload: {
		keyBytes: string;
		plainTextBytes: string;
	};
}

export interface AESRoundOutputsResponse {
	type: "AES_ROUND_OUTPUTS_RESPONSE";
	requestId: string;
	payload: {
		success: boolean;
		inputState?: string;
		subBytesState?: string;
		shiftRowsState?: string;
		mixColumnsState?: string;
		addRoundKeyState?: string;
		roundKey?: string;
		error?: string;
	};
}

export type CryptoRequest =
	| RSAKeyGenRequest
	| RSAEncryptRequest
	| RSADecryptRequest
	| AESKeyGenRequest
	| AESEncryptRequest
	| AESDecryptRequest
	| AESRoundOutputsRequest
	| PingRequest;

export type CryptoResponse =
	| RSAKeyGenResponse
	| RSAEncryptResponse
	| RSADecryptResponse
	| AESKeyGenResponse
	| AESEncryptResponse
	| AESDecryptResponse
	| AESRoundOutputsResponse
	| PingResponse;

export function generateRequestId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
