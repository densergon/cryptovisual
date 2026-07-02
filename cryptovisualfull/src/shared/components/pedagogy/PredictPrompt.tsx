import { motion } from "motion/react";
import type { PredictPrompt as PredictPromptData } from "../../constants/predict-prompts";
import { usePredictReveal } from "../../hooks/usePredictReveal";

interface PredictPromptProps {
	prompt: PredictPromptData;
	onReveal: () => void;
	onDismiss: () => void;
}

export function PredictPrompt({
	prompt,
	onReveal,
	onDismiss,
}: PredictPromptProps) {
	const {
		isAnswered,
		selectedIndex,
		isCorrect,
		wasSkipped,
		selectAnswer,
		skip,
		dismissReveal,
	} = usePredictReveal(prompt);

	return (
		<motion.div
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
			className="mb-6 rounded-lg border border-hybrid-500/30 bg-surface-950/80 backdrop-blur-sm p-5"
			role="region"
			aria-label="Predict and reveal"
		>
			{!isAnswered ? (
				<>
					<div className="mb-1 flex items-center gap-2">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-hybrid-400">
							Predict
						</span>
						<span className="text-[10px] text-surface-600">|</span>
						<span className="text-[10px] text-surface-500">
							Test your understanding before the animation
						</span>
					</div>
					<p className="mb-4 text-sm font-medium text-surface-200">
						{prompt.question}
					</p>
					<div className="space-y-2">
						{prompt.choices.map((choice, i) => (
							<button
								key={i}
								type="button"
								onClick={() => {
									selectAnswer(i);
									if (i === prompt.correctIndex) {
										onReveal();
									}
								}}
								className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-left text-sm text-surface-300 transition-colors hover:border-hybrid-500/50 hover:bg-surface-800 hover:text-surface-200"
							>
								<span className="mr-3 text-xs text-surface-600">
									{String.fromCharCode(65 + i)}
								</span>
								{choice}
							</button>
						))}
					</div>
					<button
						type="button"
						onClick={() => {
							skip();
							onReveal();
						}}
						className="mt-3 text-xs text-surface-600 transition-colors hover:text-surface-400"
					>
						Skip — show me the answer
					</button>
				</>
			) : (
				<>
					<div className="mb-1 flex items-center gap-2">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-hybrid-400">
							Reveal
						</span>
					</div>
					{!wasSkipped && selectedIndex !== null && (
						<div
							className={`mb-3 rounded-lg px-4 py-2 text-sm font-medium ${
								isCorrect
									? "bg-success/10 text-success ring-1 ring-success/30"
									: "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
							}`}
						>
							{isCorrect ? "Correct!" : "Not quite — here's why"}
						</div>
					)}
					<div className="rounded-lg bg-surface-900/80 p-4">
						<p className="text-sm text-surface-200">{prompt.explanation}</p>
						<div className="mt-3 flex items-center gap-2 rounded-md bg-hybrid-500/10 px-3 py-2">
							<span className="text-[10px] font-medium uppercase tracking-wider text-hybrid-400">
								Watch:
							</span>
							<span className="text-xs text-surface-300">
								{prompt.revealLabel}
							</span>
						</div>
					</div>
					<button
						type="button"
						onClick={() => {
							dismissReveal();
							onDismiss();
						}}
						className="mt-3 text-xs text-surface-600 transition-colors hover:text-surface-400"
					>
						Dismiss
					</button>
				</>
			)}
		</motion.div>
	);
}
