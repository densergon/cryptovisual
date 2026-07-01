import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createActor } from "xstate";
import type {
	HandshakeContext,
	HandshakeStep,
} from "@/state/machines/handshake.machine";
import { handshakeMachine, STEPS } from "@/state/machines/handshake.machine";

function createActor_() {
	return createActor(handshakeMachine).start();
}

const MOCK_KEY_PAIR: NonNullable<HandshakeContext["rsaKeyPair"]> = {
	publicKey: { kty: "RSA", n: "test", e: "AQAB" },
	privateKey: { kty: "RSA", n: "test", d: "test" },
	keySize: 2048,
	durationMs: 42,
};

const MOCK_AES_KEY: NonNullable<HandshakeContext["aesKey"]> = {
	keyBytes: new Uint8Array([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
		22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
	]),
	iv: new Uint8Array(16),
	durationMs: 15,
};

const MOCK_CIPHERTEXT: NonNullable<HandshakeContext["ciphertext"]> = {
	data: new Uint8Array([1, 2, 3, 4, 5]),
	iv: new Uint8Array(16),
	durationMs: 8,
};

const MOCK_WRAPPED_KEY: NonNullable<HandshakeContext["wrappedSessionKey"]> = {
	data: new Uint8Array([10, 20, 30, 40]),
	durationMs: 12,
};

describe("Wizard E2E", () => {
	let actor: ReturnType<typeof createActor_>;

	beforeEach(() => {
		actor = createActor_();
	});

	afterEach(() => {
		actor.stop();
	});

	it("completes full wizard with crypto state at each step", () => {
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");
		expect(actor.getSnapshot().context.rsaKeyPair).toBeNull();

		actor.send({ type: "SET_RSA_KEYPAIR", keyPair: MOCK_KEY_PAIR });
		let snap = actor.getSnapshot();
		expect(snap.context.rsaKeyPair).toEqual(MOCK_KEY_PAIR);

		actor.send({ type: "NEXT" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("session-key");
		expect(snap.context.completedSteps).toContain("keygen");
		expect(snap.context.aesKey).toBeNull();

		actor.send({ type: "SET_AES_KEY", key: MOCK_AES_KEY });
		snap = actor.getSnapshot();
		expect(snap.context.aesKey).toEqual(MOCK_AES_KEY);

		actor.send({ type: "NEXT" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("aes-cipher");
		expect(snap.context.completedSteps).toContain("session-key");
		expect(snap.context.ciphertext).toBeNull();

		actor.send({ type: "SET_CIPHERTEXT", ciphertext: MOCK_CIPHERTEXT });
		snap = actor.getSnapshot();
		expect(snap.context.ciphertext).toEqual(MOCK_CIPHERTEXT);

		actor.send({ type: "NEXT" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("hybrid-envelope");
		expect(snap.context.wrappedSessionKey).toBeNull();

		actor.send({ type: "SET_WRAPPED_KEY", wrappedKey: MOCK_WRAPPED_KEY });
		snap = actor.getSnapshot();
		expect(snap.context.wrappedSessionKey).toEqual(MOCK_WRAPPED_KEY);

		actor.send({ type: "NEXT" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("wire-simulation");

		actor.send({ type: "NEXT" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("decrypt");

		actor.send({ type: "NEXT" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("decrypt");

		expect(snap.context.completedSteps).toEqual(STEPS.slice(0, -1));
	});

	it("navigates back and forth preserving crypto state", () => {
		actor.send({ type: "SET_RSA_KEYPAIR", keyPair: MOCK_KEY_PAIR });
		actor.send({ type: "NEXT" });
		actor.send({ type: "SET_AES_KEY", key: MOCK_AES_KEY });
		actor.send({ type: "NEXT" });
		actor.send({ type: "SET_CIPHERTEXT", ciphertext: MOCK_CIPHERTEXT });

		let snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("aes-cipher");

		actor.send({ type: "BACK" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("session-key");
		expect(snap.context.rsaKeyPair).toEqual(MOCK_KEY_PAIR);
		expect(snap.context.aesKey).toEqual(MOCK_AES_KEY);

		actor.send({ type: "GO_TO", step: "aes-cipher" });
		snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("aes-cipher");
		expect(snap.context.ciphertext).toEqual(MOCK_CIPHERTEXT);
	});

	it("completes the first 4 steps with GO_TO and SET events", () => {
		const steps: { step: HandshakeStep; event: string; data: any }[] = [
			{
				step: "keygen",
				event: "SET_RSA_KEYPAIR",
				data: { keyPair: MOCK_KEY_PAIR },
			},
			{
				step: "session-key",
				event: "SET_AES_KEY",
				data: { key: MOCK_AES_KEY },
			},
			{
				step: "aes-cipher",
				event: "SET_CIPHERTEXT",
				data: { ciphertext: MOCK_CIPHERTEXT },
			},
			{
				step: "hybrid-envelope",
				event: "SET_WRAPPED_KEY",
				data: { wrappedKey: MOCK_WRAPPED_KEY },
			},
		];

		for (const { step, event, data } of steps) {
			actor.send({ type: event as any, ...data });
			if (step !== "hybrid-envelope") actor.send({ type: "NEXT" });
		}

		const snap = actor.getSnapshot();
		expect(snap.context.currentStep).toBe("hybrid-envelope");
		expect(snap.context.completedSteps).toHaveLength(3);
		expect(snap.context.rsaKeyPair).toEqual(MOCK_KEY_PAIR);
		expect(snap.context.aesKey).toEqual(MOCK_AES_KEY);
		expect(snap.context.ciphertext).toEqual(MOCK_CIPHERTEXT);
		expect(snap.context.wrappedSessionKey).toEqual(MOCK_WRAPPED_KEY);
	});

	it("allows jumping to completed steps via GO_TO after full state setup", () => {
		actor.send({ type: "SET_RSA_KEYPAIR", keyPair: MOCK_KEY_PAIR });
		actor.send({ type: "NEXT" });
		actor.send({ type: "SET_AES_KEY", key: MOCK_AES_KEY });
		actor.send({ type: "NEXT" });
		actor.send({ type: "SET_CIPHERTEXT", ciphertext: MOCK_CIPHERTEXT });
		actor.send({ type: "NEXT" });

		actor.send({ type: "GO_TO", step: "keygen" });
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");
		expect(actor.getSnapshot().context.rsaKeyPair).toEqual(MOCK_KEY_PAIR);

		actor.send({ type: "GO_TO", step: "session-key" });
		expect(actor.getSnapshot().context.currentStep).toBe("session-key");
		expect(actor.getSnapshot().context.aesKey).toEqual(MOCK_AES_KEY);

		actor.send({ type: "GO_TO", step: "aes-cipher" });
		expect(actor.getSnapshot().context.currentStep).toBe("aes-cipher");
		expect(actor.getSnapshot().context.ciphertext).toEqual(MOCK_CIPHERTEXT);
	});
});
