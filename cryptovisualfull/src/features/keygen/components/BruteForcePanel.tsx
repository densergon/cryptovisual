import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BruteForceWorkerClient } from "../../../workers/brute-force-client";

interface BruteForcePanelProps {
	onComplete?: (p: number, q: number, durationMs: number) => void;
}

function generateChallenge(): { p: number; q: number; modulus: number } {
	const isPrime = (n: number): boolean => {
		if (n < 2) return false;
		for (let i = 2; i * i <= n; i++) {
			if (n % i === 0) return false;
		}
		return true;
	};

	const randomPrime = (bits: number): number => {
		const min = 1 << (bits - 1);
		const max = (1 << bits) - 1;
		while (true) {
			const n = min + Math.floor(Math.random() * (max - min));
			if (isPrime(n)) return n;
		}
	};

	const p = randomPrime(8);
	let q: number;
	do {
		q = randomPrime(8);
	} while (q === p);

	return { p, q, modulus: p * q };
}

export function BruteForcePanel({ onComplete }: BruteForcePanelProps) {
	const [isRunning, setIsRunning] = useState(false);
	const [current, setCurrent] = useState(0);
	const [max, setMax] = useState(0);
	const [foundFactor, setFoundFactor] = useState<{
		p: number;
		q: number;
	} | null>(null);
	const [durationMs, setDurationMs] = useState<number | null>(null);
	const [iterations, setIterations] = useState(0);
	const [modulus, setModulus] = useState<number | null>(null);
	const clientRef = useRef<BruteForceWorkerClient | null>(null);

	const progress = max > 0 ? Math.min((current / max) * 100, 100) : 0;

	const startBruteForce = async () => {
		const { modulus: mod } = generateChallenge();
		setModulus(mod);
		setFoundFactor(null);
		setDurationMs(null);
		setIterations(0);
		setCurrent(0);
		setIsRunning(true);

		const client = new BruteForceWorkerClient();
		clientRef.current = client;

		try {
			const result = await client.startBruteForce(mod, (progress) => {
				setCurrent(progress.current);
				setMax(progress.max);
				if (progress.found && progress.p && progress.q) {
					setFoundFactor({ p: progress.p, q: progress.q });
				}
			});
			setIterations(result.iterations);
			setDurationMs(result.durationMs);
			onComplete?.(result.p, result.q, result.durationMs);
		} catch (error) {
			console.error("Brute-force failed:", error);
		} finally {
			setIsRunning(false);
		}
	};

	useEffect(() => {
		return () => {
			clientRef.current?.terminate();
		};
	}, []);

	return (
		<div className="mt-6 rounded-lg border border-red-500/30 bg-surface-950/60 p-5">
			<div className="mb-1 flex items-center gap-2">
				<span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
					Break Me!
				</span>
				<span className="text-[10px] text-surface-500">
					See how small keys can be cracked in seconds
				</span>
			</div>

			{!isRunning && !foundFactor && (
				<button
					type="button"
					onClick={startBruteForce}
					className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
				>
					Run Brute-Force Attack
				</button>
			)}

			{isRunning && (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
						<span className="text-xs font-mono text-red-400">
							Cracking modulus {modulus}...
						</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-surface-800">
						<motion.div
							className="h-full rounded-full bg-red-500"
							initial={{ width: "0%" }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.1 }}
						/>
					</div>
					<p className="text-[10px] text-surface-500 font-mono">
						Trying factor {current.toLocaleString()} of {max.toLocaleString()}
					</p>
				</div>
			)}

			{foundFactor && (
				<div className="mt-3 space-y-3">
					<div className="rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/30">
						<span className="text-xs font-bold text-red-400">
							Cracked! Private key discovered
						</span>
						<div className="mt-2 font-mono text-xs text-surface-300">
							<p>
								Modulus {modulus} = {foundFactor.p}
								{" × "}
								{foundFactor.q}
							</p>
							<p className="mt-1 text-surface-500">
								Iterations: {iterations.toLocaleString()} | Time:{" "}
								{durationMs?.toFixed(1)}ms
							</p>
						</div>
					</div>
					<div className="rounded-lg bg-hybrid-500/10 p-3 ring-1 ring-hybrid-500/30">
						<p className="text-xs text-hybrid-300">
							This is why 2048-bit keys matter. A 16-bit modulus has only ~
							{Math.floor(Math.sqrt(65535)).toLocaleString()} possible factors
							to check. A 2048-bit modulus has roughly{" "}
							{(10 ** 308).toExponential(0)} possibilities — more than the atoms
							in the observable universe.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
