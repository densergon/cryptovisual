import { createFileRoute } from "@tanstack/react-router";
import { Combine, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useWizard } from "@/state/wizard-provider";
import { EnvelopeWithTooltip } from "@/shared/components/pedagogy/EnvelopeWithTooltip";
import { KEMEnvelopeAnimation } from "@/shared/components/pedagogy/KEMEnvelopeAnimation";
import { usePedagogyMode } from "@/shared/providers/PedagogyModeProvider";
import { useCryptoWorker } from "@/shared/providers/CryptoWorkerProvider";
import { StepGuide } from "@/shared/components/StepGuide";

export const Route = createFileRoute("/handshake/step-4")({
	component: Step4HybridEnvelope,
});

function Step4HybridEnvelope() {
	const { aesKey, rsaKeyPair, wrappedSessionKey, send } = useWizard();
	const worker = useCryptoWorker();
	const { isPedagogyMode } = usePedagogyMode();
	const [isWrapping, setIsWrapping] = useState(false);
	const [wrapDuration, setWrapDuration] = useState<number | undefined>();

	const hexToUint8Array = (hex: string) => {
		const match = hex.match(/.{1,2}/g);
		return new Uint8Array(match ? match.map((byte) => parseInt(byte, 16)) : []);
	};

	useEffect(() => {
		if (!aesKey || !rsaKeyPair || !worker || wrappedSessionKey || isWrapping)
			return;

		const doWrap = async () => {
			setIsWrapping(true);
			try {
				const keyHex = Array.from(aesKey.keyBytes)
					.map((b) => b.toString(16).padStart(2, "0"))
					.join("");
				const result = await worker.encryptRSA(
					rsaKeyPair.publicKey,
					keyHex,
				);
				const data = hexToUint8Array(result.encryptedData);
				setWrapDuration(result.durationMs);

				send({
					type: "SET_WRAPPED_KEY",
					wrappedKey: { data, durationMs: result.durationMs },
				});

				const messageText = "Hello, CryptoVisual!";
				const aesKeyHex = keyHex;
				const aesResult = await worker.encryptAES(aesKeyHex, messageText);
				const ciphertextData = hexToUint8Array(aesResult.ciphertext);
				const ciphertextIv = hexToUint8Array(aesResult.iv);
				const authTag = aesResult.authTag
					? hexToUint8Array(aesResult.authTag)
					: undefined;
				send({
					type: "SET_CIPHERTEXT",
					ciphertext: {
						data: ciphertextData,
						iv: ciphertextIv,
						authTag,
						durationMs: aesResult.durationMs,
					},
				});
			} catch (error) {
				console.error("Hybrid envelope wrapping failed:", error);
			} finally {
				setIsWrapping(false);
			}
		};

		doWrap();
	}, [aesKey, rsaKeyPair, worker, wrappedSessionKey, send, isWrapping]);

	const wrappedHex =
		wrappedSessionKey?.data &&
		Array.from(wrappedSessionKey.data.slice(0, 6))
			.map((b) => `0x${b.toString(16).padStart(2, "0").toUpperCase()}`)
			.join(" ");

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

			{isWrapping && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border border-hybrid-500/30 bg-surface-900 p-4">
					<Loader2 size={18} className="animate-spin text-hybrid-400" />
					<span className="text-sm text-surface-300">
						Wrapping AES session key with RSA-2048...
					</span>
				</div>
			)}

			{isPedagogyMode && wrappedSessionKey && <KEMEnvelopeAnimation />}

			<p className="mb-6 text-surface-400 leading-relaxed">
				The AES session key is now wrapped using the RSA public key. This
				creates a secure digital envelope, combining the speed of AES for
				the bulk payload with the mathematical security of RSA for the
				key exchange.
			</p>

			<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
				<h3 className="mb-3 font-semibold text-white">Digital Envelope</h3>
				<div className="space-y-3">
					{isPedagogyMode ? (
						<EnvelopeWithTooltip wrappedKeyHex={wrappedHex} />
					) : (
						<div className="rounded bg-surface-800 p-3">
							<span className="text-xs text-surface-500">
								Wrapped Key (RSA Encrypted)
							</span>
							<pre className="mt-1 text-sm text-hybrid-300 font-mono truncate">
								{wrappedHex || "0xB8 0x2A 0xF4 0x1C 0x9D 0xE3 ..."}
							</pre>
							{wrapDuration != null && (
								<span className="mt-1 block text-[10px] text-surface-600 font-mono">
									RSA wrap: {wrapDuration.toFixed(1)}ms
								</span>
							)}
						</div>
					)}
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
				The envelope contains both the wrapped key and the encrypted
				message, ensuring only the owner of the corresponding RSA private key
				can open it.
			</p>
		</motion.div>
	);
}
