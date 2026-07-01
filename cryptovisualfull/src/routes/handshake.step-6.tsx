import { createFileRoute } from "@tanstack/react-router";
import { Unlock } from "lucide-react";
import { motion } from "motion/react";
import { Celebration } from "../shared/components/Celebration";
import { StepGuide } from "../shared/components/StepGuide";

export const Route = createFileRoute("/handshake/step-6")({
	component: Step6Decrypt,
});

function Step6Decrypt() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1 }}
		>
			<Celebration />
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-asymmetric-500/10">
					<Unlock size={20} className="text-asymmetric-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-asymmetric-400">Decrypt</h2>
					<div className="mt-1">
						<StepGuide
							sections={[
								{
									title: "Closing the Loop",
									body: "The recipient uses their RSA private key to 'unlock' the digital envelope from Step 4. Once the AES session key is recovered, it is used to decrypt the payload. Because we use authenticated encryption, we can prove the message is authentic and untampered.",
								},
								{
									title: "Integrity Check",
									body: "Beyond just decryption, the Auth Tag (MAC) is verified. If even a single bit of the ciphertext was changed during transit, the decryption would fail, alerting the recipient to a potential attack.",
								},
							]}
						/>
					</div>
					<p className="text-sm text-surface-500">Step 6 of 6</p>
				</div>
			</div>
			<div id="decrypt-button" className="mb-6 flex items-center gap-3">
				{/* Logical anchor for tutorial */}
				<div className="h-1 w-1 bg-transparent" />
			</div>
			<p className="mb-6 text-surface-400 leading-relaxed">
				The recipient uses their RSA private key to unwrap the digital envelope
				and recover the AES session key. With the key in hand, the payload is
				decrypted and the message's integrity is verified.
			</p>

			<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
				<h3 className="mb-3 font-semibold text-white">Decryption Flow</h3>
				<div className="space-y-3">
					<div className="rounded bg-surface-800 p-3">
						<span className="text-xs text-asymmetric-500">
							1. Unwrap Envelope
						</span>
						<p className="mt-1 text-sm text-surface-400">
							RSA private key decrypts the session key
						</p>
					</div>
					<div className="rounded bg-surface-800 p-3">
						<span className="text-xs text-symmetric-500">
							2. Decrypt Message
						</span>
						<p className="mt-1 text-sm text-surface-400">
							AES session key decrypts the payload
						</p>
					</div>
					<div className="rounded bg-surface-800 p-3">
						<span className="text-xs text-success font-bold">
							3. Integrity Verified: Message Authentic
						</span>
						<pre className="mt-1 text-sm text-surface-300 font-mono">
							Hello, CryptoVisual!
						</pre>
					</div>
				</div>
			</div>

			<p className="mt-6 text-sm text-surface-500">
				The hybrid handshake is complete. The message was encrypted and
				decrypted securely — never exposed on the wire.
			</p>
		</motion.div>
	);
}
