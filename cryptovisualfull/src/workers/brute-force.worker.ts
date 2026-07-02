import type { BruteForceRequest } from "./brute-force.protocol";

function factorize(
	n: number,
	onProgress: (
		current: number,
		max: number,
		found: boolean,
		p?: number,
		q?: number,
	) => void,
): { p: number; q: number; iterations: number } {
	const maxIterations = Math.floor(Math.sqrt(n));
	let iterations = 0;

	for (let i = 2; i <= maxIterations; i++) {
		iterations++;
		if (n % i === 0) {
			const p = i;
			const q = n / i;
			onProgress(i, maxIterations, true, p, q);
			return { p, q, iterations };
		}
		if (iterations % 1000 === 0) {
			onProgress(i, maxIterations, false);
		}
	}

	throw new Error("Could not factor modulus");
}

self.onmessage = (event: MessageEvent<BruteForceRequest>) => {
	const request = event.data;

	if (request.type !== "BRUTE_FORCE_START") return;

	const startTime = performance.now();

	try {
		const result = factorize(
			request.payload.modulus,
			(current, max, found, p, q) => {
				self.postMessage({
					type: "BRUTE_FORCE_PROGRESS",
					requestId: request.requestId,
					payload: { current, max, found, p, q },
				});
			},
		);

		const durationMs = performance.now() - startTime;
		self.postMessage({
			type: "BRUTE_FORCE_COMPLETE",
			requestId: request.requestId,
			payload: {
				p: result.p,
				q: result.q,
				iterations: result.iterations,
				durationMs,
			},
		});
	} catch (_error) {
		self.postMessage({
			type: "BRUTE_FORCE_COMPLETE",
			requestId: request.requestId,
			payload: {
				p: 0,
				q: 0,
				iterations: 0,
				durationMs: performance.now() - startTime,
			},
		});
	}
};
