import { AnimatePresence, motion } from "motion/react";
import { useWizard } from "@/state/wizard-provider";

/**
 * TravelingToken — persistent mini-indicator of which step currently holds the
 * AES session key, creating a visual thread across the wizard.
 *
 * Appears in the wizard header once the AES key has been generated (Step 2+).
 * Glows and pulses in the step color that "owns" the token.
 */
export function TravelingToken() {
	const { aesKey, currentStep } = useWizard();

	if (!aesKey) return null;

	const stepTokenLocation: Record<string, { label: string; color: string }> = {
		"session-key": { label: "AES Key", color: "bg-symmetric-500" },
		"aes-cipher": { label: "AES Key", color: "bg-symmetric-500" },
		"hybrid-envelope": { label: "Wrapped Key", color: "bg-hybrid-500" },
		"wire-simulation": { label: "Wrapped Key", color: "bg-hybrid-500" },
		decrypt: { label: "Session Key", color: "bg-symmetric-500" },
	};

	const location = stepTokenLocation[currentStep] ?? {
		label: "Key",
		color: "bg-surface-500",
	};

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={currentStep}
				initial={{ opacity: 0, scale: 0.8, y: -4 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.8, y: 4 }}
				transition={{ duration: 0.25 }}
				className="flex items-center gap-2"
				aria-label={`Traveling token: ${location.label}`}
			>
				<div className={`relative h-3 w-3 rounded-full ${location.color}`}>
					<span className="absolute inset-0 rounded-full bg-current opacity-40 animate-ping" />
				</div>
				<span className="text-xs font-medium text-surface-300">
					{location.label}
				</span>
			</motion.div>
		</AnimatePresence>
	);
}
