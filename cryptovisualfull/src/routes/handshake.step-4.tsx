import { createFileRoute } from "@tanstack/react-router";
import { Combine } from "lucide-react";
import { motion } from "motion/react";
import { StepGuide } from "@/shared/components/StepGuide";

export const Route = createFileRoute("/handshake/step-4")({
	component: Step4HybridEnvelope,
});

function Step4HybridEnvelope() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hybrid-500/10">
					<Combine size={20} className="text-hybrid-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-hybrid-400">
						Hybrid Envelope
					</h2>
					<div className="mt-1">
						<StepGuide
							sections={[
								{
									title: "The Hybrid Advantage",
									body: "Why not use RSA for everything? Because RSA is computationally expensive and slow for large files. We use a 'Hybrid' approach: RSA encrypts the AES key, while AES handles the bulk data. This gives us the best of both worlds: security and performance.",
								},
								{
									title: "The Digital Envelope",
									body: 'Imagine the ciphertext as a secure "Box" and the RSA-encrypted session key as the "Envelope" taped to the top. The recipient uses their Private Key to open the envelope, finds the AES key, and uses it to unlock the box.',
								},
							]}
						/>
					</div>
					<p className="text-sm text-surface-500">Step 4 of 6</p>
				</div>
			</div>
			<div id="wrap-button" className="mb-6 flex items-center gap-3">
				{/* This is a logical anchor for the tutorial, as the actual wrapping happens in the background */}
				<div className="h-1 w-1 bg-transparent" />
			</div>
			<p className="mb-6 text-surface-400 leading-relaxed">
				The AES session key is now wrapped using the RSA public key. This
				creates a secure digital envelope, combining the speed of AES for
				the bulk payload with the mathematical security of RSA for the
				key exchange.
			</p>

			<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
				<h3 className="mb-3 font-semibold text-white">Digital Envelope</h3>
				<div className="space-y-3">
					<div className="rounded bg-surface-800 p-3">
						<span className="text-xs text-surface-500">
							Wrapped Session Key (RSA Encrypted)
						</span>
						<pre className="mt-1 text-sm text-hybrid-300 font-mono truncate">
							0xB8 0x2A 0xF4 0x1C 0x9D 0xE3 ...
						</pre>
					</div>
					<div className="rounded bg-surface-800 p-3">
						<span className="text-xs text-surface-500">
							AES-Encrypted Payload (The Box)
						</span>
						<pre className="mt-1 text-sm text-symmetric-300 font-mono truncate">
							0x7E 0x1B 0xA3 0xCC 0x59 0xF8 ...
						</pre>
					</div>
				</div>
			</div>

			<p className="mt-6 text-sm text-surface-500">
				The envelope contains both the wrapped session key and the encrypted
				message, ensuring only the owner of the corresponding RSA private key
				can open it.
			</p>
		</motion.div>
	);
}
