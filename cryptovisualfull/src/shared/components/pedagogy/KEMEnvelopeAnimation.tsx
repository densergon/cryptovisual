import { KeyRound, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useWizard } from "@/state/wizard-provider";

export function KEMEnvelopeAnimation() {
	const { aesKey, rsaKeyPair, wrappedSessionKey } = useWizard();
	const [phase, setPhase] = useState<"idle" | "sealing" | "sealed">("idle");

	if (!aesKey || !rsaKeyPair || !wrappedSessionKey) return null;

	const handleSeal = () => {
		setPhase("sealing");
		setTimeout(() => setPhase("sealed"), 1200);
	};

	const aesKeyPreview = Array.from(aesKey.keyBytes.slice(0, 4))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join(" ");

	const wrapRatio = wrappedSessionKey.data.length / aesKey.keyBytes.length;

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="mb-6 rounded-lg border border-hybrid-500/30 bg-surface-900 p-4"
		>
			<h3 className="mb-3 text-sm font-semibold text-hybrid-400 uppercase tracking-wide">
				Key Encapsulation Mechanism (KEM)
			</h3>

			<div className="flex items-center justify-center gap-6 py-4">
				{/* AES Key */}
				<motion.div
					animate={
						phase === "sealing"
							? { scale: 0.8, opacity: 0.5, x: 40 }
							: phase === "sealed"
								? { opacity: 0.3, scale: 0.6 }
								: {}
					}
					transition={{ duration: 0.6 }}
					className="flex flex-col items-center gap-2"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-symmetric-500/20">
						<KeyRound size={22} className="text-symmetric-400" />
					</div>
					<span className="text-[10px] font-mono text-symmetric-400">
						{aesKeyPreview}...
					</span>
					<span className="text-[10px] text-surface-500">AES Key</span>
				</motion.div>

				{/* Arrow / Plus */}
				<motion.div
					animate={phase === "sealing" ? { rotate: 180 } : {}}
					transition={{ duration: 0.4 }}
					className="text-surface-600"
				>
					<Lock size={20} />
				</motion.div>

				{/* Envelope */}
				<motion.div
					animate={
						phase === "sealed"
							? { scale: [1, 1.15, 1], transition: { duration: 0.5 } }
							: {}
					}
					className="relative flex flex-col items-center gap-2"
				>
					<motion.div
						animate={
							phase === "sealing"
								? { y: [0, -4, 0], transition: { repeat: Infinity, duration: 0.4 } }
								: {}
						}
						className="flex h-14 w-14 items-center justify-center rounded-xl bg-hybrid-500/20"
					>
						<Mail size={26} className="text-hybrid-400" />
						{phase === "sealed" && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 300 }}
								className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-asymmetric-500"
							>
								<Lock size={10} className="text-white" />
							</motion.div>
						)}
					</motion.div>
					<span className="text-[10px] text-surface-500">
						{phase === "sealed" ? "Sealed Envelope" : "Digital Envelope"}
					</span>
				</motion.div>
			</div>

			{phase === "idle" && (
				<div className="flex justify-center">
					<button
						type="button"
						onClick={handleSeal}
						className="rounded-md bg-hybrid-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-hybrid-500 transition-colors"
					>
						Seal Envelope with RSA
					</button>
				</div>
			)}

			{phase === "sealing" && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-col items-center gap-2"
				>
					<div className="flex items-center gap-2 text-xs text-hybrid-400 font-mono">
						<span>RSA-OAEP</span>
						<span className="text-surface-600">encapsulating...</span>
					</div>
					<div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-800">
						<motion.div
							className="h-full rounded-full bg-hybrid-500"
							initial={{ width: "0%" }}
							animate={{ width: "100%" }}
							transition={{ duration: 1.2, ease: "easeInOut" }}
						/>
					</div>
				</motion.div>
			)}

			{phase === "sealed" && (
				<motion.div
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="space-y-2"
				>
					<div className="flex items-center justify-center gap-4 text-xs text-surface-400">
						<span>
							AES key size:{" "}
							<span className="font-mono text-symmetric-400">
								{aesKey.keyBytes.length * 8} bits
							</span>
						</span>
						<span>
							Wrapped size:{" "}
							<span className="font-mono text-hybrid-400">
								{wrappedSessionKey.data.length * 8} bits
							</span>
						</span>
					</div>
					<p className="text-[10px] text-surface-600 text-center">
						RSA-OAEP expands the key from {aesKey.keyBytes.length}B to{" "}
						{wrappedSessionKey.data.length}B ({wrapRatio.toFixed(1)}x
						overhead). This is the price of asymmetric encryption.
					</p>
				</motion.div>
			)}
		</motion.div>
	);
}
