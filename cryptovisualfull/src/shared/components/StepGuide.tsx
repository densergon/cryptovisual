import { Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Section {
	title: string;
	body: string;
}

interface StepGuideProps {
	sections: Section[];
}

export function StepGuide({ sections }: StepGuideProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-700 text-surface-400 hover:bg-surface-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-asymmetric-500 transition-colors"
				aria-label="Learn about this step"
			>
				<Info size={14} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
						onClick={() => setIsOpen(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ duration: 0.15 }}
							onClick={(e) => e.stopPropagation()}
							className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-surface-700 bg-surface-900 p-6 shadow-2xl"
							role="dialog"
							aria-label="Step guide"
						>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="absolute right-4 top-4 rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-asymmetric-500"
								aria-label="Close guide"
							>
								<X size={18} />
							</button>

							<div className="space-y-4">
								{sections.map((section, i) => (
									<div key={i}>
										<h3 className="mb-1 text-sm font-semibold text-asymmetric-400 uppercase tracking-wide">
											{section.title}
										</h3>
										<p className="text-sm text-surface-300 leading-relaxed">
											{section.body}
										</p>
									</div>
								))}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
