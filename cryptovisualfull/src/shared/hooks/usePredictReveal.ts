import { useCallback, useState } from "react";
import type { PredictPrompt } from "../constants/predict-prompts";

interface PredictRevealState {
	isAnswered: boolean;
	selectedIndex: number | null;
	isCorrect: boolean | null;
	showExplanation: boolean;
}

export function usePredictReveal(prompt: PredictPrompt) {
	const [state, setState] = useState<PredictRevealState>({
		isAnswered: false,
		selectedIndex: null,
		isCorrect: null,
		showExplanation: false,
	});

	const [wasSkipped, setWasSkipped] = useState(false);

	const selectAnswer = useCallback(
		(index: number) => {
			const isCorrect = index === prompt.correctIndex;
			setState({
				isAnswered: true,
				selectedIndex: index,
				isCorrect,
				showExplanation: true,
			});
		},
		[prompt.correctIndex],
	);

	const skip = useCallback(() => {
		setWasSkipped(true);
		setState({
			isAnswered: true,
			selectedIndex: null,
			isCorrect: null,
			showExplanation: true,
		});
	}, []);

	const dismissReveal = useCallback(() => {
		setState({
			isAnswered: false,
			selectedIndex: null,
			isCorrect: null,
			showExplanation: false,
		});
	}, []);

	return {
		...state,
		wasSkipped,
		prompt,
		selectAnswer,
		skip,
		dismissReveal,
	};
}
