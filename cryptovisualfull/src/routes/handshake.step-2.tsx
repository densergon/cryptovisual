import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { StepGuide } from "@/shared/components/StepGuide";
import { useCanvas } from "@/shared/providers/CanvasProvider";
import { useCryptoWorker } from "@/shared/providers/CryptoWorkerProvider";
import { useWizard } from "@/state/wizard-provider";
import { BitStreamVisualizer } from "@/visualization/scenes";

export const Route = createFileRoute("/handshake/step-2")({
	component: Step2SessionKey,
});

function Step2SessionKey() {
	const { engine } = useCanvas();
	const worker = useCryptoWorker();
	const bitStreamSceneRef = useRef<BitStreamVisualizer | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const { goNext, aesKey, send } = useWizard();

	const arrayToHex = (arr: Uint8Array) =>
		Array.from(arr)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	const hexToUint8Array = (hex: string) => {
		const match = hex.match(/.{1,2}/g);
		return new Uint8Array(match ? match.map((byte) => parseInt(byte, 16)) : []);
	};

	const [keyData, setKeyData] = useState<{
		keyBytes?: string;
		iv?: string;
		durationMs?: number;
	} | null>(() => {
		if (aesKey) {
			return {
				keyBytes: arrayToHex(aesKey.keyBytes),
				iv: arrayToHex(aesKey.iv),
				durationMs: aesKey.durationMs,
			};
		}
		return null;
	});

	useEffect(() => {
		if (!engine) return;

		const setupScene = async () => {
			const bitStreamScene = new BitStreamVisualizer(
				engine.getApplication(),
				engine.getApplication().stage as any,
			);
			await bitStreamScene.init();
			bitStreamSceneRef.current = bitStreamScene;

			if (aesKey) {
				bitStreamScene.play();
			}
		};

		setupScene();

		return () => {
			bitStreamSceneRef.current?.destroy();
			bitStreamSceneRef.current = null;
		};
	}, [engine, aesKey]);

	const handleGenerateKey = async () => {
		setIsGenerating(true);
		try {
			if (!worker) throw new Error("Crypto worker not ready");
			const result = await worker.generateAESKey(256);
			if (!result.keyBytes || !result.iv)
				throw new Error("Key generation failed");
			setKeyData(result);
			send({
				type: "SET_AES_KEY",
				key: {
					keyBytes: hexToUint8Array(result.keyBytes),
					iv: hexToUint8Array(result.iv),
					durationMs: result.durationMs ?? 0,
				},
			});
			if (bitStreamSceneRef.current) {
				bitStreamSceneRef.current.play();
			}
		} catch (error) {
			console.error("AES key generation failed:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const formatKeyBytes = (hex: string) => {
		const bytes = hex.match(/.{1,2}/g) || [];
		return bytes.map((b, i) => (i % 8 === 0 ? `\n0x${b}` : `0x${b}`)).join(" ");
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-symmetric-500/10">
					<KeyRound size={20} className="text-symmetric-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-symmetric-400">Session Key</h2>
					<div className="mt-1">
						<StepGuide
							sections={[
								{
									title: "The Hybrid Secret",
									body: "Why not use RSA for everything? Because RSA is computationally expensive and slow for large files. We use a 'Hybrid' approach: AES for the heavy lifting (bulk encryption) and RSA only to protect the AES key itself.",
								},
								{
									title: "AES Symmetric Encryption",
									body: "AES is a symmetric cipher — the same key encrypts and decrypts. It's incredibly fast and efficient, making it the gold standard for securing the actual content of your messages.",
								},
								{
									title: "Why an IV?",
									body: "The initialization vector (IV) ensures that encrypting the same message twice produces different ciphertext. It prevents attackers from detecting patterns. The IV is not secret but must be unique per encryption.",
								},
							]}
						/>
					</div>
					<p className="text-sm text-surface-500">Step 2 of 6</p>
				</div>
			</div>

			<p className="mb-6 text-surface-400 leading-relaxed">
				Since RSA is too slow for large amounts of data, we generate a temporary
				AES-256 session key. This symmetric key handles the bulk encryption
				with incredible speed, while the RSA keys from Step 1 will be used
				only to securely transport this session key.
			</p>

			<div className="mb-6 grid grid-cols-2 gap-4">
				<div className="col-span-2 rounded-lg border border-surface-700 bg-surface-900/30 h-64 relative overflow-hidden">
					{/* Transparent overlay for the shared background canvas */}
				</div>
			</div>

			<div className="mb-6 flex gap-3">
				<button
					id="aes-button"
					onClick={handleGenerateKey}
					disabled={isGenerating}
					className="rounded-lg bg-symmetric-600 px-6 py-2.5 font-medium text-white hover:bg-symmetric-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isGenerating ? "Generating..." : "Generate Session Key"}
				</button>
				{keyData && (
					<button
						onClick={goNext}
						className="rounded-lg bg-surface-700 px-6 py-2.5 font-medium text-white hover:bg-surface-600 transition-colors"
					>
						Continue
					</button>
				)}
			</div>

			{keyData && (
				<div className="rounded-lg border border-surface-700 bg-surface-900 p-6">
					<h3 className="mb-3 font-semibold text-white">
						AES-256 Session Key Generated
					</h3>
					<div className="space-y-3">
						<div className="rounded bg-surface-800 p-3">
							<span className="text-xs text-surface-500">Session Key</span>
							<pre className="mt-1 text-xs text-symmetric-300 font-mono break-all">
								{formatKeyBytes(keyData.keyBytes!)}
							</pre>
						</div>
						<div className="rounded bg-surface-800 p-3">
							<span className="text-xs text-surface-500">
								Initialization Vector (IV)
							</span>
							<pre className="mt-1 text-xs text-symmetric-300 font-mono">
								{keyData.iv}
							</pre>
						</div>
						<div className="text-xs text-surface-500">
							Generation Time: {keyData.durationMs?.toFixed(2)}ms
						</div>
					</div>
				</div>
			)}

			<p className="mt-6 text-sm text-surface-500">
				AES-256 provides a 256-bit key space — 2²⁵⁶ possible combinations, which
				is currently infeasible to brute force.
			</p>
		</motion.div>
	);
}
