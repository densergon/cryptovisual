import gsap from "gsap";
import { Application } from "pixi.js";
import {
	type BreakpointConfig,
	getBreakpointConfig,
} from "../utils/breakpoints";

export interface Scene {
	init(): void;
	play(): void;
	pause(): void;
	destroy(): void;
	onEvent(event: string, payload?: unknown): void;
}

export interface SceneConstructor {
	new (app: Application, canvas: HTMLCanvasElement): Scene;
}

export class VisualizationEngine {
	private app: Application;
	private currentScene: Scene | null = null;
	private container: HTMLElement;
	private eventListeners: Map<string, Set<(payload?: unknown) => void>> =
		new Map();
	private fpsCounter: { frames: number; lastTime: number; fps: number } = {
		frames: 0,
		lastTime: 0,
		fps: 0,
	};
	public readonly masterTimeline = gsap.timeline({ paused: true });
	public speedMultiplier = 1;
	public breakpointConfig: BreakpointConfig = getBreakpointConfig(
		window.innerWidth,
	);
	private resizeObserver: ResizeObserver | null = null;
	private destroyed = false;

	private breakpointUpdate: (() => void) | null = null;

	constructor(container: HTMLElement) {
		this.container = container;
		this.app = new Application();
	}

	async init(): Promise<void> {
		await this.app.init({
			resizeTo: window,
			backgroundColor: 0x0a0a0f,
			antialias: true,
			resolution: Math.min(window.devicePixelRatio || 1, 2),
			autoDensity: true,
		});

		this.container.appendChild(this.app.canvas);
		this.setupResizeHandler();
		this.setupFPSCounter();
		this.setupBreakpointObserver();
		this.masterTimeline.play();
	}

	private setupResizeHandler(): void {
		this.resizeObserver = new ResizeObserver(() => {
			if (this.destroyed) return;
			const rect = this.container.getBoundingClientRect();
			this.app.renderer.resize(rect.width, rect.height);
		});
		this.resizeObserver.observe(this.container);
	}

	private setupBreakpointObserver(): void {
		const updateBreakpoint = () => {
			if (this.destroyed) return;
			const width = window.innerWidth;
			this.breakpointConfig = getBreakpointConfig(width);
			this.emit("breakpoint", this.breakpointConfig);
		};

		this.breakpointUpdate = updateBreakpoint;
		window.addEventListener("resize", updateBreakpoint);
	}

	private setupFPSCounter(): void {
		this.app.ticker.add(() => {
			if (this.destroyed) return;
			this.fpsCounter.frames++;
			const now = performance.now();
			if (now - this.fpsCounter.lastTime >= 1000) {
				this.fpsCounter.fps = this.fpsCounter.frames;
				this.fpsCounter.frames = 0;
				this.fpsCounter.lastTime = now;
			}
		});
	}

	async loadScene(scene: any): Promise<void> {
		await this.currentScene?.destroy();
		this.currentScene = scene;
		if (this.currentScene) {
			await this.currentScene.init();
		}
	}

	async playScene(): Promise<void> {
		this.currentScene?.play();
	}

	pauseScene(): void {
		this.currentScene?.pause();
	}

	async destroyScene(): Promise<void> {
		if (this.currentScene) {
			await this.currentScene.destroy();
			this.currentScene = null;
		}
	}

	on(event: string, callback: (payload?: unknown) => void): () => void {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set());
		}
		this.eventListeners.get(event)?.add(callback);

		return () => {
			this.eventListeners.get(event)?.delete(callback);
		};
	}

	emit(event: string, payload?: unknown): void {
		this.eventListeners.get(event)?.forEach((callback) => callback(payload));
	}

	getFPS(): number {
		return this.fpsCounter.fps;
	}

	getApplication(): Application {
		return this.app;
	}

	setSpeed(multiplier: number): void {
		this.speedMultiplier = multiplier;
		this.masterTimeline.timeScale(multiplier);
	}

	stepForward(): void {
		this.masterTimeline.timeScale(1);
		this.masterTimeline.progress(this.masterTimeline.progress() + 0.1);
		if (this.speedMultiplier === 0) {
			this.masterTimeline.timeScale(0);
		}
	}

	destroy(): void {
		if (this.destroyed) return;
		this.destroyed = true;

		this.masterTimeline.kill();
		this.currentScene?.destroy();
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;

		if (this.breakpointUpdate) {
			window.removeEventListener("resize", this.breakpointUpdate);
			this.breakpointUpdate = null;
		}

		this.eventListeners.clear();

		// remove canvas before destroying the application to avoid
		// PixiJS v8 _cancelResize internal crash when resizeTo was used
		try {
			if (this.app.canvas?.parentNode) {
				this.app.canvas.parentNode.removeChild(this.app.canvas);
			}
		} catch {
			// canvas already removed
		}

		try {
			this.app.destroy({ removeView: true }, { children: true, texture: true });
		} catch {
			// PixiJS v8 may throw during destroy if resize handlers
			// were not fully initialized — safe to ignore
		}
	}
}
