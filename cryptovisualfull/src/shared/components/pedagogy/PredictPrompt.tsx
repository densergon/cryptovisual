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
			className="rounded-lg border border-hybrid-500/30 bg-surface-950/95 backdrop-blur-sm p-3"
			role="region"
			aria-label="Predict and reveal"
		>
			{!isAnswered ? (
				<>
					<div className="mb-2 flex items-center gap-2">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-hybrid-400">
							Predict
						</span>
					</div>
					<p className="mb-3 text-sm font-medium text-surface-200 leading-snug">
						{prompt.question}
					</p>
					<div className="space-y-1.5">
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
								className="w-full rounded-lg border border-surface-700 bg-surface-900/80 px-3 py-1.5 text-left text-xs text-surface-300 transition-colors hover:border-hybrid-500/50 hover:bg-surface-800 hover:text-surface-200"
							>
								<span className="mr-2 text-[10px] text-surface-600">
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
						className="mt-2 text-[10px] text-surface-600 transition-colors hover:text-surface-400"
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
							className={`mb-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
								isCorrect
									? "bg-success/10 text-success ring-1 ring-success/30"
									: "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
							}`}
						>
							{isCorrect ? "Correct!" : "Not quite — here's why"}
						</div>
					)}
					<div className="rounded-lg bg-surface-900/80 p-3">
						<p className="text-xs text-surface-300 leading-relaxed">
							{prompt.explanation}
						</p>
						<div className="mt-2 flex items-center gap-2 rounded-md bg-hybrid-500/10 px-2.5 py-1.5">
							<span className="text-[9px] font-medium uppercase tracking-wider text-hybrid-400">
								Watch:
							</span>
							<span className="text-[11px] text-surface-300">
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
						className="mt-2 text-[10px] text-surface-600 transition-colors hover:text-surface-400"
					>
						Dismiss
					</button>
				</>
			)}
		</motion.div>
	);
}
