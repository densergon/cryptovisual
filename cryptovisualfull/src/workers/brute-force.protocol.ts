export interface BruteForceStartRequest {
	type: "BRUTE_FORCE_START";
	requestId: string;
	payload: {
		modulus: number;
	};
}

export interface BruteForceProgress {
	type: "BRUTE_FORCE_PROGRESS";
	requestId: string;
	payload: {
		current: number;
		max: number;
		found: boolean;
		p?: number;
		q?: number;
	};
}

export interface BruteForceComplete {
	type: "BRUTE_FORCE_COMPLETE";
	requestId: string;
	payload: {
		p: number;
		q: number;
		iterations: number;
		durationMs: number;
	};
}

export type BruteForceRequest = BruteForceStartRequest;

export type BruteForceResponse = BruteForceProgress | BruteForceComplete;
