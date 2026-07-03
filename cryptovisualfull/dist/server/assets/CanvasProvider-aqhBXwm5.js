import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jsx } from "react/jsx-runtime";
import gsap from "gsap";
import { Application, Graphics } from "pixi.js";
//#region src/visualization/utils/breakpoints.ts
var BREAKPOINT_MAP = {
	sm: {
		min: 0,
		config: {
			cellSize: 36,
			fontSize: 10,
			wireLength: 300,
			particleDensity: .3
		}
	},
	md: {
		min: 640,
		config: {
			cellSize: 48,
			fontSize: 12,
			wireLength: 450,
			particleDensity: .5
		}
	},
	lg: {
		min: 768,
		config: {
			cellSize: 60,
			fontSize: 14,
			wireLength: 600,
			particleDensity: .7
		}
	},
	xl: {
		min: 1024,
		config: {
			cellSize: 72,
			fontSize: 16,
			wireLength: 750,
			particleDensity: 1
		}
	}
};
var BREAKPOINT_KEYS = [
	"sm",
	"md",
	"lg",
	"xl"
];
function getBreakpoint(width) {
	let bp = "sm";
	for (const key of BREAKPOINT_KEYS) if (width >= BREAKPOINT_MAP[key].min) bp = key;
	return bp;
}
function getBreakpointConfig(width) {
	return BREAKPOINT_MAP[getBreakpoint(width)].config;
}
//#endregion
//#region src/visualization/engine/visualization-engine.ts
var VisualizationEngine = class {
	app;
	currentScene = null;
	container;
	eventListeners = /* @__PURE__ */ new Map();
	fpsCounter = {
		frames: 0,
		lastTime: 0,
		fps: 0
	};
	masterTimeline = gsap.timeline({ paused: true });
	speedMultiplier = 1;
	sceneStatusListeners = /* @__PURE__ */ new Set();
	breakpointConfig = getBreakpointConfig(window.innerWidth);
	resizeObserver = null;
	destroyed = false;
	breakpointUpdate = null;
	constructor(container) {
		this.container = container;
		this.app = new Application();
	}
	async init() {
		if (this.destroyed) return;
		const rect = this.container.getBoundingClientRect();
		const width = rect.width || window.innerWidth;
		const height = rect.height || window.innerHeight;
		await this.app.init({
			width,
			height,
			backgroundColor: 657935,
			antialias: true,
			resolution: Math.min(window.devicePixelRatio || 1, 2),
			autoDensity: true
		});
		if (this.destroyed) {
			this.app.destroy({ removeView: true }, {
				children: true,
				texture: true
			});
			return;
		}
		this.container.appendChild(this.app.canvas);
		this.setupResizeHandler();
		this.setupFPSCounter();
		this.setupBreakpointObserver();
		gsap.ticker.remove(gsap.updateRoot);
		this.app.ticker.add(() => {
			gsap.updateRoot(Date.now() / 1e3);
		});
		this.masterTimeline.clear();
		this.masterTimeline.play();
	}
	setupResizeHandler() {
		this.resizeObserver = new ResizeObserver(() => {
			if (this.destroyed) return;
			const rect = this.container.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) this.app.renderer.resize(rect.width, rect.height);
		});
		this.resizeObserver.observe(this.container);
	}
	setupBreakpointObserver() {
		const updateBreakpoint = () => {
			if (this.destroyed) return;
			const width = window.innerWidth;
			this.breakpointConfig = getBreakpointConfig(width);
			this.emit("breakpoint", this.breakpointConfig);
		};
		this.breakpointUpdate = updateBreakpoint;
		window.addEventListener("resize", updateBreakpoint);
	}
	setupFPSCounter() {
		this.app.ticker.add(() => {
			if (this.destroyed) return;
			this.fpsCounter.frames++;
			const now = performance.now();
			if (now - this.fpsCounter.lastTime >= 1e3) {
				this.fpsCounter.fps = this.fpsCounter.frames;
				this.fpsCounter.frames = 0;
				this.fpsCounter.lastTime = now;
			}
		});
	}
	async loadScene(scene) {
		await this.currentScene?.destroy();
		this.currentScene = scene;
		if (this.currentScene) await this.currentScene.init();
	}
	async playScene() {
		this.currentScene?.play();
	}
	pauseScene() {
		this.currentScene?.pause();
	}
	async destroyScene() {
		if (this.currentScene) {
			await this.currentScene.destroy();
			this.currentScene = null;
		}
	}
	on(event, callback) {
		if (!this.eventListeners.has(event)) this.eventListeners.set(event, /* @__PURE__ */ new Set());
		this.eventListeners.get(event)?.add(callback);
		return () => {
			this.eventListeners.get(event)?.delete(callback);
		};
	}
	emitSceneStatus(message) {
		this.sceneStatusListeners.forEach((cb) => cb(message));
	}
	onSceneStatus(callback) {
		this.sceneStatusListeners.add(callback);
		return () => {
			this.sceneStatusListeners.delete(callback);
		};
	}
	emit(event, payload) {
		this.eventListeners.get(event)?.forEach((callback) => callback(payload));
	}
	getFPS() {
		return this.fpsCounter.fps;
	}
	clearScenes() {
		if (this.app.stage) {
			const overlay = new Graphics();
			overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
			overlay.fill({
				color: 657935,
				alpha: 1
			});
			overlay.zIndex = 9999;
			this.app.stage.addChild(overlay);
			gsap.to(overlay, {
				alpha: 0,
				duration: .15,
				onComplete: () => {
					if (overlay.parent) overlay.parent.removeChild(overlay);
				}
			});
		}
		this.masterTimeline.clear();
		if (!this.app.stage) return;
		while (this.app.stage.children.length > 0) this.app.stage.removeChildAt(0);
	}
	getApplication() {
		return this.app;
	}
	setSpeed(multiplier) {
		this.speedMultiplier = multiplier;
		this.masterTimeline.timeScale(multiplier);
	}
	stepForward() {
		this.masterTimeline.timeScale(1);
		this.masterTimeline.progress(this.masterTimeline.progress() + .1);
		if (this.speedMultiplier === 0) this.masterTimeline.timeScale(0);
	}
	destroy() {
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
		try {
			if (this.app.canvas?.parentNode) this.app.canvas.parentNode.removeChild(this.app.canvas);
		} catch {}
		try {
			this.app.destroy({ removeView: true }, {
				children: true,
				texture: true
			});
		} catch {}
	}
};
//#endregion
//#region src/shared/providers/CanvasProvider.tsx
var CanvasContext = createContext(null);
function CanvasProvider({ children }) {
	const canvasRef = useRef(null);
	const [engine, setEngine] = useState(null);
	useEffect(() => {
		if (!canvasRef.current) return;
		const containerElement = document.createElement("div");
		containerElement.id = "viz-container";
		containerElement.style.width = "100%";
		containerElement.style.height = "100%";
		containerElement.style.position = "relative";
		canvasRef.current.appendChild(containerElement);
		const vizEngine = new VisualizationEngine(containerElement);
		let cancelled = false;
		const init = async () => {
			try {
				await vizEngine.init();
				if (cancelled) {
					vizEngine.destroy();
					return;
				}
				setEngine(vizEngine);
			} catch (error) {
				console.error("Failed to initialize VisualizationEngine:", error);
			}
		};
		init();
		return () => {
			cancelled = true;
			vizEngine.destroy();
			if (canvasRef.current) canvasRef.current.innerHTML = "";
		};
	}, []);
	return /* @__PURE__ */ jsx(CanvasContext.Provider, {
		value: {
			engine,
			canvasRef
		},
		children
	});
}
function useCanvas() {
	const context = useContext(CanvasContext);
	if (!context) throw new Error("useCanvas must be used within a CanvasProvider");
	return context;
}
//#endregion
export { useCanvas as n, CanvasProvider as t };
