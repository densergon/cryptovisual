import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTutorial } from "../providers/TutorialProvider";

export function TutorialTooltip() {
	const { currentStep, nextStep, prevStep, closeTutorial, steps } =
		useTutorial();
	const [coords, setCoords] = useState({
		top: 0,
		left: 0,
		width: 0,
		height: 0,
	});
	useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (currentStep === null) return;

		const target = document.getElementById(steps[currentStep].targetId);
		if (target) {
			const rect = target.getBoundingClientRect();
			setCoords({
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX,
				width: rect.width,
				height: rect.height,
			});
		}
	}, [currentStep, steps]);

	if (currentStep === null) return null;

	const step = steps[currentStep];
	const { top, left, width, height } = coords;

	const getPositionStyles = () => {
		switch (step.position) {
			case "top":
				return { top: top - 10, left: left + width / 2, x: "-50%", y: "0" };
			case "bottom":
				return {
					top: top + height + 10,
					left: left + width / 2,
					x: "-50%",
					y: "0",
				};
			case "left":
				return { top: top + height / 2, left: left - 10, x: "0", y: "-50%" };
			case "right":
				return {
					top: top + height / 2,
					left: left + width + 10,
					x: "0",
					y: "-50%",
				};
		}
	};

	const style = getPositionStyles();

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="fixed z-[100] pointer-events-auto"
				style={{
					top: style.top,
					left: style.left,
					transform: `translate(${style.x}, ${style.y})`,
				}}
			>
				<div className="relative rounded-xl bg-surface-800 border border-surface-600 p-4 shadow-2xl max-w-xs">
					<button
						type="button"
						onClick={closeTutorial}
						className="absolute -top-2 -right-2 p-1 rounded-full bg-surface-700 text-surface-400 hover:text-white transition-colors"
					>
						<X size={14} />
					</button>

					<p className="text-sm text-surface-200 mb-4 leading-relaxed">
						{step.content}
					</p>

					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={prevStep}
							disabled={currentStep === 0}
							className="p-1 rounded text-surface-500 hover:text-white disabled:opacity-30"
						>
							<ChevronLeft size={18} />
						</button>
						<span className="text-[10px] font-mono text-surface-500">
							Step {currentStep + 1} of {steps.length}
						</span>
						<button
							type="button"
							onClick={
								currentStep === steps.length - 1 ? closeTutorial : nextStep
							}
							className="p-1 rounded text-symmetric-400 hover:text-symmetric-300"
						>
							{currentStep === steps.length - 1 ? (
								"Finish"
							) : (
								<ChevronRight size={18} />
							)}
						</button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
