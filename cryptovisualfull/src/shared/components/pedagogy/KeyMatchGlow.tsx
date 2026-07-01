import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function KeyMatchGlow() {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{
				duration: 0.5,
				ease: "easeOut",
			}}
			className="mb-4"
		>
			<motion.div
				className="rounded-lg border-2 border-success/50 bg-success/5 p-4 text-center"
				animate={{
					boxShadow: [
						"0 0 0px rgba(74, 222, 128, 0)",
						"0 0 20px rgba(74, 222, 128, 0.3)",
						"0 0 0px rgba(74, 222, 128, 0)",
					],
				}}
				transition={{
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			>
				<motion.div
					animate={{ scale: [1, 1.05, 1] }}
					transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
					className="flex items-center justify-center gap-2"
				>
					<CheckCircle size={24} className="text-success" />
					<span className="text-sm font-semibold text-success">
						Key Match Verified
					</span>
				</motion.div>
				<p className="mt-1 text-xs text-surface-400">
					The decrypted session key matches the original — the handshake is
					cryptographically intact.
				</p>
			</motion.div>
		</motion.div>
	);
}
