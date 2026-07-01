import { type FC, useEffect, useRef, useState } from "react";
import type { VisualizationEngine } from "@/visualization/engine/visualization-engine";

interface FPSCounterProps {
	engine: VisualizationEngine;
}

export const FPSCounter: FC<FPSCounterProps> = ({ engine }) => {
	const [fps, setFps] = useState(0);
	const [minFps, setMinFps] = useState(Infinity);
	const [maxFps, setMaxFps] = useState(0);
	const frameIdRef = useRef<number>(0);

	useEffect(() => {
		let running = true;

		const poll = () => {
			if (!running) return;
			const current = engine.getFPS();
			setFps(current);
			setMinFps((prev) => Math.min(prev, current));
			setMaxFps((prev) => Math.max(prev, current));
			frameIdRef.current = requestAnimationFrame(poll);
		};

		frameIdRef.current = requestAnimationFrame(poll);

		return () => {
			running = false;
			cancelAnimationFrame(frameIdRef.current);
		};
	}, [engine]);

	const color =
		fps >= 55
			? "text-green-400"
			: fps >= 30
				? "text-yellow-400"
				: "text-red-400";

	return (
		<div className="fixed bottom-4 right-4 z-50 rounded-lg bg-surface-900/90 px-3 py-2 text-xs font-mono shadow-lg backdrop-blur-sm border border-surface-700">
			<div className={`font-bold ${color}`}>{fps} FPS</div>
			<div className="text-surface-500">
				min{" "}
				<span className="text-surface-300">
					{minFps === Infinity ? "-" : minFps}
				</span>
				{" · "}
				max <span className="text-surface-300">{maxFps}</span>
			</div>
		</div>
	);
};
