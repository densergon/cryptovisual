import gsap from "gsap";
import { type Application, type Container, Graphics, Text } from "pixi.js";

interface BitCell {
	graphics: Graphics;
	text: Text;
	index: number;
	originalValue: number;
	currentValue: number;
	isFlipped: boolean;
}

interface BitFlipperConfig {
	cellWidth: number;
	cellHeight: number;
	gap: number;
	gridColor: number;
	zeroColor: number;
	oneColor: number;
	flippedColor: number;
	textColor: number;
	fontSize: number;
}

export class BitFlipperScene {
	private container: Container;
	private bits: BitCell[];
	private config: BitFlipperConfig;
	private ciphertext: Uint8Array;
	private originalCiphertext: Uint8Array;

	constructor(_app: Application, container: Container) {
		this.container = container;
		this.bits = [];
		this.ciphertext = new Uint8Array(32);
		this.originalCiphertext = new Uint8Array(32);
		this.config = {
			cellWidth: 40,
			cellHeight: 50,
			gap: 6,
			gridColor: 0x4a5568,
			zeroColor: 0x48bb78,
			oneColor: 0xf56565,
			flippedColor: 0xf6e05e,
			textColor: 0xffffff,
			fontSize: 16,
		};
	}

	async init(ciphertext?: Uint8Array): Promise<void> {
		if (ciphertext) {
			this.ciphertext = ciphertext;
			this.originalCiphertext = new Uint8Array(ciphertext);
		} else {
			for (let i = 0; i < 32; i++) {
				this.ciphertext[i] = Math.floor(Math.random() * 256);
			}
			this.originalCiphertext = new Uint8Array(this.ciphertext);
		}

		this.createBitGrid();
	}

