import type { Application } from "pixi.js";

export type BreakpointKey = "sm" | "md" | "lg" | "xl";

export interface BreakpointConfig {
	cellSize: number;
	fontSize: number;
	wireLength: number;
	particleDensity: number;
}

const BREAKPOINT_MAP: Record<
	BreakpointKey,
	{ min: number; config: BreakpointConfig }
> = {
	sm: {
		min: 0,
		config: {
			cellSize: 36,
			fontSize: 10,
			wireLength: 300,
			particleDensity: 0.3,
		},
	},
	md: {
		min: 640,
		config: {
			cellSize: 48,
			fontSize: 12,
			wireLength: 450,
			particleDensity: 0.5,
		},
	},
	lg: {
		min: 768,
		config: {
			cellSize: 60,
			fontSize: 14,
			wireLength: 600,
			particleDensity: 0.7,
		},
	},
	xl: {
		min: 1024,
		config: { cellSize: 72, fontSize: 16, wireLength: 750, particleDensity: 1 },
	},
};

const BREAKPOINT_KEYS: BreakpointKey[] = ["sm", "md", "lg", "xl"];

export function getBreakpoint(width: number): BreakpointKey {
	let bp: BreakpointKey = "sm";
	for (const key of BREAKPOINT_KEYS) {
		if (width >= BREAKPOINT_MAP[key].min) bp = key;
	}
	return bp;
}

export function getBreakpointConfig(width: number): BreakpointConfig {
	return BREAKPOINT_MAP[getBreakpoint(width)].config;
}

export function getBreakpointConfigForApp(app: Application): BreakpointConfig {
	return getBreakpointConfig(app.screen.width);
}
