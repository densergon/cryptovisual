import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";
//#region src/visualization/scenes/state-matrix-scene.ts
var StateMatrixVisualizer = class {
	app;
	stage;
	root;
	animationContainer;
	cells = [];
	localTimeline = null;
	cancelled = false;
	isInitialized = false;
	speedMultiplier = 1;
	masterTimeline = null;
	centerPoint;
	config;
	targetContainer = null;
	containerObserver = null;
	constructor(app, stage, targetContainer) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
		this.animationContainer = new Container();
		this.centerPoint = {
			x: 0,
			y: 0
		};
		this.targetContainer = targetContainer ?? null;
		this.config = {
			cellSize: 60,
			gap: 8,
			gridColor: 4871528,
			cellColor: 4766584,
			highlightColor: 16179294,
			textColor: 16777215,
			fontSize: 14
		};
	}
	updateCenterPoint() {
		if (!this.app.canvas) return;
		const canvasRect = this.app.canvas.getBoundingClientRect();
		if (this.targetContainer) {
			const rect = this.targetContainer.getBoundingClientRect();
			this.centerPoint = {
				x: rect.left - canvasRect.left + rect.width / 2,
				y: rect.top - canvasRect.top + rect.height / 2
			};
		} else this.centerPoint = {
			x: this.app.screen.width / 2,
			y: this.app.screen.height / 2
		};
	}
	async init(initialState) {
		if (!this.app.renderer) {
			console.warn("StateMatrixVisualizer: PixiJS not initialized yet");
			return;
		}
		this.updateCenterPoint();
		this.root.addChild(this.animationContainer);
		this.stage.addChild(this.root);
		if (initialState) {
			this.createGrid();
			this.updateMatrix(initialState);
		}
		if (this.targetContainer) {
			this.containerObserver = new ResizeObserver(() => {
				this.updateCenterPoint();
				if (this.cells.length > 0) this.repositionGrid();
			});
			this.containerObserver.observe(this.targetContainer);
			window.addEventListener("scroll", this.handleScroll);
		}
		this.isInitialized = true;
	}
	handleScroll = () => {
		this.updateCenterPoint();
	};
	repositionGrid() {
		const { cellSize, gap } = this.config;
		const totalSize = 4 * cellSize + 3 * gap;
		const startX = this.centerPoint.x - totalSize / 2 + cellSize / 2;
		const startY = this.centerPoint.y - totalSize / 2 + cellSize / 2;
		for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
			const x = startX + col * (cellSize + gap);
			const y = startY + row * (cellSize + gap);
			const cell = this.cells[row][col];
			const hs = cellSize / 2;
			cell.normalGraphics.position.set(x, y);
			cell.highlightGraphics.position.set(x, y);
			cell.text.position.set(x, y);
			cell.normalGraphics.clear();
			cell.normalGraphics.rect(-hs, -hs, cellSize, cellSize);
			cell.normalGraphics.fill({
				color: this.config.cellColor,
				alpha: .9
			});
			cell.normalGraphics.stroke({
				color: this.config.gridColor,
				width: 2
			});
			cell.highlightGraphics.clear();
			cell.highlightGraphics.rect(-hs, -hs, cellSize, cellSize);
			cell.highlightGraphics.fill({
				color: this.config.highlightColor,
				alpha: .9
			});
			cell.highlightGraphics.stroke({
				color: this.config.gridColor,
				width: 2
			});
		}
	}
	createGrid() {
		const { cellSize, gap } = this.config;
		const totalSize = 4 * cellSize + 3 * gap;
		const startX = this.centerPoint.x - totalSize / 2;
		const startY = this.centerPoint.y - totalSize / 2;
		for (let row = 0; row < 4; row++) {
			this.cells[row] = [];
			for (let col = 0; col < 4; col++) {
				const x = startX + col * (cellSize + gap) + cellSize / 2;
				const y = startY + row * (cellSize + gap) + cellSize / 2;
				const cell = this.createCell(row, col);
				cell.normalGraphics.position.set(x, y);
				cell.highlightGraphics.position.set(x, y);
				cell.text.position.set(x, y);
				this.cells[row][col] = cell;
				this.animationContainer.addChild(cell.normalGraphics);
				this.animationContainer.addChild(cell.highlightGraphics);
				this.animationContainer.addChild(cell.text);
			}
		}
	}
	createCell(row, col) {
		const { cellSize, gridColor, cellColor, highlightColor, textColor, fontSize } = this.config;
		const hs = cellSize / 2;
		const normalGraphics = new Graphics();
		normalGraphics.rect(-hs, -hs, cellSize, cellSize);
		normalGraphics.fill({
			color: cellColor,
			alpha: .9
		});
		normalGraphics.stroke({
			color: gridColor,
			width: 2
		});
		normalGraphics.alpha = 1;
		const highlightGraphics = new Graphics();
		highlightGraphics.rect(-hs, -hs, cellSize, cellSize);
		highlightGraphics.fill({
			color: highlightColor,
			alpha: .9
		});
		highlightGraphics.stroke({
			color: gridColor,
			width: 2
		});
		highlightGraphics.alpha = 0;
		const text = new Text({
			text: "00",
			style: {
				fill: textColor,
				fontSize,
				fontFamily: "monospace"
			}
		});
		text.anchor.set(.5);
		return {
			value: 0,
			normalGraphics,
			highlightGraphics,
			text,
			row,
			col
		};
	}
	updateMatrix(state) {
		this.ensureAttached();
		if (this.cells.length === 0) this.createGrid();
		let index = 0;
		for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
			const value = state[index++];
			this.updateCell(row, col, value);
		}
	}
	updateCell(row, col, value) {
		if (!this.cells[row]?.[col]) return;
		const cell = this.cells[row][col];
		cell.value = value;
		cell.text.text = value.toString(16).padStart(2, "0").toUpperCase();
	}
	highlightCell(row, col, duration = .3) {
		if (!this.cells[row]?.[col]) return;
		const cell = this.cells[row][col];
		cell.highlightGraphics.alpha = 1;
		cell.normalGraphics.alpha = 0;
		const mt = this.masterTimeline;
		if (mt) mt.to(cell.normalGraphics.scale, {
			x: 1.1,
			y: 1.1,
			duration: duration / 2,
			yoyo: true,
			repeat: 1,
			ease: "power1.inOut"
		});
		else gsap.to(cell.normalGraphics.scale, {
			x: 1.1,
			y: 1.1,
			duration: duration / 2,
			yoyo: true,
			repeat: 1,
			ease: "power1.inOut"
		});
	}
	resetCellHighlight(row, col, duration = .3) {
		if (!this.cells[row]?.[col]) return;
		const cell = this.cells[row][col];
		cell.highlightGraphics.alpha = 0;
		cell.normalGraphics.alpha = 1;
		const mt = this.masterTimeline;
		if (mt) mt.to(cell.normalGraphics.scale, {
			x: 1,
			y: 1,
			duration,
			ease: "power2.out"
		});
		else gsap.to(cell.normalGraphics.scale, {
			x: 1,
			y: 1,
			duration,
			ease: "power2.out"
		});
	}
	gsapDelay(ms) {
		return new Promise((resolve) => {
			const speed = this.masterTimeline?.timeScale() ?? this.speedMultiplier ?? 1;
			const seconds = speed === 0 ? ms / 1e3 : ms / 1e3 / speed;
			gsap.delayedCall(seconds, resolve);
		});
	}
	async animateSubBytes(sBox, state) {
		const newState = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;
			const newValue = sBox[state[i]];
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
	async animateShiftRows(state) {
		const newState = /* @__PURE__ */ new Uint8Array(16);
		const shifts = [
			0,
			1,
			2,
			3
		];
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
			this.highlightCell(row, 0, .5);
			await this.gsapDelay(300);
			if (this.cancelled) return newState;
			for (let col = 0; col < 4; col++) {
				const shift = shifts[row];
				const newCol = (col - shift + 4) % 4;
				const cell = this.cells[row][newCol];
				cell.text.text = state[row * 4 + col].toString(16).padStart(2, "2").toUpperCase();
				cell.value = state[row * 4 + col];
				this.highlightCell(row, newCol, .2);
				await this.gsapDelay(150);
				if (this.cancelled) return newState;
			}
			this.resetCellHighlight(row, 0, .3);
		}
		return newState;
	}
	async animateMixColumns(state) {
		const newState = /* @__PURE__ */ new Uint8Array(16);
		for (let col = 0; col < 4; col++) {
			for (let row = 0; row < 4; row++) this.highlightCell(row, col, .3);
			await this.gsapDelay(400);
			if (this.cancelled) return newState;
			const s0 = state[0 + col];
			const s1 = state[4 + col];
			const s2 = state[8 + col];
			const s3 = state[12 + col];
			newState[0 + col] = this.gmul(s0, 2) ^ this.gmul(s1, 3) ^ this.gmul(s2, 1) ^ this.gmul(s3, 1);
			newState[4 + col] = this.gmul(s0, 1) ^ this.gmul(s1, 2) ^ this.gmul(s2, 3) ^ this.gmul(s3, 1);
			newState[8 + col] = this.gmul(s0, 1) ^ this.gmul(s1, 1) ^ this.gmul(s2, 2) ^ this.gmul(s3, 3);
			newState[12 + col] = this.gmul(s0, 3) ^ this.gmul(s1, 1) ^ this.gmul(s2, 1) ^ this.gmul(s3, 2);
			for (let row = 0; row < 4; row++) {
				this.updateCell(row, col, newState[row * 4 + col]);
				await this.gsapDelay(100);
				if (this.cancelled) return newState;
			}
			for (let row = 0; row < 4; row++) this.resetCellHighlight(row, col, .2);
			await this.gsapDelay(200);
			if (this.cancelled) return newState;
		}
		return newState;
	}
	async animateAddRoundKey(state, roundKey) {
		const newState = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;
			this.highlightCell(row, col, .2);
			await this.gsapDelay(100);
			if (this.cancelled) return newState;
			newState[i] = state[i] ^ roundKey[i];
			this.updateCell(row, col, newState[i]);
			await this.gsapDelay(150);
			if (this.cancelled) return newState;
			this.resetCellHighlight(row, col, .2);
		}
		return newState;
	}
	async animateAvalancheEffect(originalState, flippedState) {
		const changedBits = [];
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
				this.highlightCell(row, col, .5);
				this.updateCell(row, col, flippedState[i] ?? originalState[i]);
			}
			await this.gsapDelay(50);
		}
		await this.gsapDelay(500);
		for (let i = 0; i < 16; i++) {
			const row = Math.floor(i / 4);
			const col = i % 4;
			if (changedBits[i]) this.resetCellHighlight(row, col, .3);
		}
		console.log(`Avalanche effect: ${totalChanged} bytes changed (${(totalChanged / 16 * 100).toFixed(1)}%)`);
	}
	gmul(a, b) {
		let p = 0;
		for (let i = 0; i < 8; i++) {
			if (b & 1) p ^= a;
			const hiBit = a & 128;
			a = a << 1 & 255;
			if (hiBit) a ^= 27;
			b >>= 1;
		}
		return p;
	}
	ensureAttached() {
		if (!this.root.parent) this.stage.addChild(this.root);
	}
	play() {
		if (!this.isInitialized) return;
		this.ensureAttached();
	}
	pause() {
		this.localTimeline?.pause();
	}
	resume() {
		this.localTimeline?.resume();
	}
	destroy() {
		this.cancelled = true;
		this.localTimeline?.kill();
		this.localTimeline = null;
		this.cells.forEach((row) => {
			row.forEach((cell) => {
				gsap.killTweensOf(cell.normalGraphics);
				gsap.killTweensOf(cell.normalGraphics.scale);
			});
		});
		gsap.killTweensOf(this.animationContainer);
		this.root.removeChildren();
		if (this.root.parent) this.root.parent.removeChild(this.root);
		this.cells = [];
		this.isInitialized = false;
		this.containerObserver?.disconnect();
		this.containerObserver = null;
		window.removeEventListener("scroll", this.handleScroll);
	}
	onEvent(event, payload) {
		console.log("StateMatrix event:", event, payload);
	}
};
//#endregion
export { StateMatrixVisualizer as t };
