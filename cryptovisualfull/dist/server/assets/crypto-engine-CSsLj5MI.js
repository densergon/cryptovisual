//#region src/workers/worker-client.ts
var CryptoWorkerClient = class {
	worker;
	pendingRequests = /* @__PURE__ */ new Map();
	constructor() {
		this.worker = new Worker(new URL("./crypto.worker.ts", import.meta.url), { type: "module" });
		this.worker.onmessage = (event) => {
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
				pending.reject(/* @__PURE__ */ new Error("Worker error"));
			});
			this.pendingRequests.clear();
		};
	}
	sendRequest(request) {
		return new Promise((resolve, reject) => {
			this.pendingRequests.set(request.requestId, {
				resolve,
				reject
			});
			this.worker.postMessage(request);
		});
	}
	async ping() {
		const response = await this.sendRequest({
			type: "PING_REQUEST",
			requestId: this.generateId()
		});
		if (response.type === "PING_RESPONSE") return response.payload.success;
		return false;
	}
	async generateRSAKeyPair(keySize) {
		const response = await this.sendRequest({
			type: "RSA_KEYGEN_REQUEST",
			requestId: this.generateId(),
			payload: { keySize }
		});
		if (response.type === "RSA_KEYGEN_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				publicKey: payload.publicKeyJWK,
				privateKey: payload.privateKeyJWK,
				keySize: payload.keySize,
				durationMs: payload.durationMs
			};
			throw new Error(payload.error || "RSA key generation failed");
		}
		throw new Error("Unexpected response type");
	}
	async generateAESKey(keySize) {
		const response = await this.sendRequest({
			type: "AES_KEYGEN_REQUEST",
			requestId: this.generateId(),
			payload: { keySize }
		});
		if (response.type === "AES_KEYGEN_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				keyBytes: payload.keyBytes,
				iv: payload.iv,
				durationMs: payload.durationMs
			};
			throw new Error(payload.error || "AES key generation failed");
		}
		throw new Error("Unexpected response type");
	}
	async encryptRSA(publicKey, data) {
		const response = await this.sendRequest({
			type: "RSA_ENCRYPT_REQUEST",
			requestId: this.generateId(),
			payload: {
				publicKeyJWK: publicKey,
				data
			}
		});
		if (response.type === "RSA_ENCRYPT_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				encryptedData: payload.encryptedData,
				durationMs: payload.durationMs
			};
			throw new Error(payload.error || "RSA encryption failed");
		}
		throw new Error("Unexpected response type");
	}
	async decryptRSA(privateKey, encryptedData) {
		const response = await this.sendRequest({
			type: "RSA_DECRYPT_REQUEST",
			requestId: this.generateId(),
			payload: {
				privateKeyJWK: privateKey,
				encryptedData
			}
		});
		if (response.type === "RSA_DECRYPT_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				decryptedData: payload.decryptedData,
				durationMs: payload.durationMs
			};
			throw new Error(payload.error || "RSA decryption failed");
		}
		throw new Error("Unexpected response type");
	}
	async encryptAES(keyBytes, data) {
		const response = await this.sendRequest({
			type: "AES_ENCRYPT_REQUEST",
			requestId: this.generateId(),
			payload: {
				keyBytes,
				data
			}
		});
		if (response.type === "AES_ENCRYPT_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				ciphertext: payload.ciphertext,
				iv: payload.iv,
				authTag: payload.authTag,
				durationMs: payload.durationMs
			};
			throw new Error(payload.error || "AES encryption failed");
		}
		throw new Error("Unexpected response type");
	}
	async decryptAES(keyBytes, ciphertext, iv, authTag) {
		const response = await this.sendRequest({
			type: "AES_DECRYPT_REQUEST",
			requestId: this.generateId(),
			payload: {
				keyBytes,
				ciphertext,
				iv,
				authTag
			}
		});
		if (response.type === "AES_DECRYPT_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				decryptedData: payload.decryptedData,
				durationMs: payload.durationMs
			};
			throw new Error(payload.error || "AES decryption failed");
		}
		throw new Error("Unexpected response type");
	}
	async runAESRoundOutputs(plainTextHex, keyHex) {
		const response = await this.sendRequest({
			type: "AES_ROUND_OUTPUTS_REQUEST",
			requestId: this.generateId(),
			payload: {
				keyBytes: keyHex,
				plainTextBytes: plainTextHex
			}
		});
		if (response.type === "AES_ROUND_OUTPUTS_RESPONSE") {
			const payload = response.payload;
			if (payload.success) return {
				inputState: payload.inputState,
				subBytesState: payload.subBytesState,
				shiftRowsState: payload.shiftRowsState,
				mixColumnsState: payload.mixColumnsState,
				addRoundKeyState: payload.addRoundKeyState,
				roundKey: payload.roundKey
			};
			throw new Error(payload.error || "AES round outputs failed");
		}
		throw new Error("Unexpected response type");
	}
	terminate() {
		this.worker.terminate();
		this.pendingRequests.clear();
	}
	generateId() {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	}
};
//#endregion
//#region src/workers/brute-force-client.ts
var BruteForceWorkerClient = class {
	worker;
	pendingRequests = /* @__PURE__ */ new Map();
	constructor() {
		this.worker = new Worker(new URL("./brute-force.worker.ts", import.meta.url), { type: "module" });
		this.worker.onmessage = (event) => {
			const response = event.data;
			const pending = this.pendingRequests.get(response.requestId);
			if (!pending) return;
			if (response.type === "BRUTE_FORCE_PROGRESS") {
				pending.onProgress?.(response.payload);
				if (response.payload.found) return;
			}
			if (response.type === "BRUTE_FORCE_COMPLETE") {
				pending.resolve(response);
				this.pendingRequests.delete(response.requestId);
			}
		};
		this.worker.onerror = (error) => {
			console.error("BruteForce worker error:", error);
			this.pendingRequests.forEach((pending) => {
				pending.reject(/* @__PURE__ */ new Error("BruteForce worker error"));
			});
			this.pendingRequests.clear();
		};
	}
	async startBruteForce(modulus, onProgress) {
		const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		return new Promise((resolve, reject) => {
			this.pendingRequests.set(requestId, {
				resolve,
				reject,
				onProgress
			});
			const request = {
				type: "BRUTE_FORCE_START",
				requestId,
				payload: { modulus }
			};
			this.worker.postMessage(request);
		}).then((response) => response.payload);
	}
	terminate() {
		this.worker.terminate();
		this.pendingRequests.clear();
	}
};
//#endregion
//#region src/crypto-engine/aes-visual.ts
var AESVisualEngine = class AESVisualEngine {
	static SBOX = new Uint8Array([
		99,
		124,
		119,
		123,
		242,
		107,
		111,
		197,
		48,
		1,
		103,
		43,
		254,
		215,
		171,
		118,
		202,
		130,
		201,
		125,
		250,
		89,
		71,
		240,
		173,
		212,
		162,
		175,
		156,
		164,
		114,
		192,
		183,
		253,
		147,
		38,
		54,
		63,
		247,
		204,
		52,
		165,
		229,
		241,
		113,
		216,
		49,
		21,
		4,
		199,
		35,
		195,
		24,
		150,
		5,
		154,
		7,
		18,
		128,
		226,
		235,
		39,
		178,
		117,
		9,
		131,
		44,
		26,
		27,
		110,
		90,
		160,
		82,
		59,
		214,
		179,
		41,
		227,
		47,
		132,
		83,
		209,
		0,
		237,
		32,
		252,
		177,
		91,
		106,
		203,
		190,
		57,
		74,
		76,
		88,
		207,
		208,
		239,
		170,
		251,
		67,
		77,
		51,
		133,
		69,
		249,
		2,
		127,
		80,
		60,
		159,
		168,
		81,
		163,
		64,
		143,
		146,
		157,
		56,
		245,
		188,
		182,
		218,
		33,
		16,
		255,
		243,
		210,
		205,
		12,
		19,
		236,
		95,
		151,
		68,
		23,
		196,
		167,
		126,
		61,
		100,
		93,
		25,
		115,
		96,
		129,
		79,
		220,
		34,
		42,
		144,
		136,
		70,
		238,
		184,
		20,
		222,
		94,
		11,
		219,
		224,
		50,
		58,
		10,
		73,
		6,
		36,
		92,
		194,
		211,
		172,
		98,
		145,
		149,
		228,
		121,
		231,
		200,
		55,
		109,
		141,
		213,
		78,
		169,
		108,
		86,
		244,
		234,
		101,
		122,
		174,
		8,
		186,
		120,
		37,
		46,
		28,
		166,
		180,
		198,
		232,
		221,
		116,
		31,
		75,
		189,
		139,
		138,
		112,
		62,
		181,
		102,
		72,
		3,
		246,
		14,
		97,
		53,
		87,
		185,
		134,
		193,
		29,
		158,
		225,
		248,
		152,
		17,
		105,
		217,
		142,
		148,
		155,
		30,
		135,
		233,
		206,
		85,
		40,
		223,
		140,
		161,
		137,
		13,
		191,
		230,
		66,
		104,
		65,
		153,
		45,
		15,
		176,
		84,
		187,
		22
	]);
	static gmul(a, b) {
		let p = 0;
		for (let counter = 0; counter < 8; counter++) {
			if ((b & 1) !== 0) p ^= a;
			const hiBitSet = (a & 128) !== 0;
			a <<= 1;
			if (hiBitSet) a ^= 27;
			b >>= 1;
		}
		return p & 255;
	}
	static expandKey(key) {
		const roundKeys = [];
		for (let i = 0; i < 15; i++) roundKeys.push(/* @__PURE__ */ new Uint8Array(16));
		const rcon = [
			1,
			2,
			4,
			8,
			16,
			32,
			64,
			128,
			27,
			54
		];
		const words = /* @__PURE__ */ new Uint32Array(60);
		for (let i = 0; i < 8; i++) words[i] = key[i * 4] << 24 | key[i * 4 + 1] << 16 | key[i * 4 + 2] << 8 | key[i * 4 + 3];
		for (let i = 8; i < 60; i++) {
			let temp = words[i - 1];
			if (i % 8 === 0) {
				temp = temp << 8 | temp >>> 24;
				temp = AESVisualEngine.SBOX[temp >>> 24 & 255] << 24 | AESVisualEngine.SBOX[temp >>> 16 & 255] << 16 | AESVisualEngine.SBOX[temp >>> 8 & 255] << 8 | AESVisualEngine.SBOX[temp & 255];
				temp ^= rcon[i / 8 - 1] << 24;
			} else if (i % 8 === 4) temp = AESVisualEngine.SBOX[temp >>> 24 & 255] << 24 | AESVisualEngine.SBOX[temp >>> 16 & 255] << 16 | AESVisualEngine.SBOX[temp >>> 8 & 255] << 8 | AESVisualEngine.SBOX[temp & 255];
			words[i] = words[i - 8] ^ temp;
		}
		for (let r = 0; r < 15; r++) for (let w = 0; w < 4; w++) {
			const word = words[r * 4 + w];
			roundKeys[r][w * 4] = word >>> 24 & 255;
			roundKeys[r][w * 4 + 1] = word >>> 16 & 255;
			roundKeys[r][w * 4 + 2] = word >>> 8 & 255;
			roundKeys[r][w * 4 + 3] = word & 255;
		}
		return roundKeys;
	}
	static encryptBlock(plaintext, key) {
		const roundKeys = AESVisualEngine.expandKey(key);
		let state = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) state[i] = plaintext[i] ^ roundKeys[0][i];
		for (let round = 1; round < 14; round++) {
			const afterSubBytes = /* @__PURE__ */ new Uint8Array(16);
			for (let i = 0; i < 16; i++) afterSubBytes[i] = AESVisualEngine.SBOX[state[i]];
			const afterShiftRows = /* @__PURE__ */ new Uint8Array(16);
			afterShiftRows[0] = afterSubBytes[0];
			afterShiftRows[4] = afterSubBytes[4];
			afterShiftRows[8] = afterSubBytes[8];
			afterShiftRows[12] = afterSubBytes[12];
			afterShiftRows[1] = afterSubBytes[5];
			afterShiftRows[5] = afterSubBytes[9];
			afterShiftRows[9] = afterSubBytes[13];
			afterShiftRows[13] = afterSubBytes[1];
			afterShiftRows[2] = afterSubBytes[10];
			afterShiftRows[6] = afterSubBytes[14];
			afterShiftRows[10] = afterSubBytes[2];
			afterShiftRows[14] = afterSubBytes[6];
			afterShiftRows[3] = afterSubBytes[15];
			afterShiftRows[7] = afterSubBytes[3];
			afterShiftRows[11] = afterSubBytes[7];
			afterShiftRows[15] = afterSubBytes[11];
			const afterMixColumns = /* @__PURE__ */ new Uint8Array(16);
			for (let col = 0; col < 4; col++) {
				const s0 = afterShiftRows[col * 4];
				const s1 = afterShiftRows[col * 4 + 1];
				const s2 = afterShiftRows[col * 4 + 2];
				const s3 = afterShiftRows[col * 4 + 3];
				afterMixColumns[col * 4] = (AESVisualEngine.gmul(s0, 2) ^ AESVisualEngine.gmul(s1, 3) ^ s2 ^ s3) & 255;
				afterMixColumns[col * 4 + 1] = (s0 ^ AESVisualEngine.gmul(s1, 2) ^ AESVisualEngine.gmul(s2, 3) ^ s3) & 255;
				afterMixColumns[col * 4 + 2] = (s0 ^ s1 ^ AESVisualEngine.gmul(s2, 2) ^ AESVisualEngine.gmul(s3, 3)) & 255;
				afterMixColumns[col * 4 + 3] = (AESVisualEngine.gmul(s0, 3) ^ s1 ^ s2 ^ AESVisualEngine.gmul(s3, 2)) & 255;
			}
			state = /* @__PURE__ */ new Uint8Array(16);
			for (let i = 0; i < 16; i++) state[i] = afterMixColumns[i] ^ roundKeys[round][i];
		}
		const finalSubBytes = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) finalSubBytes[i] = AESVisualEngine.SBOX[state[i]];
		const finalShiftRows = /* @__PURE__ */ new Uint8Array(16);
		finalShiftRows[0] = finalSubBytes[0];
		finalShiftRows[4] = finalSubBytes[4];
		finalShiftRows[8] = finalSubBytes[8];
		finalShiftRows[12] = finalSubBytes[12];
		finalShiftRows[1] = finalSubBytes[5];
		finalShiftRows[5] = finalSubBytes[9];
		finalShiftRows[9] = finalSubBytes[13];
		finalShiftRows[13] = finalSubBytes[1];
		finalShiftRows[2] = finalSubBytes[10];
		finalShiftRows[6] = finalSubBytes[14];
		finalShiftRows[10] = finalSubBytes[2];
		finalShiftRows[14] = finalSubBytes[6];
		finalShiftRows[3] = finalSubBytes[15];
		finalShiftRows[7] = finalSubBytes[3];
		finalShiftRows[11] = finalSubBytes[7];
		finalShiftRows[15] = finalSubBytes[11];
		const ciphertext = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) ciphertext[i] = finalShiftRows[i] ^ roundKeys[14][i];
		return ciphertext;
	}
	static runRound1(plaintext, key) {
		const roundKeys = AESVisualEngine.expandKey(key);
		const key0 = roundKeys[0];
		const inputState = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) inputState[i] = plaintext[i] ^ key0[i];
		const subBytesState = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) subBytesState[i] = AESVisualEngine.SBOX[inputState[i]];
		const shiftRowsState = /* @__PURE__ */ new Uint8Array(16);
		shiftRowsState[0] = subBytesState[0];
		shiftRowsState[4] = subBytesState[4];
		shiftRowsState[8] = subBytesState[8];
		shiftRowsState[12] = subBytesState[12];
		shiftRowsState[1] = subBytesState[5];
		shiftRowsState[5] = subBytesState[9];
		shiftRowsState[9] = subBytesState[13];
		shiftRowsState[13] = subBytesState[1];
		shiftRowsState[2] = subBytesState[10];
		shiftRowsState[6] = subBytesState[14];
		shiftRowsState[10] = subBytesState[2];
		shiftRowsState[14] = subBytesState[6];
		shiftRowsState[3] = subBytesState[15];
		shiftRowsState[7] = subBytesState[3];
		shiftRowsState[11] = subBytesState[7];
		shiftRowsState[15] = subBytesState[11];
		const mixColumnsState = /* @__PURE__ */ new Uint8Array(16);
		for (let col = 0; col < 4; col++) {
			const s0 = shiftRowsState[col * 4];
			const s1 = shiftRowsState[col * 4 + 1];
			const s2 = shiftRowsState[col * 4 + 2];
			const s3 = shiftRowsState[col * 4 + 3];
			mixColumnsState[col * 4] = (AESVisualEngine.gmul(s0, 2) ^ AESVisualEngine.gmul(s1, 3) ^ s2 ^ s3) & 255;
			mixColumnsState[col * 4 + 1] = (s0 ^ AESVisualEngine.gmul(s1, 2) ^ AESVisualEngine.gmul(s2, 3) ^ s3) & 255;
			mixColumnsState[col * 4 + 2] = (s0 ^ s1 ^ AESVisualEngine.gmul(s2, 2) ^ AESVisualEngine.gmul(s3, 3)) & 255;
			mixColumnsState[col * 4 + 3] = (AESVisualEngine.gmul(s0, 3) ^ s1 ^ s2 ^ AESVisualEngine.gmul(s3, 2)) & 255;
		}
		const addRoundKeyState = /* @__PURE__ */ new Uint8Array(16);
		const key1 = roundKeys[1];
		for (let i = 0; i < 16; i++) addRoundKeyState[i] = mixColumnsState[i] ^ key1[i];
		return {
			inputState,
			subBytesState,
			shiftRowsState,
			mixColumnsState,
			addRoundKeyState,
			roundKey: key1
		};
	}
};
//#endregion
//#region src/crypto-engine/rsa.ts
var AESEngine = class {
	static async generateKey(params) {
		const start = performance.now();
		try {
			const key = await crypto.subtle.generateKey({
				name: "AES-GCM",
				length: params.keySize
			}, true, ["encrypt", "decrypt"]);
			const keyBytes = await crypto.subtle.exportKey("raw", key);
			const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
			return {
				success: true,
				data: {
					key,
					keyBytes: new Uint8Array(keyBytes),
					iv,
					generatedAt: Date.now()
				},
				durationMs: performance.now() - start
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start
			};
		}
	}
	static async encrypt(params) {
		const start = performance.now();
		const iv = params.iv || crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
		try {
			const encrypted = await crypto.subtle.encrypt({
				name: "AES-GCM",
				iv
			}, params.key, params.data);
			const ciphertext = new Uint8Array(encrypted);
			const authTag = ciphertext.slice(-16);
			return {
				success: true,
				data: {
					ciphertext: ciphertext.slice(0, -16),
					iv,
					authTag
				},
				durationMs: performance.now() - start
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start
			};
		}
	}
	static async decrypt(params) {
		const start = performance.now();
		try {
			const authTag = params.authTag;
			const decryptData = authTag ? (() => {
				const combined = new Uint8Array(params.encryptedData.length + authTag.length);
				combined.set(params.encryptedData);
				combined.set(authTag, params.encryptedData.length);
				return combined;
			})() : params.encryptedData;
			const decrypted = await crypto.subtle.decrypt({
				name: "AES-GCM",
				iv: params.iv
			}, params.key, decryptData);
			return {
				success: true,
				data: new Uint8Array(decrypted),
				durationMs: performance.now() - start
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				durationMs: performance.now() - start
			};
		}
	}
	static arrayBufferToHex(buffer) {
		return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	static hexToArrayBuffer(hex) {
		const bytes = new Uint8Array(hex.length / 2);
		for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
		return bytes.buffer;
	}
	static async importKey(keyBytes) {
		return await crypto.subtle.importKey("raw", keyBytes, {
			name: "AES-GCM",
			length: keyBytes.byteLength * 8
		}, true, ["encrypt", "decrypt"]);
	}
};
//#endregion
export { CryptoWorkerClient as i, AESVisualEngine as n, BruteForceWorkerClient as r, AESEngine as t };
