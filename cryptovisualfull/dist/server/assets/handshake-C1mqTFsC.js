import { n as useCanvas, t as CanvasProvider } from "./CanvasProvider-aqhBXwm5.js";
import { a as PedagogyModeProvider, i as STEP_LABELS, n as useWizard, r as STEPS, t as WizardProvider } from "./wizard-provider-pbkfxoqq.js";
import { n as useAnimationSpeed, t as AnimationSpeedProvider } from "./AnimationSpeedProvider-DFGQ3vgf.js";
import { t as useReducedMotion } from "./useReducedMotion-Bbb4EYym.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
//#region src/features/wizard/components/split-pane.tsx
function SplitPane({ sidebar, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen flex-col md:flex-row",
		children: [sidebar, /* @__PURE__ */ jsx("main", {
			className: "flex flex-1 flex-col",
			children
		})]
	});
}
//#endregion
//#region src/features/wizard/components/step-navigation.tsx
function StepNavigation() {
	const { goNext, goBack, isFirstStep, isLastStep } = useWizard();
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between border-t border-surface-700 bg-surface-900 px-6 py-4",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: goBack,
			disabled: isFirstStep,
			className: "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700 hover:text-white disabled:cursor-not-allowed disabled:text-surface-600 disabled:hover:bg-transparent",
			children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 16 }), "Back"]
		}), /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: goNext,
			disabled: isLastStep,
			className: "flex items-center gap-2 rounded-lg bg-asymmetric-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-asymmetric-500 disabled:cursor-not-allowed disabled:bg-surface-700 disabled:text-surface-500",
			children: [isLastStep ? "Complete" : "Next", /* @__PURE__ */ jsx(ArrowRight, { size: 16 })]
		})]
	});
}
//#endregion
//#region src/features/wizard/components/step-sidebar.tsx
var STEP_COLORS = {
	keygen: "bg-asymmetric-500",
	"session-key": "bg-symmetric-500",
	"aes-cipher": "bg-symmetric-500",
	"hybrid-envelope": "bg-hybrid-500",
	"wire-simulation": "bg-surface-500",
	decrypt: "bg-asymmetric-500"
};
var STEP_COLORS_TEXT = {
	keygen: "text-asymmetric-400",
	"session-key": "text-symmetric-400",
	"aes-cipher": "text-symmetric-400",
	"hybrid-envelope": "text-hybrid-400",
	"wire-simulation": "text-surface-400",
	decrypt: "text-asymmetric-400"
};
function StepSidebar() {
	const { currentStep, totalSteps, goToStep, isStepComplete, isStepAccessible } = useWizard();
	return /* @__PURE__ */ jsx("aside", {
		className: "w-full border-b border-surface-700/50 bg-surface-950/70 backdrop-blur-md md:w-64 md:border-b-0 md:border-r",
		children: /* @__PURE__ */ jsxs("nav", {
			className: "flex flex-row justify-around gap-1 p-4 md:flex-col md:gap-2",
			children: [STEPS.map((step, i) => {
				const isCurrent = step === currentStep;
				const completed = isStepComplete(step);
				return /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => goToStep(step),
					disabled: !isStepAccessible(step),
					className: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all
								${isCurrent ? `${STEP_COLORS_TEXT[step]} bg-surface-800 shadow-sm` : completed ? "text-surface-300 hover:bg-surface-800 hover:text-white" : "text-surface-600 cursor-not-allowed"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: `flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
									${isCurrent ? `${STEP_COLORS[step]} text-white` : completed ? "bg-success text-white" : "bg-surface-700 text-surface-500"}`,
						children: completed ? /* @__PURE__ */ jsx(Check, { size: 14 }) : i + 1
					}), /* @__PURE__ */ jsx("span", {
						className: "hidden md:inline",
						children: STEP_LABELS[step]
					})]
				}, step);
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-1 text-center text-xs text-surface-600 md:mt-4 md:text-left",
				children: [
					"Step ",
					STEPS.indexOf(currentStep) + 1,
					" of ",
					totalSteps
				]
			})]
		})
	});
}
//#endregion
//#region src/features/wizard/hooks/use-wizard-keyboard.ts
function useWizardKeyboard() {
	const { goNext, goBack, isFirstStep, isLastStep } = useWizard();
	useEffect(() => {
		function handleKeyDown(event) {
			if (event.altKey || event.ctrlKey || event.metaKey) return;
			if (event.key === "ArrowRight" && !isLastStep) {
				event.preventDefault();
				goNext();
			}
			if (event.key === "ArrowLeft" && !isFirstStep) {
				event.preventDefault();
				goBack();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		goNext,
		goBack,
		isFirstStep,
		isLastStep
	]);
}
//#endregion
//#region src/shared/components/FPSCounter.tsx
var FPSCounter = ({ engine }) => {
	const [fps, setFps] = useState(0);
	const [minFps, setMinFps] = useState(Infinity);
	const [maxFps, setMaxFps] = useState(0);
	const frameIdRef = useRef(0);
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
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed bottom-4 right-4 z-50 rounded-lg bg-surface-900/90 px-3 py-2 text-xs font-mono shadow-lg backdrop-blur-sm border border-surface-700",
		children: [/* @__PURE__ */ jsxs("div", {
			className: `font-bold ${fps >= 55 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"}`,
			children: [fps, " FPS"]
		}), /* @__PURE__ */ jsxs("div", {
			className: "text-surface-500",
			children: [
				"min",
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-surface-300",
					children: minFps === Infinity ? "-" : minFps
				}),
				" · ",
				"max ",
				/* @__PURE__ */ jsx("span", {
					className: "text-surface-300",
					children: maxFps
				})
			]
		})]
	});
};
//#endregion
//#region src/routes/handshake.tsx?tsr-split=component
function HandshakeWrapper() {
	return /* @__PURE__ */ jsx(PedagogyModeProvider, { children: /* @__PURE__ */ jsx(WizardProvider, { children: /* @__PURE__ */ jsx(AnimationSpeedProvider, { children: /* @__PURE__ */ jsx(CanvasProvider, { children: /* @__PURE__ */ jsx(HandshakeLayout, {}) }) }) }) });
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
		if (engine) engine.setSpeed(effectiveSpeed);
	}, [engine, effectiveSpeed]);
	useEffect(() => {
		if (engine) engine.clearScenes();
	}, [currentStep, engine]);
	useEffect(() => {
		const handler = (e) => {
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
	return /* @__PURE__ */ jsx(SplitPane, {
		sidebar: /* @__PURE__ */ jsx(StepSidebar, {}),
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-col bg-surface-950 relative",
			children: [
				/* @__PURE__ */ jsxs("div", {
					id: "wizard-title",
					className: "px-6 md:px-10 py-4 border-b border-surface-800 flex items-center justify-between z-10 bg-surface-950/80 backdrop-blur-md",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ jsx(Link, {
								to: "/",
								suppressHydrationWarning: true,
								className: "text-surface-500 hover:text-surface-300 transition-colors text-xs font-medium shrink-0",
								children: "← Home"
							}),
							/* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-surface-700" }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
								className: "text-2xl font-bold text-white",
								children: "Hybrid Handshake"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-surface-400",
								children: currentStepIndex === 0 ? "6 steps to understand how HTTPS really works — combining RSA, AES, and the TLS handshake" : "Secure Communication Channel"
							})] })
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-surface-500",
									children: reduced ? "OFF" : `${speed.toFixed(1)}x`
								}), /* @__PURE__ */ jsx("input", {
									type: "range",
									min: "0.5",
									max: "3",
									step: "0.1",
									value: reduced ? .5 : speed,
									onChange: (e) => setSpeed(parseFloat(e.target.value)),
									disabled: reduced,
									className: `w-20 accent-symmetric-500 ${reduced ? "opacity-40 cursor-not-allowed" : ""}`,
									"aria-label": "Animation speed"
								})]
							}),
							reduced && /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleStepForward,
								className: "rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-surface-600",
								"aria-label": "Step forward animation",
								children: "Step ▶"
							}),
							[
								0,
								1,
								2,
								3,
								4,
								5
							].map((step) => /* @__PURE__ */ jsx("div", { className: `h-1.5 w-6 rounded-full transition-colors ${step <= currentStepIndex ? "bg-symmetric-500" : "bg-surface-800"}` }, step))
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1 relative overflow-hidden",
					children: [
						/* @__PURE__ */ jsx("div", {
							ref: canvasRef,
							className: "absolute inset-0 z-0 pointer-events-none"
						}),
						showFps && engine && /* @__PURE__ */ jsx(FPSCounter, { engine }),
						/* @__PURE__ */ jsxs("div", {
							className: "relative z-10 h-full overflow-y-auto",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "sticky top-0 z-20 mb-4 ml-6 mt-4 md:ml-10 flex items-center gap-2 rounded-lg bg-surface-950/90 backdrop-blur-sm px-3 py-1.5 border border-surface-800/50 w-fit pointer-events-auto",
									children: [
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs font-medium text-surface-400",
											children: [
												"Step ",
												currentStepIndex + 1,
												" of 6"
											]
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-surface-600",
											children: "—"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-xs font-medium text-surface-300",
											children: STEP_LABELS[currentStep]
										})
									]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "px-6 md:px-10",
									children: /* @__PURE__ */ jsx(AnimatePresence, {
										mode: "wait",
										children: /* @__PURE__ */ jsx(motion.div, {
											initial: {
												opacity: 0,
												y: 12
											},
											animate: {
												opacity: 1,
												y: 0
											},
											exit: {
												opacity: 0,
												y: -12
											},
											transition: {
												duration: reduced ? 0 : .25,
												ease: [
													.25,
													.1,
													.25,
													1
												]
											},
											className: "pointer-events-auto",
											children: /* @__PURE__ */ jsx(Outlet, {})
										}, currentStep)
									})
								}),
								/* @__PURE__ */ jsx("div", {
									className: "px-6 md:px-10 pb-6 md:pb-10",
									children: /* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-surface-600 leading-relaxed border-t border-surface-800/50 pt-3",
										children: "Educational demonstration only. Not audited for production cryptographic use."
									})
								})
							]
						})
					]
				}),
				/* @__PURE__ */ jsx(StepNavigation, {})
			]
		})
	});
}
//#endregion
export { HandshakeWrapper as component };
