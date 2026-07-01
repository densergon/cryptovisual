import { beforeEach, describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { handshakeMachine, STEPS } from "@/state/machines/handshake.machine";

function setupSessionStorage() {
	const store = new Map<string, string>();
	const mockStorage = {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
		get length() {
			return store.size;
		},
		key: (index: number) => [...store.keys()][index] ?? null,
	};
	(globalThis as Record<string, unknown>).sessionStorage = mockStorage;
	(globalThis as Record<string, unknown>).window = {} as Window &
		typeof globalThis;
}

function teardownSessionStorage() {
	delete (globalThis as Record<string, unknown>).sessionStorage;
	delete (globalThis as Record<string, unknown>).window;
}

const mockRsaKeyPair = {
	publicKey: { kty: "RSA" as const, n: "test", e: "AQAB" },
	privateKey: {
		kty: "RSA" as const,
		n: "test",
		e: "AQAB",
		d: "test",
		p: "test",
		q: "test",
	},
	keySize: 2048,
	durationMs: 150,
};

const mockAesKey = {
	keyBytes: new Uint8Array([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
		22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
	]),
	iv: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
	durationMs: 5,
};

function serializeContext(ctx: Record<string, unknown>): string {
	return JSON.stringify(ctx, (_key, value) => {
		if (value instanceof Uint8Array) {
			return { __type: "Uint8Array", data: Array.from(value) };
		}
		return value;
	});
}

describe("XState Hydration Hardening", () => {
	beforeEach(() => {
		teardownSessionStorage();
	});

	it("starts with default context (hydration moved to WizardProvider useEffect)", () => {
		setupSessionStorage();
		sessionStorage.setItem(
			"cv_wizard_state",
			serializeContext({
				currentStep: "aes-cipher",
				completedSteps: ["keygen", "session-key"],
				rsaKeyPair: mockRsaKeyPair,
				aesKey: mockAesKey,
				ciphertext: null,
				wrappedSessionKey: null,
			}),
		);

		const actor = createActor(handshakeMachine).start();
		const ctx = actor.getSnapshot().context;

		// Machine no longer hydrates from sessionStorage — WizardProvider useEffect does it
		expect(ctx.currentStep).toBe("keygen");
		expect(ctx.completedSteps).toEqual([]);
		expect(ctx.rsaKeyPair).toBeNull();
		expect(ctx.aesKey).toBeNull();
	});

	it("falls back to default context when sessionStorage is empty", () => {
		setupSessionStorage();
		sessionStorage.setItem("cv_wizard_state", "");

		const actor = createActor(handshakeMachine).start();
		const ctx = actor.getSnapshot().context;

		expect(ctx.currentStep).toBe("keygen");
		expect(ctx.completedSteps).toEqual([]);
		expect(ctx.rsaKeyPair).toBeNull();
	});

	it("falls back to default context on corrupt sessionStorage data", () => {
		setupSessionStorage();
		sessionStorage.setItem("cv_wizard_state", "{invalid json!!!");

		const actor = createActor(handshakeMachine).start();
		const ctx = actor.getSnapshot().context;

		expect(ctx.currentStep).toBe("keygen");
		expect(ctx.completedSteps).toEqual([]);
	});

	it("canGoTo works with default context", () => {
		setupSessionStorage();
		sessionStorage.setItem(
			"cv_wizard_state",
			serializeContext({
				currentStep: "aes-cipher",
				completedSteps: ["keygen", "session-key"],
				rsaKeyPair: null,
				aesKey: null,
				ciphertext: null,
				wrappedSessionKey: null,
			}),
		);

		const actor = createActor(handshakeMachine).start();

		// Default context: completedSteps=[], so only step at index 0 is accessible
		expect(actor.getSnapshot().can({ type: "GO_TO", step: "keygen" })).toBe(
			true,
		);
		expect(
			actor.getSnapshot().can({ type: "GO_TO", step: "session-key" }),
		).toBe(false);
		expect(actor.getSnapshot().can({ type: "GO_TO", step: "aes-cipher" })).toBe(
			false,
		);
		expect(
			actor.getSnapshot().can({ type: "GO_TO", step: "hybrid-envelope" }),
		).toBe(false);
		expect(
			actor.getSnapshot().can({ type: "GO_TO", step: "wire-simulation" }),
		).toBe(false);
		expect(actor.getSnapshot().can({ type: "GO_TO", step: "decrypt" })).toBe(
			false,
		);
	});

	it("Uint8Array serialization round-trip preserves all values", () => {
		const original = new Uint8Array([
			0, 1, 255, 128, 64, 32, 16, 8, 4, 2, 127, 254, 0, 255, 128, 0,
		]);
		const serialized = JSON.stringify(original, (_key, value) => {
			if (value instanceof Uint8Array) {
				return { __type: "Uint8Array", data: Array.from(value) };
			}
			return value;
		});
		const deserialized = JSON.parse(serialized, (_key, value) => {
			if (value && value.__type === "Uint8Array") {
				return new Uint8Array(value.data);
			}
			return value;
		});

		expect(deserialized).toBeInstanceOf(Uint8Array);
		expect(deserialized.length).toBe(16);
		expect(Array.from(deserialized as Uint8Array)).toEqual(
			Array.from(original),
		);
	});

	it("completes full linear flow from default context", () => {
		setupSessionStorage();
		sessionStorage.setItem(
			"cv_wizard_state",
			serializeContext({
				currentStep: "session-key",
				completedSteps: ["keygen"],
				rsaKeyPair: null,
				aesKey: null,
				ciphertext: null,
				wrappedSessionKey: null,
			}),
		);

		const actor = createActor(handshakeMachine).start();

		// Starts from default (keygen), steps through all 6 steps
		for (let i = 0; i < STEPS.length - 1; i++) {
			actor.send({ type: "NEXT" });
		}

		const ctx = actor.getSnapshot().context;
		expect(ctx.currentStep).toBe("decrypt");
		expect(ctx.completedSteps).toHaveLength(5);
		expect(ctx.completedSteps).toEqual([
			"keygen",
			"session-key",
			"aes-cipher",
			"hybrid-envelope",
			"wire-simulation",
		]);
	});
});
