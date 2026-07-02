import type {
	BruteForceComplete,
	BruteForceProgress,
	BruteForceResponse,
	BruteForceStartRequest,
} from "./brute-force.protocol";

export class BruteForceWorkerClient {
	private worker: Worker;
	private pendingRequests: Map<
		string,
		{
			resolve: (response: BruteForceComplete) => void;
			reject: (error: Error) => void;
			onProgress?: (progress: BruteForceProgress["payload"]) => void;
		}
	> = new Map();

	constructor() {
		this.worker = new Worker(
			new URL("./brute-force.worker.ts", import.meta.url),
			{ type: "module" },
		);

		this.worker.onmessage = (event: MessageEvent<BruteForceResponse>) => {
			const response = event.data;
			const pending = this.pendingRequests.get(response.requestId);

			if (!pending) return;

			if (response.type === "BRUTE_FORCE_PROGRESS") {
				pending.onProgress?.(response.payload);
				if (response.payload.found) {
					return;
				}
			}

			if (response.type === "BRUTE_FORCE_COMPLETE") {
				pending.resolve(response);
				this.pendingRequests.delete(response.requestId);
			}
		};

		this.worker.onerror = (error) => {
			console.error("BruteForce worker error:", error);
			this.pendingRequests.forEach((pending) => {
				pending.reject(new Error("BruteForce worker error"));
			});
			this.pendingRequests.clear();
		};
	}

	async startBruteForce(
		modulus: number,
		onProgress?: (progress: BruteForceProgress["payload"]) => void,
	): Promise<BruteForceComplete["payload"]> {
		const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

		return new Promise<BruteForceComplete>((resolve, reject) => {
			this.pendingRequests.set(requestId, { resolve, reject, onProgress });

			const request: BruteForceStartRequest = {
				type: "BRUTE_FORCE_START",
				requestId,
				payload: { modulus },
			};

			this.worker.postMessage(request);
		}).then((response) => response.payload);
	}

	terminate(): void {
		this.worker.terminate();
		this.pendingRequests.clear();
	}
}
