import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Celebration } from "../shared/components/Celebration";
import { KeyMatchGlow } from "../shared/components/pedagogy/KeyMatchGlow";
import { PredictPrompt } from "../shared/components/pedagogy/PredictPrompt";
import { TwoStepUnlock } from "../shared/components/pedagogy/TwoStepUnlock";
import { StepGuide } from "../shared/components/StepGuide";
import { PREDICT_PROMPTS } from "../shared/constants/predict-prompts";
import { useCryptoWorker } from "../shared/providers/CryptoWorkerProvider";
import { usePedagogyMode } from "../shared/providers/PedagogyModeProvider";
import { useWizard } from "../state/wizard-provider";

export const Route = createFileRoute("/handshake/step-6")({
	component: Step6Decrypt,
});

function Step6Decrypt() {
	const { rsaKeyPair, wrappedSessionKey, ciphertext, plaintext } = useWizard();
	const worker = useCryptoWorker();
	const { isPedagogyMode } = usePedagogyMode();
	const [isDecrypting, setIsDecrypting] = useState(false);
	const [decryptedText, setDecryptedText] = useState<string | null>(null);
	const [unwrapDuration, setUnwrapDuration] = useState<number | undefined>();
	const [aesDuration, setAesDuration] = useState<number | undefined>();
	const [tampered, setTampered] = useState(false);
	const [shouldDecrypt, setShouldDecrypt] = useState(true);
	const [showPredict, setShowPredict] = useState(true);
	const decryptPrompt = PREDICT_PROMPTS.find((p) => p.step === 6);

	const uint8ArrayToHex = (arr: Uint8Array) =>
		Array.from(arr)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

	useEffect(() => {
		if (
			!rsaKeyPair ||
			!wrappedSessionKey ||
			!ciphertext ||
			!worker ||
			!shouldDecrypt
		)
			return;

		const doDecrypt = async () => {
			setIsDecrypting(true);
			try {
				const wrappedKeyHex = uint8ArrayToHex(wrappedSessionKey.data);
				const unwrapResult = await worker.decryptRSA(
					rsaKeyPair.privateKey,
					wrappedKeyHex,
				);
				setUnwrapDuration(unwrapResult.durationMs);

				const authTagHex = ciphertext.authTag
					? uint8ArrayToHex(ciphertext.authTag)
					: undefined;
				let ciphertextHex = uint8ArrayToHex(ciphertext.data);

				if (tampered && ciphertext.data.length > 0) {
					const flipped = new Uint8Array(ciphertext.data);
					flipped[0] ^= 0x01;
					ciphertextHex = uint8ArrayToHex(flipped);
				}

				const ivHex = uint8ArrayToHex(ciphertext.iv);
				const decryptResult = await worker.decryptAES(
					unwrapResult.decryptedData,
					ciphertextHex,
					ivHex,
					authTagHex,
				);
				setAesDuration(decryptResult.durationMs);
				setDecryptedText(decryptResult.decryptedData);
			} catch (error) {
				console.error("Decryption failed:", error);
				setDecryptedText("[decryption failed]");
			} finally {
				setIsDecrypting(false);
			}
		};

		doDecrypt();
	}, [
		rsaKeyPair,
		wrappedSessionKey,
		ciphertext,
		worker,
		tampered,
		shouldDecrypt,
	]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
		>
			{decryptedText && !tampered && <Celebration />}
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

			{isDecrypting && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border border-asymmetric-500/30 bg-surface-950/60 backdrop-blur-sm p-4">
					<Loader2 size={18} className="animate-spin text-asymmetric-400" />
					<span className="text-sm text-surface-300">
						Unwrapping envelope and decrypting payload...
					</span>
				</div>
			)}

			{isPedagogyMode && showPredict && decryptPrompt && (
				<PredictPrompt
					prompt={decryptPrompt}
					onReveal={() => {}}
					onDismiss={() => setShowPredict(false)}
				/>
			)}

			{isPedagogyMode && decryptedText && <TwoStepUnlock />}

			{isPedagogyMode && decryptedText && <KeyMatchGlow />}

			<p className="mb-6 text-surface-400 leading-relaxed">
				The recipient uses their RSA private key to unwrap the digital envelope
				and recover the AES session key. With the key in hand, the payload is
				decrypted and the message's integrity is verified.
			</p>

			<div className="rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6">
				<h3 className="mb-3 font-semibold text-white">Decryption Flow</h3>
				<div className="space-y-3">
					<div className="rounded bg-surface-800/60 p-3">
						<span className="text-xs text-asymmetric-500">
							1. Unwrap Envelope (RSA)
						</span>
						<p className="mt-1 text-sm text-surface-400">
							{unwrapDuration != null
								? `RSA private key decrypted the session key in ${unwrapDuration.toFixed(1)}ms`
								: "RSA private key decrypts the session key"}
						</p>
					</div>
					<div className="rounded bg-surface-800/60 p-3">
						<span className="text-xs text-symmetric-500">
							2. Decrypt Message (AES)
						</span>
						<p className="mt-1 text-sm text-surface-400">
							{aesDuration != null
								? `AES session key decrypted the payload in ${aesDuration.toFixed(1)}ms`
								: "AES session key decrypts the payload"}
						</p>
					</div>
					<motion.div
						initial={decryptedText ? { opacity: 0, scale: 0.95 } : undefined}
						animate={decryptedText ? { opacity: 1, scale: 1 } : undefined}
						transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
						className={`rounded bg-surface-800/60 p-3 ${decryptedText && !tampered ? "ring-1 ring-success/30" : ""}`}
					>
						<span
							className={`text-xs font-bold ${tampered ? "text-red-400" : "text-success"}`}
						>
							{isDecrypting
								? "Decrypting..."
								: tampered
									? "3. Integrity Check Failed: Message Tampered"
									: "3. Integrity Verified: Message Authentic"}
						</span>
						<pre className="mt-1 text-sm text-surface-300 font-mono">
							{isDecrypting
								? "Decrypting..."
								: tampered
									? "[decryption rejected — auth tag mismatch]"
									: (decryptedText ?? plaintext)}
						</pre>
					</motion.div>
				</div>
			</div>

			{tampered && (
				<div className="mt-4 rounded-lg border border-red-500/40 bg-surface-950/60 backdrop-blur-sm p-4">
					<div className="flex items-center gap-2 mb-2">
						<AlertTriangle size={18} className="text-red-400" />
						<span className="text-sm font-semibold text-red-400">
							Integrity Check Failed
						</span>
					</div>
					<p className="text-sm text-surface-400">
						The ciphertext was altered during transmission. GCM authentication
						tag verification detected the tampering and rejected the decryption.
						This demonstrates why authenticated encryption (GCM) is essential
						over non-authenticated modes like ECB or CBC.
					</p>
				</div>
			)}

			<div className="mt-4 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={() => {
						setDecryptedText(null);
						setUnwrapDuration(undefined);
						setAesDuration(undefined);
						setTampered(false);
						setShouldDecrypt(true);
					}}
					className="rounded-lg bg-symmetric-600 px-6 py-2.5 font-medium text-white hover:bg-symmetric-500 transition-colors text-sm"
				>
					Retry Decryption
				</button>
				<button
					type="button"
					onClick={() => {
						setDecryptedText(null);
						setUnwrapDuration(undefined);
						setAesDuration(undefined);
						setTampered(true);
						setShouldDecrypt(true);
					}}
					className="rounded-lg bg-red-700 px-6 py-2.5 font-medium text-white hover:bg-red-600 transition-colors text-sm"
				>
					Simulate Tampered Packet
				</button>
				{decryptedText && (
					<button
						type="button"
						onClick={() => (window.location.href = "/handshake/step-1")}
						className="rounded-lg bg-surface-700 px-6 py-2.5 font-medium text-white hover:bg-surface-600 transition-colors text-sm"
					>
						Start Over
					</button>
				)}
			</div>

			<p className="mt-6 text-sm text-surface-500">
				The hybrid handshake is complete. The message was encrypted and
				decrypted securely — never exposed on the wire.
			</p>
		</motion.div>
	);
}
