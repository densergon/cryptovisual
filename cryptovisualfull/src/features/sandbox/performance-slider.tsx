import { Gauge } from "lucide-react";
import { motion } from "motion/react";

interface PerformanceSliderProps {
	speed: number;
	onSpeedChange: (speed: number) => void;
}

export function PerformanceSlider({
	speed,
	onSpeedChange,
}: PerformanceSliderProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-lg border border-surface-700 bg-surface-900 p-6"
		>
			<div className="mb-4 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
					<Gauge size={20} className="text-blue-400" />
				</div>
				<div>
					<h3 className="font-semibold text-white">Animation Speed</h3>
					<p className="text-sm text-surface-500">
						Control visualization playback speed
					</p>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<span className="text-sm text-surface-400">Slow</span>
					<span className="text-sm font-medium text-blue-400">
						{speed.toFixed(1)}x
					</span>
					<span className="text-sm text-surface-400">Fast</span>
				</div>

				<input
					type="range"
					min="0.5"
					max="3"
					step="0.1"
					value={speed}
					onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
					className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-700 accent-blue-500"
				/>

				<div className="mt-2 rounded bg-surface-800 p-3">
					<div className="flex items-center justify-between text-xs text-surface-400">
						<span>Current: {speed.toFixed(1)}x</span>
						<span>
							{speed < 1
								? "Slower than normal"
								: speed === 1
									? "Normal speed"
									: "Faster than normal"}
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
