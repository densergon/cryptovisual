import { ArrowLeft, ArrowRight } from "lucide-react";
import { useWizard } from "@/state/wizard-provider";

export function StepNavigation() {
	const { goNext, goBack, isFirstStep, isLastStep } = useWizard();

	return (
		<div className="flex items-center justify-between border-t border-surface-700 bg-surface-900 px-6 py-4">
			<button
				type="button"
				onClick={goBack}
				disabled={isFirstStep}
				className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700 hover:text-white disabled:cursor-not-allowed disabled:text-surface-600 disabled:hover:bg-transparent"
			>
				<ArrowLeft size={16} />
				Back
			</button>

			<button
				type="button"
				onClick={goNext}
				disabled={isLastStep}
				className="flex items-center gap-2 rounded-lg bg-asymmetric-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-asymmetric-500 disabled:cursor-not-allowed disabled:bg-surface-700 disabled:text-surface-500"
			>
				{isLastStep ? "Complete" : "Next"}
				<ArrowRight size={16} />
			</button>
		</div>
	);
}
