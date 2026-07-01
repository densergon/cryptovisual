import type { Application, Container, FederatedPointerEvent } from "pixi.js";

export interface PanZoomConfig {
	minScale: number;
	maxScale: number;
	inertia: boolean;
	pinchZoom: boolean;
	wheelZoom: boolean;
	doubleTapReset: boolean;
}

export class PanZoomController {
	private app: Application;
	private container: Container;
	private isPanning = false;
	private lastPointer = { x: 0, y: 0 };
	private currentScale = 1;
	private config: PanZoomConfig;

	constructor(
		app: Application,
		container: Container,
		config?: Partial<PanZoomConfig>,
	) {
		this.app = app;
		this.container = container;
		this.config = {
			minScale: 0.5,
			maxScale: 3,
			inertia: true,
			pinchZoom: true,
			wheelZoom: true,
			doubleTapReset: true,
			...config,
		};
	}

	enable(): void {
		const target = this.container;
		target.eventMode = "static";
		target.cursor = "grab";

		target.on("pointerdown", this.onPointerDown);
		target.on("pointermove", this.onPointerMove);
		target.on("pointerup", this.onPointerUp);
		target.on("pointerupoutside", this.onPointerUp);

		if (this.config.wheelZoom) {
			this.app.canvas.addEventListener("wheel", this.onWheel, {
				passive: false,
			});
		}
	}

	disable(): void {
		const target = this.container;
		target.off("pointerdown", this.onPointerDown);
		target.off("pointermove", this.onPointerMove);
		target.off("pointerup", this.onPointerUp);
		target.off("pointerupoutside", this.onPointerUp);

		if (this.config.wheelZoom) {
			this.app.canvas.removeEventListener("wheel", this.onWheel);
		}
	}

	reset(): void {
		this.currentScale = 1;
		this.container.scale.set(1);
		this.container.position.set(0, 0);
	}

	zoomTo(factor: number): void {
		const newScale = Math.min(
			this.config.maxScale,
			Math.max(this.config.minScale, this.currentScale * factor),
		);
		this.currentScale = newScale;
		this.container.scale.set(newScale);
	}

	private lastTapTime = 0;

	private onPointerDown = (e: FederatedPointerEvent): void => {
		this.isPanning = true;
		this.lastPointer = { x: e.global.x, y: e.global.y };
		this.container.cursor = "grabbing";

		if (this.config.doubleTapReset && Date.now() - this.lastTapTime < 300) {
			this.reset();
			this.lastTapTime = 0;
		} else {
			this.lastTapTime = Date.now();
		}
	};

	private onPointerMove = (e: FederatedPointerEvent): void => {
		if (!this.isPanning) return;

		const dx = e.global.x - this.lastPointer.x;
		const dy = e.global.y - this.lastPointer.y;

		this.container.x += dx;
		this.container.y += dy;

		this.lastPointer = { x: e.global.x, y: e.global.y };
	};

	private onPointerUp = (): void => {
		this.isPanning = false;
		this.container.cursor = "grab";
	};

	private onWheel = (e: WheelEvent): void => {
		e.preventDefault();
		const factor = e.deltaY > 0 ? 0.9 : 1.1;
		this.zoomTo(factor);
	};
}
