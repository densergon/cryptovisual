import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
	SplitPane,
	StepNavigation,
	StepSidebar,
} from "@/features/wizard/components";
import { useWizardKeyboard } from "@/features/wizard/hooks/use-wizard-keyboard";
import { FPSCounter } from "@/shared/components/FPSCounter";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import {
	AnimationSpeedProvider,
	useAnimationSpeed,
} from "@/shared/providers/AnimationSpeedProvider";
import { CanvasProvider, useCanvas } from "@/shared/providers/CanvasProvider";
import { PedagogyModeProvider } from "@/shared/providers/PedagogyModeProvider";
import { STEP_LABELS } from "@/state/machines/handshake.machine";
import { useWizard, WizardProvider } from "@/state/wizard-provider";

export const Route = createFileRoute("/handshake")({
	component: HandshakeWrapper,
});

function HandshakeWrapper() {
	return (
		<PedagogyModeProvider>
			<WizardProvider>
				<AnimationSpeedProvider>
					<CanvasProvider>
						<HandshakeLayout />
					</CanvasProvider>
				</AnimationSpeedProvider>
			</WizardProvider>
		</PedagogyModeProvider>
	);
}

function HandshakeLayout() {
	const { currentStep, currentStepIndex } = useWizard();
	const { engine, canvasRef } = useCanvas();
	const { speed, setSpeed } = useAnimationSpeed();
	const reduced = useReducedMotion();
	const [showFps, setShowFps] = useState(false);
	useWizardKeyboard();

	const effectiveSpeed = reduced ? 0 : speed;

	useEffect(() => {
		if (engine) {
			engine.setSpeed(effectiveSpeed);
		}
	}, [engine, effectiveSpeed]);

	// Clear canvas scenes immediately on step change
	// This prevents old scene objects from persisting during AnimatePresence transitions
	useEffect(() => {
		if (engine) {
			engine.clearScenes();
		}
	}, [currentStep, engine]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key === "F") {
				e.preventDefault();
				setShowFps((v) => !v);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const handleStepForward = useCallback(() => {
		engine?.stepForward();
	}, [engine]);

	return (
		<SplitPane sidebar={<StepSidebar />}>
			<div className="flex flex-1 flex-col bg-surface-950 relative">
				<div
					id="wizard-title"
					className="px-6 md:px-10 py-4 border-b border-surface-800 flex items-center justify-between z-10 bg-surface-950/80 backdrop-blur-md"
				>
					<div className="flex items-center gap-4">
						<Link
							to="/"
							suppressHydrationWarning
							className="text-surface-500 hover:text-surface-300 transition-colors text-xs font-medium shrink-0"
						>
							&larr; Home
						</Link>
						<div className="h-4 w-px bg-surface-700" />
						<div>
							<h1 className="text-2xl font-bold text-white">
								Hybrid Handshake
							</h1>
							<p className="text-sm text-surface-400">
								{currentStepIndex === 0
									? "6 steps to understand how HTTPS really works \u2014 combining RSA, AES, and the TLS handshake"
									: "Secure Communication Channel"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<span className="text-xs text-surface-500">
								{reduced ? "OFF" : `${speed.toFixed(1)}x`}
							</span>
							<input
								type="range"
								min="0.5"
								max="3"
								step="0.1"
								value={reduced ? 0.5 : speed}
								onChange={(e) => setSpeed(parseFloat(e.target.value))}
								disabled={reduced}
								className={`w-20 accent-symmetric-500 ${reduced ? "opacity-40 cursor-not-allowed" : ""}`}
								aria-label="Animation speed"
							/>
						</div>
						{reduced && (
							<button
								type="button"
								onClick={handleStepForward}
								className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-surface-600"
								aria-label="Step forward animation"
							>
								Step &#9654;
							</button>
						)}
						{[0, 1, 2, 3, 4, 5].map((step) => (
							<div
								key={step}
								className={`h-1.5 w-6 rounded-full transition-colors ${step <= currentStepIndex ? "bg-symmetric-500" : "bg-surface-800"}`}
							/>
						))}
					</div>
				</div>

			<div className="flex-1 relative overflow-hidden">
					<div
						ref={canvasRef}
						className="absolute inset-0 z-0 pointer-events-none"
					/>

					{showFps && engine && <FPSCounter engine={engine} />}

					<div className="relative z-10 h-full overflow-y-auto">
						<div className="sticky top-0 z-20 mb-4 ml-6 mt-4 md:ml-10 flex items-center gap-2 rounded-lg bg-surface-950/90 backdrop-blur-sm px-3 py-1.5 border border-surface-800/50 w-fit pointer-events-auto">
							<span className="text-xs font-medium text-surface-400">
								Step {currentStepIndex + 1} of 6
							</span>
							<span className="text-[10px] text-surface-600">—</span>
							<span className="text-xs font-medium text-surface-300">
								{STEP_LABELS[currentStep]}
							</span>
						</div>
						<div className="px-6 md:px-10">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -12 }}
									transition={{
										duration: reduced ? 0 : 0.25,
										ease: [0.25, 0.1, 0.25, 1],
									}}
									className="pointer-events-auto"
								>
									<Outlet />
								</motion.div>
							</AnimatePresence>
						</div>
						<div className="px-6 md:px-10 pb-6 md:pb-10">
							<p className="text-[10px] text-surface-600 leading-relaxed border-t border-surface-800/50 pt-3">
								Educational demonstration only. Not audited for production
								cryptographic use.
							</p>
						</div>
					</div>
				</div>
				<StepNavigation />
			</div>
		</SplitPane>
	);
}
