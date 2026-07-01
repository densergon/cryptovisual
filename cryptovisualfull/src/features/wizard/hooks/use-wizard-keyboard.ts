import { useEffect } from "react";
import { useWizard } from "@/state/wizard-provider";

export function useWizardKeyboard() {
	const { goNext, goBack, isFirstStep, isLastStep } = useWizard();

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
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
	}, [goNext, goBack, isFirstStep, isLastStep]);
}
