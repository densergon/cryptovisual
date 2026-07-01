export interface RSAKeyPair {
	publicKey: CryptoKey;
	privateKey: CryptoKey;
	publicKeyJWK: JsonWebKey;
	privateKeyJWK: JsonWebKey;
	keySize: number;
	generatedAt: number;
	durationMs: number;
}

export interface RSAKeyPairExported {
	publicKey: JsonWebKey;
	privateKey: JsonWebKey;
	keySize: number;
	generatedAt: number;
	durationMs: number;
}

export interface AESKey {
	key: CryptoKey;
	keyBytes: Uint8Array;
	iv: Uint8Array;
	generatedAt: number;
}

export interface AESKeyExported {
	keyBytes: string;
	iv: string;
	generatedAt: number;
}

export interface EncryptedData {
	ciphertext: Uint8Array;
	iv: Uint8Array;
	authTag?: Uint8Array;
}

export interface EncryptedDataExported {
	ciphertext: string;
	iv: string;
	authTag?: string;
}

export interface RSAEncryptParams {
	data: Uint8Array;
	publicKey: CryptoKey;
}

export interface RSADecryptParams {
	encryptedData: Uint8Array;
	privateKey: CryptoKey;
}

export interface AESEncryptParams {
	data: Uint8Array;
	key: CryptoKey;
	iv?: Uint8Array;
}

export interface AESDecryptParams {
	encryptedData: Uint8Array;
	key: CryptoKey;
	iv: Uint8Array;
}

export interface CryptoResult<T> {
	success: boolean;
	data?: T;
	error?: string;
	durationMs: number;
}

export interface RSAKeyGenParams {
	keySize: number;
}

export interface AESKeyGenParams {
	keySize: 128 | 192 | 256;
}

export type RSAKeySize = 1024 | 2048 | 4096;
