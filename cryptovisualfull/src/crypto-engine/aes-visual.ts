export class AESVisualEngine {
	static readonly SBOX = new Uint8Array([
		0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
		0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
		0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
		0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
		0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
		0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
		0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
		0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
		0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
		0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
		0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
		0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
		0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
		0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
		0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
		0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
		0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
		0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
		0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
		0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
		0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
		0xb0, 0x54, 0xbb, 0x16,
	]);

	static gmul(a: number, b: number): number {
		let p = 0;
		for (let counter = 0; counter < 8; counter++) {
			if ((b & 1) !== 0) {
				p ^= a;
			}
			const hiBitSet = (a & 0x80) !== 0;
			a <<= 1;
			if (hiBitSet) {
				a ^= 0x1b;
			}
			b >>= 1;
		}
		return p & 0xff;
	}

	static expandKey(key: Uint8Array): Uint8Array[] {
		const roundKeys: Uint8Array[] = [];
		for (let i = 0; i < 15; i++) {
			roundKeys.push(new Uint8Array(16));
		}

		const rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

		const words = new Uint32Array(60);

		for (let i = 0; i < 8; i++) {
			words[i] =
				(key[i * 4] << 24) |
				(key[i * 4 + 1] << 16) |
				(key[i * 4 + 2] << 8) |
				key[i * 4 + 3];
		}

		for (let i = 8; i < 60; i++) {
			let temp = words[i - 1];
			if (i % 8 === 0) {
				temp = (temp << 8) | (temp >>> 24);
				temp =
					(AESVisualEngine.SBOX[(temp >>> 24) & 0xff] << 24) |
					(AESVisualEngine.SBOX[(temp >>> 16) & 0xff] << 16) |
					(AESVisualEngine.SBOX[(temp >>> 8) & 0xff] << 8) |
					AESVisualEngine.SBOX[temp & 0xff];
				temp ^= rcon[i / 8 - 1] << 24;
			} else if (i % 8 === 4) {
				temp =
					(AESVisualEngine.SBOX[(temp >>> 24) & 0xff] << 24) |
					(AESVisualEngine.SBOX[(temp >>> 16) & 0xff] << 16) |
					(AESVisualEngine.SBOX[(temp >>> 8) & 0xff] << 8) |
					AESVisualEngine.SBOX[temp & 0xff];
			}
			words[i] = words[i - 8] ^ temp;
		}

		for (let r = 0; r < 15; r++) {
			for (let w = 0; w < 4; w++) {
				const word = words[r * 4 + w];
				roundKeys[r][w * 4] = (word >>> 24) & 0xff;
				roundKeys[r][w * 4 + 1] = (word >>> 16) & 0xff;
				roundKeys[r][w * 4 + 2] = (word >>> 8) & 0xff;
				roundKeys[r][w * 4 + 3] = word & 0xff;
			}
		}

		return roundKeys;
	}

	static encryptBlock(plaintext: Uint8Array, key: Uint8Array): Uint8Array {
		const roundKeys = AESVisualEngine.expandKey(key);

		let state = new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			state[i] = plaintext[i] ^ roundKeys[0][i];
		}

		for (let round = 1; round < 14; round++) {
			const afterSubBytes = new Uint8Array(16);
			for (let i = 0; i < 16; i++) {
				afterSubBytes[i] = AESVisualEngine.SBOX[state[i]];
			}

			const afterShiftRows = new Uint8Array(16);
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

			const afterMixColumns = new Uint8Array(16);
			for (let col = 0; col < 4; col++) {
				const s0 = afterShiftRows[col * 4];
				const s1 = afterShiftRows[col * 4 + 1];
				const s2 = afterShiftRows[col * 4 + 2];
				const s3 = afterShiftRows[col * 4 + 3];
				afterMixColumns[col * 4] =
					(AESVisualEngine.gmul(s0, 2) ^
						AESVisualEngine.gmul(s1, 3) ^
						s2 ^
						s3) &
					0xff;
				afterMixColumns[col * 4 + 1] =
					(s0 ^
						AESVisualEngine.gmul(s1, 2) ^
						AESVisualEngine.gmul(s2, 3) ^
						s3) &
					0xff;
				afterMixColumns[col * 4 + 2] =
					(s0 ^
						s1 ^
						AESVisualEngine.gmul(s2, 2) ^
						AESVisualEngine.gmul(s3, 3)) &
					0xff;
				afterMixColumns[col * 4 + 3] =
					(AESVisualEngine.gmul(s0, 3) ^
						s1 ^
						s2 ^
						AESVisualEngine.gmul(s3, 2)) &
					0xff;
			}

			state = new Uint8Array(16);
			for (let i = 0; i < 16; i++) {
				state[i] = afterMixColumns[i] ^ roundKeys[round][i];
			}
		}

		const finalSubBytes = new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			finalSubBytes[i] = AESVisualEngine.SBOX[state[i]];
		}

		const finalShiftRows = new Uint8Array(16);
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

		const ciphertext = new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			ciphertext[i] = finalShiftRows[i] ^ roundKeys[14][i];
		}

		return ciphertext;
	}

	static runRound1(
		plaintext: Uint8Array,
		key: Uint8Array,
	): {
		inputState: Uint8Array;
		subBytesState: Uint8Array;
		shiftRowsState: Uint8Array;
		mixColumnsState: Uint8Array;
		addRoundKeyState: Uint8Array;
		roundKey: Uint8Array;
	} {
		const roundKeys = AESVisualEngine.expandKey(key);

		const key0 = roundKeys[0];
		const inputState = new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			inputState[i] = plaintext[i] ^ key0[i];
		}

		const subBytesState = new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			subBytesState[i] = AESVisualEngine.SBOX[inputState[i]];
		}

		const shiftRowsState = new Uint8Array(16);
		// Row 0
		shiftRowsState[0] = subBytesState[0];
		shiftRowsState[4] = subBytesState[4];
		shiftRowsState[8] = subBytesState[8];
		shiftRowsState[12] = subBytesState[12];
		// Row 1
		shiftRowsState[1] = subBytesState[5];
		shiftRowsState[5] = subBytesState[9];
		shiftRowsState[9] = subBytesState[13];
		shiftRowsState[13] = subBytesState[1];
		// Row 2
		shiftRowsState[2] = subBytesState[10];
		shiftRowsState[6] = subBytesState[14];
		shiftRowsState[10] = subBytesState[2];
		shiftRowsState[14] = subBytesState[6];
		// Row 3
		shiftRowsState[3] = subBytesState[15];
		shiftRowsState[7] = subBytesState[3];
		shiftRowsState[11] = subBytesState[7];
		shiftRowsState[15] = subBytesState[11];

		const mixColumnsState = new Uint8Array(16);
		for (let col = 0; col < 4; col++) {
			const s0 = shiftRowsState[col * 4];
			const s1 = shiftRowsState[col * 4 + 1];
			const s2 = shiftRowsState[col * 4 + 2];
			const s3 = shiftRowsState[col * 4 + 3];

			mixColumnsState[col * 4] =
				(AESVisualEngine.gmul(s0, 2) ^ AESVisualEngine.gmul(s1, 3) ^ s2 ^ s3) &
				0xff;
			mixColumnsState[col * 4 + 1] =
				(s0 ^ AESVisualEngine.gmul(s1, 2) ^ AESVisualEngine.gmul(s2, 3) ^ s3) &
				0xff;
			mixColumnsState[col * 4 + 2] =
				(s0 ^ s1 ^ AESVisualEngine.gmul(s2, 2) ^ AESVisualEngine.gmul(s3, 3)) &
				0xff;
			mixColumnsState[col * 4 + 3] =
				(AESVisualEngine.gmul(s0, 3) ^ s1 ^ s2 ^ AESVisualEngine.gmul(s3, 2)) &
				0xff;
		}

		const addRoundKeyState = new Uint8Array(16);
		const key1 = roundKeys[1];
		for (let i = 0; i < 16; i++) {
			addRoundKeyState[i] = mixColumnsState[i] ^ key1[i];
		}

		return {
			inputState,
			subBytesState,
			shiftRowsState,
			mixColumnsState,
			addRoundKeyState,
			roundKey: key1,
		};
	}
}
