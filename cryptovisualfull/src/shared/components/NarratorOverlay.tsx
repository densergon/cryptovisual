import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useWizard } from "@/state/wizard-provider";

/**
 * NarratorOverlay — synchronized caption system for Canvas scenes.
 *
 * Canvas scenes emit timeline events; this component displays captions
 * in a floating bar at the bottom of the canvas area, driven by the
 * current step and wizard state.
 *
 * Events are emitted via VisualizationEngine.emit('narrator', { text, duration })
 * and consumed here via a custom hook or direct engine subscription.
 */
export interface NarratorEvent {
	text: string;
	duration?: number; // ms, defaults to 3000
	priority?: "info" | "highlight" | "success" | "warning";
}

interface CaptionQueueItem extends NarratorEvent {
	id: number;
}

export function useNarrator() {
	const [caption, setCaption] = useState<CaptionQueueItem | null>(null);
	const idRef = useRef(0);

	const narrate = (event: NarratorEvent) => {
		const id = ++idRef.current;
		setCaption({ ...event, id });
	};

	const clear = () => setCaption(null);

	return { caption, narrate, clear };
}

interface NarratorOverlayProps {
	/** Direct caption to display (overrides queue) */
	caption?: string | null;
	/** Time in ms before auto-hiding; null = persist */
	duration?: number | null;
	/** Visual priority */
	priority?: "info" | "highlight" | "success" | "warning";
}

const priorityStyles: Record<string, string> = {
	info: "bg-surface-900/90 border-surface-700 text-surface-200",
	highlight: "bg-asymmetric-900/90 border-asymmetric-500 text-asymmetric-200",
	success: "bg-green-900/90 border-green-500 text-green-200",
	warning: "bg-amber-900/90 border-amber-500 text-amber-200",
};

/**
 * NarratorOverlay — floating caption bar for Canvas scenes.
 * Renders inside the wizard layout, positioned over the canvas.
 */
export function NarratorOverlay({
	caption,
	duration = 4000,
	priority = "info",
}: NarratorOverlayProps) {
	const reduced = useReducedMotion();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!caption) {
			setVisible(false);
			return;
		}
		setVisible(true);
		if (duration) {
			const timer = setTimeout(() => setVisible(false), duration);
			return () => clearTimeout(timer);
		}
	}, [caption, duration]);

	if (reduced && priority === "info") return null;

	return (
		<div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
			<AnimatePresence>
				{visible && caption && (
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						transition={{ duration: reduced ? 0 : 0.3 }}
						className={`max-w-2xl rounded-xl border px-5 py-3 shadow-xl backdrop-blur-md ${priorityStyles[priority]}`}
						role="status"
						aria-live="polite"
					>
						<p className="text-sm leading-relaxed font-medium text-center">
							{caption}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

/**
 * StepNarrator — step-aware automatic captions.
 *
 * Reads the current wizard step and displays contextual narration
 * when the user triggers an action (e.g., generating a key).
 * This is the primary integration point for the NarratorOverlay in routes.
 */
const stepNarrations: Record<string, string[]> = {
	keygen: [
		"Generating two mathematically linked numbers...",
		"The public key can lock. The private key is the only thing that can unlock.",
		"RSA is asymmetric: what one key locks, the other unlocks.",
	],
	"session-key": [
		"AES is a symmetric cipher: the same key locks and unlocks.",
		"This key is random — 256 bits of pure entropy.",
		"Symmetric encryption is blazingly fast, but the key must be shared securely.",
	],
	"aes-cipher": [
		"AES works in rounds: each pass scrambles the data more.",
		"SubBytes provides confusion; ShiftRows and MixColumns provide diffusion.",
		"After just a few rounds, the output bears no resemblance to the input.",
	],
	"hybrid-envelope": [
		"We wrap the small AES key with RSA, not the whole message.",
		"Why? RSA is 1000x slower. AES is 1000x faster.",
		"Hybrid: the speed of AES + the key-sharing power of RSA.",
	],
	"wire-simulation": [
		"The envelope travels across the wire, protected by RSA.",
		"Even if intercepted, only the private key can open it.",
		"This is exactly how TLS protects your data in transit.",
	],
	decrypt: [
		"The private key unwraps the envelope, revealing the AES key.",
		"AES then decrypts the actual message at lightning speed.",
		"The handshake is complete. The channel is secure.",
	],
};

export function useStepNarrator() {
	const { currentStep } = useWizard();
	const [captionIndex, setCaptionIndex] = useState(0);
	const [activeCaption, setActiveCaption] = useState<string | null>(null);

	const narrate = () => {
		const texts = stepNarrations[currentStep] ?? [];
		if (texts.length === 0) return;
		const index = captionIndex % texts.length;
		setActiveCaption(texts[index]);
		setCaptionIndex((prev) => prev + 1);
	};

	const clear = () => setActiveCaption(null);

	return { activeCaption, narrate, clear };
}
