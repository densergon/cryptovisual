import { createFileRoute } from "@tanstack/react-router";
import { Key } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PadlockMetaphor } from "@/shared/components/pedagogy/PadlockMetaphor";
import { PrimeSearchTicker } from "@/shared/components/pedagogy/PrimeSearchTicker";
import { StepGuide } from "@/shared/components/StepGuide";
import { useCanvas } from "@/shared/providers/CanvasProvider";
import { useCryptoWorker } from "@/shared/providers/CryptoWorkerProvider";
import { usePedagogyMode } from "@/shared/providers/PedagogyModeProvider";
import { useWizard } from "@/state/wizard-provider";
import { KeygenVisualizer } from "@/visualization/scenes";

export const Route = createFileRoute("/handshake/step-1")({
	component: Step1Keygen,
});

function Step1Keygen() {
	const { engine } = useCanvas();
	const worker = useCryptoWorker();
	const keygenSceneRef = useRef<KeygenVisualizer | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [keySize, setKeySize] = useState<1024 | 2048 | 4096>(2048);
	const { goNext, rsaKeyPair, send } = useWizard();
	const { isPedagogyMode } = usePedagogyMode();
	const [error, setError] = useState<string | null>(null);
	const [keyData, setKeyData] = useState<{
		publicKey?: JsonWebKey;
		privateKey?: JsonWebKey;
		keySize?: number;
		durationMs?: number;
	} | null>(rsaKeyPair);

	useEffect(() => {
		if (!engine) return;

		const setupScene = async () => {
			const keygenScene = new KeygenVisualizer(
				engine.getApplication(),
				engine.getApplication().stage as any,
			);
			keygenScene.masterTimeline = engine.masterTimeline;
			await keygenScene.init();
			keygenSceneRef.current = keygenScene;

			// If keys already exist, play or show final scene state
			if (rsaKeyPair) {
				keygenScene.play();
			}
		};

		setupScene();

		return () => {
			keygenSceneRef.current?.destroy();
			keygenSceneRef.current = null;
		};
	}, [engine, rsaKeyPair]);

	const handleGenerateKeys = async () => {
		setIsGenerating(true);
		setError(null);
		try {
			if (!worker) throw new Error("Crypto worker not ready");
			const result = await worker.generateRSAKeyPair(keySize);
			if (!result.publicKey || !result.privateKey)
				throw new Error("Key generation failed");
			setKeyData(result);
			type ValidKeyPair = {
				publicKey: JsonWebKey;
				privateKey: JsonWebKey;
				keySize: number;
				durationMs: number;
			};
			send({ type: "SET_RSA_KEYPAIR", keyPair: result as ValidKeyPair });
			if (keygenSceneRef.current) {
				keygenSceneRef.current.play();
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Key generation failed";
			setError(message);
			console.error("Key generation failed:", err);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-asymmetric-500/10">
					<Key size={20} className="text-asymmetric-400" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-asymmetric-400">
						Key Generation
					</h2>
					<div className="mt-1">
						<StepGuide
							autoOpen
							sections={[
								{
									title: "The Padlock Metaphor",
									body: "Think of your Public Key as an open padlock. You can hand it out to anyone in the world. They can use it to snap a box shut (encrypt), but only you possess the physical Private Key required to open it (decrypt).",
								},
								{
									title: "The Math Behind the Lock",
									body: "The security of RSA comes from the difficulty of factoring the product of two massive prime numbers. While multiplying them is easy, reversing the process is computationally infeasible for current computers.",
								},
								{
									title: "Why 2048 Bits?",
									body: "Larger keys are more secure but slower. 2048 bits is the current industry standard and provides adequate security for most applications. 4096-bit keys are available for higher security needs.",
								},
							]}
						/>
					</div>
					<p className="text-sm text-surface-500">Step 1 of 6</p>
				</div>
			</div>

			<p className="mb-6 text-surface-400 leading-relaxed">
				The secure handshake begins by generating an asymmetric RSA key pair.
				Think of this as creating your unique identity on the web: a public key
				that the world uses to send you secret messages, and a private key that
				you keep guarded to unlock them.
			</p>

			<div className="mb-6 rounded-lg border border-asymmetric-500/20 bg-surface-950/40 h-64 relative overflow-hidden">
				{!isGenerating && !keyData && (
					<div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
						<div className="h-12 w-12 rounded-full border-2 border-dashed border-surface-700 flex items-center justify-center">
							<Key size={20} className="text-surface-600" />
						</div>
						<p className="text-sm text-surface-500 font-medium">
							Click "Generate Keys" to start the animation
						</p>
					</div>
				)}
				{isGenerating && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex items-center gap-3 rounded-lg bg-surface-950/80 px-4 py-2">
							<div className="h-2 w-2 rounded-full bg-asymmetric-400 animate-pulse" />
							<p className="text-sm text-surface-400 font-mono">
								Searching for massive prime numbers...
							</p>
						</div>
					</div>
				)}
			</div>

			{error && (
				<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{error}
				</div>
			)}

			{isPedagogyMode && <PadlockMetaphor />}

			{isPedagogyMode && <PrimeSearchTicker isGenerating={isGenerating} />}

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<label htmlFor="key-size-select" className="text-xs text-surface-400">
						RSA Key Size:
					</label>
					<select
						id="key-size-select"
						value={keySize}
						onChange={(e) =>
							setKeySize(Number(e.target.value) as 1024 | 2048 | 4096)
						}
						disabled={isGenerating || !!keyData}
						className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-sm text-surface-200 focus:border-asymmetric-500 focus:outline-none focus:ring-1 focus:ring-asymmetric-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<option value={2048}>2048 bits (standard)</option>
						<option value={4096}>4096 bits (high security, ~4x slower)</option>
					</select>
				</div>
				<button
					type="button"
					id="keygen-button"
					onClick={handleGenerateKeys}
					disabled={isGenerating}
					className="rounded-lg bg-asymmetric-600 px-6 py-2.5 font-medium text-white hover:bg-asymmetric-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isGenerating
						? "Searching for massive prime numbers..."
						: "Generate Keys"}
				</button>
				{keyData && (
					<button
						type="button"
						onClick={goNext}
						className="rounded-lg bg-surface-700 px-6 py-2.5 font-medium text-white hover:bg-surface-600 transition-colors"
					>
						Continue
					</button>
				)}
			</div>

			{keyData && (
				<div className="rounded-lg border border-surface-700/80 bg-surface-950/60 backdrop-blur-sm p-6">
					<h3 className="mb-3 font-semibold text-white">
						RSA Key Pair Generated
					</h3>
					<div className="space-y-3">
						<div className="rounded bg-surface-800/60 p-3">
							<span className="text-xs text-surface-500">Public Key</span>
							<pre className="mt-1 text-xs text-asymmetric-300 font-mono break-all">
								{JSON.stringify(keyData.publicKey, null, 2)}
							</pre>
						</div>
						<div className="rounded bg-surface-800/60 p-3">
							<span className="text-xs text-surface-500">
								Private Key (secret)
							</span>
							<pre className="mt-1 text-xs text-asymmetric-300 font-mono break-all">
								{JSON.stringify(keyData.privateKey, null, 2)}
							</pre>
						</div>
						<div className="flex gap-4 text-xs text-surface-500">
							<span>Key Size: {keyData.keySize} bits</span>
							<span>Generation Time: {keyData.durationMs?.toFixed(2)}ms</span>
						</div>
					</div>
				</div>
			)}

			<p className="mt-6 text-sm text-surface-500">
				RSA key sizes typically range from 2048 to 4096 bits. Larger keys
				provide stronger security but slower performance.
			</p>
		</motion.div>
	);
}
