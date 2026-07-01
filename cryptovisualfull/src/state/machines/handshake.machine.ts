import { assign, setup } from "xstate";

export type HandshakeStep =
	| "keygen"
	| "session-key"
	| "aes-cipher"
	| "hybrid-envelope"
	| "wire-simulation"
	| "decrypt";

export const STEPS: HandshakeStep[] = [
	"keygen",
	"session-key",
	"aes-cipher",
	"hybrid-envelope",
	"wire-simulation",
	"decrypt",
];

export const STEP_LABELS: Record<HandshakeStep, string> = {
	keygen: "Key Generation",
	"session-key": "Session Key",
	"aes-cipher": "AES Cipher",
	"hybrid-envelope": "Hybrid Envelope",
	"wire-simulation": "Wire Simulation",
	decrypt: "Decrypt",
};

export interface HandshakeContext {
	currentStep: HandshakeStep;
	completedSteps: HandshakeStep[];
	// Crypto state
	rsaKeyPair: {
		publicKey: JsonWebKey;
		privateKey: JsonWebKey;
		keySize: number;
		durationMs: number;
	} | null;
	aesKey: { keyBytes: Uint8Array; iv: Uint8Array; durationMs: number } | null;
	ciphertext: {
		data: Uint8Array;
		iv: Uint8Array;
		authTag?: Uint8Array;
		durationMs: number;
	} | null;
	wrappedSessionKey: { data: Uint8Array; durationMs: number } | null;
}

export type HandshakeEvent =
	| { type: "NEXT" }
	| { type: "BACK" }
	| { type: "GO_TO"; step: HandshakeStep }
	| {
			type: "RESTORE";
			state: Partial<Pick<HandshakeContext,
				| "currentStep"
				| "completedSteps"
				| "rsaKeyPair"
				| "aesKey"
				| "ciphertext"
				| "wrappedSessionKey"
			>>;
		}
	| { type: "SET_RSA_KEYPAIR"; keyPair: HandshakeContext["rsaKeyPair"] }
	| { type: "SET_AES_KEY"; key: HandshakeContext["aesKey"] }
	| { type: "SET_CIPHERTEXT"; ciphertext: HandshakeContext["ciphertext"] }
	| {
			type: "SET_WRAPPED_KEY";
			wrappedKey: HandshakeContext["wrappedSessionKey"];
	  };

export const handshakeMachine = setup({
	types: {
		context: {} as HandshakeContext,
		events: {} as HandshakeEvent,
	},
	guards: {
		canGoNext: ({ context }) => {
			const idx = STEPS.indexOf(context.currentStep);
			return idx < STEPS.length - 1;
		},
		canGoBack: ({ context }) => {
			const idx = STEPS.indexOf(context.currentStep);
			return idx > 0;
		},
		canGoTo: ({ context, event }) => {
			if (event.type !== "GO_TO") return false;
			return STEPS.indexOf(event.step) <= context.completedSteps.length;
		},
	},
	actions: {
		markStepComplete: assign({
			completedSteps: ({ context }) => {
				const step = context.currentStep;
				if (context.completedSteps.includes(step)) {
					return context.completedSteps;
				}
				return [...context.completedSteps, step];
			},
		}),
		advanceStep: assign({
			currentStep: ({ context }) => {
				const idx = STEPS.indexOf(context.currentStep);
				return STEPS[Math.min(idx + 1, STEPS.length - 1)];
			},
		}),
		retreatStep: assign({
			currentStep: ({ context }) => {
				const idx = STEPS.indexOf(context.currentStep);
				return STEPS[Math.max(idx - 1, 0)];
			},
		}),
		goToStep: assign({
			currentStep: ({ event }) => {
				if (event.type !== "GO_TO") return "keygen";
				return event.step;
			},
		}),
		setRsaKeyPair: assign({
			rsaKeyPair: ({ event }) => {
				if (event.type !== "SET_RSA_KEYPAIR") return null;
				return event.keyPair;
			},
		}),
		setAesKey: assign({
			aesKey: ({ event }) => {
				if (event.type !== "SET_AES_KEY") return null;
				return event.key;
			},
		}),
		setCiphertext: assign({
			ciphertext: ({ event }) => {
				if (event.type !== "SET_CIPHERTEXT") return null;
				return event.ciphertext;
			},
		}),
		setWrappedKey: assign({
			wrappedSessionKey: ({ event }) => {
				if (event.type !== "SET_WRAPPED_KEY") return null;
				return event.wrappedKey;
			},
		}),
		restoreState: assign(({ event }) => {
			if (event.type !== "RESTORE") return {};
			const r = event.state;
			return {
				currentStep: r.currentStep ?? "keygen",
				completedSteps: r.completedSteps ?? [],
				rsaKeyPair: r.rsaKeyPair ?? null,
				aesKey: r.aesKey ?? null,
				ciphertext: r.ciphertext ?? null,
				wrappedSessionKey: r.wrappedSessionKey ?? null,
			};
		}),
	},
}).createMachine({
	id: "handshake",
	initial: "active",
	context: {
		currentStep: "keygen" as HandshakeStep,
		completedSteps: [] as HandshakeStep[],
		rsaKeyPair: null as HandshakeContext["rsaKeyPair"],
		aesKey: null as HandshakeContext["aesKey"],
		ciphertext: null as HandshakeContext["ciphertext"],
		wrappedSessionKey: null as HandshakeContext["wrappedSessionKey"],
	},
	states: {
		active: {
			on: {
				NEXT: {
					guard: "canGoNext",
					actions: ["markStepComplete", "advanceStep"],
				},
				BACK: {
					guard: "canGoBack",
					actions: ["retreatStep"],
				},
				GO_TO: {
					guard: "canGoTo",
					actions: ["goToStep"],
				},
				RESTORE: {
					actions: ["restoreState"],
				},
				SET_RSA_KEYPAIR: {
					actions: ["setRsaKeyPair"],
				},
				SET_AES_KEY: {
					actions: ["setAesKey"],
				},
				SET_CIPHERTEXT: {
					actions: ["setCiphertext"],
				},
				SET_WRAPPED_KEY: {
					actions: ["setWrappedKey"],
				},
			},
		},
	},
});