	private createBitGrid(): void {
		const bytesPerRow = 8;

		for (let byteIndex = 0; byteIndex < this.ciphertext.length; byteIndex++) {
			const byte = this.ciphertext[byteIndex];

			for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
				const bitValue = (byte >> (7 - bitIndex)) & 1;
				const globalBitIndex = byteIndex * 8 + bitIndex;

				const row = Math.floor(globalBitIndex / (bytesPerRow * 8));
				const col = globalBitIndex % (bytesPerRow * 8);

				const x = 50 + col * (this.config.cellWidth + this.config.gap);
				const y = 50 + row * (this.config.cellHeight * 8 + this.config.gap * 8);

				const bitRow = Math.floor(bitIndex / 8);
				const bitCol = bitIndex % 8;

				const cellX = x + bitCol * (this.config.cellWidth + this.config.gap);
				const cellY = y + bitRow * (this.config.cellHeight + this.config.gap);

				const cell = this.createBitCell(
					cellX,
					cellY,
					bitValue,
					globalBitIndex,
					byteIndex,
					bitIndex,
				);

				this.bits.push(cell);
				this.container.addChild(cell.graphics);
				this.container.addChild(cell.text);
			}

			// Add byte label
			const byteLabel = new Text({
				text: `Byte ${byteIndex}`,
				style: {
					fontSize: 10,
					fill: 0x718096,
				},
			});
			byteLabel.x =
				50 + bytesPerRow * (this.config.cellWidth + this.config.gap) + 10;
			byteLabel.y = 50 + byteIndex * (this.config.cellHeight + this.config.gap);
			this.container.addChild(byteLabel);
		}
	}

	private createBitCell(
		x: number,
		y: number,
		value: number,
		globalIndex: number,
		_byteIndex: number,
		_bitIndex: number,
	): BitCell {
		const graphics = new Graphics();

		const color = value === 0 ? this.config.zeroColor : this.config.oneColor;
		graphics.roundRect(0, 0, this.config.cellWidth, this.config.cellHeight, 4);
		graphics.fill({ color, alpha: 0.8 });
		graphics.stroke({ width: 2, color: this.config.gridColor, alpha: 1 });

		graphics.x = x;
		graphics.y = y;

		// Make interactive
		graphics.eventMode = "static";
		graphics.cursor = "pointer";

		const text = new Text({
			text: value.toString(),
			style: {
				fontSize: this.config.fontSize,
				fill: 0xffffff,
				fontWeight: "bold",
			},
		});
		text.anchor.set(0.5);
		text.x = this.config.cellWidth / 2;
		text.y = this.config.cellHeight / 2;

		// Click handler
		graphics.on("pointerdown", () => {
			this.flipBit(globalIndex);
		});

		// Hover effect
		graphics.on("pointerover", () => {
			graphics.alpha = 0.7;
		});

		graphics.on("pointerout", () => {
			graphics.alpha = 1;
		});

		return {
			graphics,
			text,
			index: globalIndex,
			originalValue: value,
			currentValue: value,
			isFlipped: false,
		};
	}

	flipBit(bitIndex: number): void {
		if (bitIndex < 0 || bitIndex >= this.bits.length) return;

		const bit = this.bits[bitIndex];
		const byteIndex = Math.floor(bitIndex / 8);
		const bitPosition = bitIndex % 8;

		// Flip the bit in ciphertext
		this.ciphertext[byteIndex] ^= 1 << (7 - bitPosition);

		// Update bit state
		bit.isFlipped = !bit.isFlipped;
		bit.currentValue = bit.isFlipped
			? bit.originalValue === 0
				? 1
				: 0
			: bit.originalValue;

		// Animate flip
		gsap.to(bit.graphics.scale, {
			x: 0.8,
			y: 0.8,
			duration: 0.1,
			yoyo: true,
			repeat: 1,
		});

		// Update color
		const color = bit.isFlipped
			? this.config.flippedColor
			: bit.currentValue === 0
				? this.config.zeroColor
				: this.config.oneColor;

		bit.graphics.clear();
		bit.graphics.roundRect(
			0,
			0,
			this.config.cellWidth,
			this.config.cellHeight,
			4,
		);
		bit.graphics.fill({ color, alpha: 0.8 });

		// Update text
		bit.text.text = bit.currentValue.toString();

		if (bit.isFlipped) {
			// Add glow effect
			bit.graphics.stroke({
				width: 3,
				color: this.config.flippedColor,
				alpha: 0.8,
			});
		} else {
			bit.graphics.stroke({ width: 2, color: this.config.gridColor, alpha: 1 });
		}
	}

	flipRandomBits(count: number = 5): void {
		const flippedIndices = new Set<number>();

		while (flippedIndices.size < count) {
			const randomIndex = Math.floor(Math.random() * this.bits.length);
			if (!flippedIndices.has(randomIndex)) {
				flippedIndices.add(randomIndex);
				this.flipBit(randomIndex);
			}
		}
	}

	resetBits(): void {
		this.bits.forEach((bit) => {
			if (bit.isFlipped) {
				this.flipBit(bit.index);
			}
		});
	}

	getFlippedCount(): number {
		return this.bits.filter((b) => b.isFlipped).length;
	}

	getModifiedCiphertext(): Uint8Array {
		return new Uint8Array(this.ciphertext);
	}

	getOriginalCiphertext(): Uint8Array {
		return new Uint8Array(this.originalCiphertext);
	}

	static toHex(bytes: Uint8Array): string {
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	getStats(): {
		totalBits: number;
		flippedBits: number;
		flipPercentage: number;
	} {
		const flipped = this.getFlippedCount();
		return {
			totalBits: this.bits.length,
			flippedBits: flipped,
			flipPercentage: (flipped / this.bits.length) * 100,
		};
	}

	cleanup(): void {
		this.bits.forEach((bit) => {
			if (this.container.children.includes(bit.graphics)) {
				this.container.removeChild(bit.graphics);
			}
			if (this.container.children.includes(bit.text)) {
				this.container.removeChild(bit.text);
			}
		});
		this.bits = [];
	}
}
