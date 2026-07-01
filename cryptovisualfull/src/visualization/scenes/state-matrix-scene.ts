import gsap from "gsap";
import { type Application, Container, Graphics, Text } from "pixi.js";

interface StateMatrixCell {
	value: number;
	graphics: Graphics;
	text: Text;
	row: number;
	col: number;
}

interface AESAnimationConfig {
	cellSize: number;
	gap: number;
	gridColor: number;
	cellColor: number;
	highlightColor: number;
	textColor: number;
	fontSize: number;
}

export class StateMatrixVisualizer {
	private app: Application;
	private stage: Container;
	private root: Container;
	private animationContainer: Container;
	private cells: StateMatrixCell[][] = [];
	private localTimeline: gsap.core.Timeline | null = null;
	private cancelled = false;
	private isInitialized = false;
	public speedMultiplier: number = 1;
	private centerPoint: { x: number; y: number };
	private config: AESAnimationConfig;

	constructor(app: Application, stage: Container) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
		this.animationContainer = new Container();
		this.centerPoint = {
			x: this.app.screen.width / 2,
			y: this.app.screen.height / 2,
		};
		this.config = {
			cellSize: 60,
			gap: 8,
			gridColor: 0x4a5568,
			cellColor: 0x48bb78,
			highlightColor: 0xf6e05e,
			textColor: 0xffffff,
			fontSize: 14,
		};
	}

	async init(initialState?: Uint8Array): Promise<void> {
		this.root.addChild(this.animationContainer);
		this.stage.addChild(this.root);
		this.createGrid();

		if (initialState) {
			this.updateMatrix(initialState);
		}

		this.isInitialized = true;
	}

	private createGrid(): void {
		const { cellSize, gap } = this.config;
		const totalSize = 4 * cellSize + 3 * gap;
		const startX = this.centerPoint.x - totalSize / 2 + cellSize / 2;
		const startY = this.centerPoint.y - totalSize / 2 + cellSize / 2;

		for (let row = 0; row < 4; row++) {
			this.cells[row] = [];
			for (let col = 0; col < 4; col++) {
				const x = startX + col * (cellSize + gap);
				const y = startY + row * (cellSize + gap);

				const cell = this.createCell(x, y, row, col);
				this.cells[row][col] = cell;
				this.animationContainer.addChild(cell.graphics);
				this.animationContainer.addChild(cell.text);
			}
		}
	}

	private createCell(
		x: number,
		y: number,
		row: number,
		col: number,
	): StateMatrixCell {
		const { cellSize, gridColor, cellColor, textColor, fontSize } = this.config;

		const graphics = new Graphics();
		graphics.rect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize);
		graphics.fill({ color: cellColor, alpha: 0.9 });
		graphics.stroke({ color: gridColor, width: 2 });

		const text = new Text({
			text: "00",
			style: {
				fill: textColor,
				fontSize: fontSize,
				fontFamily: "monospace",
			},
		});
		text.anchor.set(0.5);
		text.x = x;
		text.y = y;

		return {
			value: 0,
			graphics,
			text,
			row,
			col,
		};
	}

	updateMatrix(state: Uint8Array): void {
		let index = 0;
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				const value = state[index++];
				this.updateCell(row, col, value);
			}
		}
	}

	updateCell(row: number, col: number, value: number): void {
		const cell = this.cells[row][col];
		cell.value = value;
		cell.text.text = value.toString(16).padStart(2, "2").toUpperCase();
	}

	highlightCell(row: number, col: number, duration: number = 0.3): void {
		const cell = this.cells[row][col];
		const { highlightColor, cellSize, gridColor } = this.config;
		const cx = this.getCenterX(row, col);
		const cy = this.getCenterY(row, col);

		cell.graphics.clear();
		cell.graphics.rect(
			cx - cellSize / 2,
			cy - cellSize / 2,
			cellSize,
			cellSize,
		);
		cell.graphics.fill({ color: highlightColor, alpha: 0.9 });
		cell.graphics.stroke({ color: gridColor, width: 2 });

		gsap.to(cell.graphics.scale, {
			x: 1.1,
			y: 1.1,
			duration: duration / 2,
			yoyo: true,
			repeat: 1,
			ease: "power1.inOut",
		});
	}

	resetCellHighlight(row: number, col: number, duration: number = 0.3): void {
		const cell = this.cells[row][col];
		const { cellColor, gridColor, cellSize } = this.config;
		const cx = this.getCenterX(row, col);
		const cy = this.getCenterY(row, col);

		cell.graphics.clear();
		cell.graphics.rect(
			cx - cellSize / 2,
			cy - cellSize / 2,
			cellSize,
			cellSize,
		);
		cell.graphics.fill({ color: cellColor, alpha: 0.9 });
		cell.graphics.stroke({ color: gridColor, width: 2 });

		gsap.to(cell.graphics.scale, {
			x: 1,
			y: 1,
			duration,
			ease: "power2.out",
		});
	}

	private gsapDelay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			const seconds =
				this.speedMultiplier === 0
					? ms / 1000
					: ms / 1000 / this.speedMultiplier;
			gsap.delayedCall(seconds, resolve);
		});
	}

	private getCenterX(_row: number, col: number): number {
		const { cellSize, gap } = this.config;
		const totalSize = 4 * cellSize + 3 * gap;
		const startX = this.centerPoint.x - totalSize / 2 + cellSize / 2;
		return startX + col * (cellSize + gap);
	}

	private getCenterY(row: number, _col: number): number {
		const { cellSize, gap } = this.config;
		const totalSize = 4 * cellSize + 3 * gap;
		const startY = this.centerPoint.y - totalSize / 2 + cellSize / 2;
		return startY + row * (cellSize + gap);
	}

	async animateSubBytes(
		sBox: Uint8Array,
		state: Uint8Array,
	): Promise<Uint8Array> {
		const newState = new Uint8Array(16);

		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;

			const oldValue = state[i];
			const newValue = sBox[oldValue];
			newState[i] = newValue;

			this.highlightCell(row, col);
			await this.gsapDelay(100);
			if (this.cancelled) return newState;

			this.updateCell(row, col, newValue);
			await this.gsapDelay(200);
			if (this.cancelled) return newState;

			this.resetCellHighlight(row, col);
		}

		return newState;
	}

	async animateShiftRows(state: Uint8Array): Promise<Uint8Array> {
		const newState = new Uint8Array(16);
		const shifts = [0, 1, 2, 3];

		for (let row = 0; row < 4; row++) {
			const shift = shifts[row];

			for (let col = 0; col < 4; col++) {
				const newCol = (col - shift + 4) % 4;
				const oldIndex = row * 4 + col;
				const newIndex = row * 4 + newCol;

				newState[newIndex] = state[oldIndex];
			}
		}

		for (let row = 1; row < 4; row++) {
			this.highlightCell(row, 0, 0.5);
			await this.gsapDelay(300);
			if (this.cancelled) return newState;

			for (let col = 0; col < 4; col++) {
				const shift = shifts[row];
				const newCol = (col - shift + 4) % 4;

				const cell = this.cells[row][newCol];
				cell.text.text = state[row * 4 + col]
					.toString(16)
					.padStart(2, "2")
					.toUpperCase();
				cell.value = state[row * 4 + col];

				this.highlightCell(row, newCol, 0.2);
				await this.gsapDelay(150);
				if (this.cancelled) return newState;
			}

			this.resetCellHighlight(row, 0, 0.3);
		}

		return newState;
	}

	async animateMixColumns(state: Uint8Array): Promise<Uint8Array> {
		const newState = new Uint8Array(16);

		for (let col = 0; col < 4; col++) {
			for (let row = 0; row < 4; row++) {
				this.highlightCell(row, col, 0.3);
			}

			await this.gsapDelay(400);
			if (this.cancelled) return newState;

			const s0 = state[0 * 4 + col];
			const s1 = state[1 * 4 + col];
			const s2 = state[2 * 4 + col];
			const s3 = state[3 * 4 + col];

			newState[0 * 4 + col] =
				this.gmul(s0, 2) ^
				this.gmul(s1, 3) ^
				this.gmul(s2, 1) ^
				this.gmul(s3, 1);
			newState[1 * 4 + col] =
				this.gmul(s0, 1) ^
				this.gmul(s1, 2) ^
				this.gmul(s2, 3) ^
				this.gmul(s3, 1);
			newState[2 * 4 + col] =
				this.gmul(s0, 1) ^
				this.gmul(s1, 1) ^
				this.gmul(s2, 2) ^
				this.gmul(s3, 3);
			newState[3 * 4 + col] =
				this.gmul(s0, 3) ^
				this.gmul(s1, 1) ^
				this.gmul(s2, 1) ^
				this.gmul(s3, 2);

			for (let row = 0; row < 4; row++) {
				this.updateCell(row, col, newState[row * 4 + col]);
				await this.gsapDelay(100);
				if (this.cancelled) return newState;
			}

			for (let row = 0; row < 4; row++) {
				this.resetCellHighlight(row, col, 0.2);
			}

			await this.gsapDelay(200);
			if (this.cancelled) return newState;
		}

		return newState;
	}

	async animateAddRoundKey(
		state: Uint8Array,
		roundKey: Uint8Array,
	): Promise<Uint8Array> {
		const newState = new Uint8Array(16);

		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;

			this.highlightCell(row, col, 0.2);
			await this.gsapDelay(100);
			if (this.cancelled) return newState;

			newState[i] = state[i] ^ roundKey[i];
			this.updateCell(row, col, newState[i]);

			await this.gsapDelay(150);
			if (this.cancelled) return newState;

			this.resetCellHighlight(row, col, 0.2);
		}

		return newState;
	}

	async animateAvalancheEffect(
		originalState: Uint8Array,
		flippedState: Uint8Array,
	): Promise<void> {
		const changedBits: boolean[] = [];

		for (let i = 0; i < 16; i++) {
			const orig = originalState[i];
			const flipped = flippedState[i] ?? orig;
			changedBits.push(orig !== flipped);
		}

		const totalChanged = changedBits.filter((b) => b).length;

		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;

			if (changedBits[i]) {
				this.highlightCell(row, col, 0.5);
				this.updateCell(row, col, flippedState[i] ?? originalState[i]);
			}

			await this.gsapDelay(50);
		}

		await this.gsapDelay(500);

		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;

			if (changedBits[i]) {
				this.resetCellHighlight(row, col, 0.3);
			}
		}

		console.log(
			`Avalanche effect: ${totalChanged} bytes changed (${((totalChanged / 16) * 100).toFixed(1)}%)`,
		);
	}

	private gmul(a: number, b: number): number {
		let p = 0;
		for (let i = 0; i < 8; i++) {
			if (b & 1) {
				p ^= a;
			}
			const hiBit = a & 0x80;
			a = (a << 1) & 0xff;
			if (hiBit) {
				a ^= 0x1b;
			}
			b >>= 1;
		}
		return p;
	}

	play(): void {
		if (!this.isInitialized) return;
	}

	pause(): void {
		this.localTimeline?.pause();
	}

	resume(): void {
		this.localTimeline?.resume();
	}

	destroy(): void {
		this.cancelled = true;
		this.localTimeline?.kill();
		this.localTimeline = null;
		this.cells.forEach((row) => {
			row.forEach((cell) => {
				gsap.killTweensOf(cell.graphics);
				gsap.killTweensOf(cell.graphics.scale);
			});
		});
		gsap.killTweensOf(this.animationContainer);
		this.root.removeChildren();
		if (this.root.parent) {
			this.root.parent.removeChild(this.root);
		}
		this.cells = [];
		this.isInitialized = false;
	}

	onEvent(event: string, payload?: unknown): void {
		console.log("StateMatrix event:", event, payload);
	}
}
