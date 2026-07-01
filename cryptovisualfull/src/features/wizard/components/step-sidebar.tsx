import { Check } from "lucide-react";
import {
	type HandshakeStep,
	STEP_LABELS,
	STEPS,
} from "@/state/machines/handshake.machine";
import { useWizard } from "@/state/wizard-provider";

const STEP_COLORS: Record<HandshakeStep, string> = {
	keygen: "bg-asymmetric-500",
	"session-key": "bg-symmetric-500",
	"aes-cipher": "bg-symmetric-500",
	"hybrid-envelope": "bg-hybrid-500",
	"wire-simulation": "bg-surface-500",
	decrypt: "bg-asymmetric-500",
};

const STEP_COLORS_TEXT: Record<HandshakeStep, string> = {
	keygen: "text-asymmetric-400",
	"session-key": "text-symmetric-400",
	"aes-cipher": "text-symmetric-400",
	"hybrid-envelope": "text-hybrid-400",
	"wire-simulation": "text-surface-400",
	decrypt: "text-asymmetric-400",
};

export function StepSidebar() {
	const {
		currentStep,
		totalSteps,
		goToStep,
		isStepComplete,
		isStepAccessible,
	} = useWizard();

	return (
		<aside className="w-full border-b border-surface-700 bg-surface-900 md:w-64 md:border-b-0 md:border-r">
			<nav className="flex flex-row justify-around gap-1 p-4 md:flex-col md:gap-2">
				{STEPS.map((step, i) => {
					const isCurrent = step === currentStep;
					const completed = isStepComplete(step);
					const accessible = isStepAccessible(step);

					return (
						<button
							type="button"
							key={step}
							onClick={() => goToStep(step)}
							disabled={!accessible}
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all
								${
									isCurrent
										? `${STEP_COLORS_TEXT[step]} bg-surface-800 shadow-sm`
										: completed
											? "text-surface-300 hover:bg-surface-800 hover:text-white"
											: "text-surface-600 cursor-not-allowed"
								}`}
						>
							<span
								className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
									${isCurrent ? `${STEP_COLORS[step]} text-white` : completed ? "bg-success text-white" : "bg-surface-700 text-surface-500"}`}
							>
								{completed ? <Check size={14} /> : i + 1}
							</span>
							<span className="hidden md:inline">{STEP_LABELS[step]}</span>
						</button>
					);
				})}
				<div className="mt-1 text-center text-xs text-surface-600 md:mt-4 md:text-left">
					Step {STEPS.indexOf(currentStep) + 1} of {totalSteps}
				</div>
			</nav>
		</aside>
	);
}
