import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useWizard } from "../state/wizard-provider";
import { useCryptoWorker } from "../shared/providers/CryptoWorkerProvider";
import { Celebration } from "../shared/components/Celebration";
import { StepGuide } from "../shared/components/StepGuide";
import { KeyMatchGlow } from "../shared/components/pedagogy/KeyMatchGlow";
import { TwoStepUnlock } from "../shared/components/pedagogy/TwoStepUnlock";
import { usePedagogyMode } from "../shared/providers/PedagogyModeProvider";

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
	const attemptedRef = useRef(false);

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
			attemptedRef.current
		)
			return;

		attemptedRef.current = true;

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
	}, [rsaKeyPair, wrappedSessionKey, ciphertext, worker, tampered]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
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

			{isDecrypting && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border border-asymmetric-500/30 bg-surface-950/60 backdrop-blur-sm p-4">
					<Loader2 size={18} className="animate-spin text-asymmetric-400" />
					<span className="text-sm text-surface-300">
						Unwrapping envelope and decrypting payload...
					</span>
				</div>
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
					<div className="rounded bg-surface-800/60 p-3">
						<span className="text-xs text-success font-bold">
							3. Integrity Verified: Message Authentic
						</span>
						<pre className="mt-1 text-sm text-surface-300 font-mono">
							{isDecrypting
								? "Decrypting..."
								: decryptedText ?? plaintext}
						</pre>
					</div>
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

			<div className="mt-4 flex gap-3">
				<button
					onClick={() => {
						attemptedRef.current = false;
						setDecryptedText(null);
						setUnwrapDuration(undefined);
						setAesDuration(undefined);
						setTampered(false);
					}}
					className="rounded-lg bg-symmetric-600 px-6 py-2.5 font-medium text-white hover:bg-symmetric-500 transition-colors text-sm"
				>
					Retry Decryption
				</button>
				<button
					onClick={() => {
						attemptedRef.current = false;
						setDecryptedText(null);
						setUnwrapDuration(undefined);
						setAesDuration(undefined);
						setTampered(true);
					}}
					className="rounded-lg bg-red-700 px-6 py-2.5 font-medium text-white hover:bg-red-600 transition-colors text-sm"
				>
					Simulate Tampered Packet
				</button>
			</div>

			<p className="mt-6 text-sm text-surface-500">
				The hybrid handshake is complete. The message was encrypted and
				decrypted securely — never exposed on the wire.
			</p>
		</motion.div>
	);
}
