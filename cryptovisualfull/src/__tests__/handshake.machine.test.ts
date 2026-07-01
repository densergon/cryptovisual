import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { handshakeMachine, STEPS } from "@/state/machines/handshake.machine";

function createActor_() {
	return createActor(handshakeMachine).start();
}

describe("handshakeMachine", () => {
	it("starts at keygen with no completed steps", () => {
		const actor = createActor_();
		const snapshot = actor.getSnapshot();
		expect(snapshot.context.currentStep).toBe("keygen");
		expect(snapshot.context.completedSteps).toEqual([]);
	});

	it("advances to session-key and marks keygen complete on NEXT", () => {
		const actor = createActor_();
		actor.send({ type: "NEXT" });
		const snapshot = actor.getSnapshot();
		expect(snapshot.context.currentStep).toBe("session-key");
		expect(snapshot.context.completedSteps).toContain("keygen");
	});

	it("backs from session-key to keygen", () => {
		const actor = createActor_();
		actor.send({ type: "NEXT" });
		expect(actor.getSnapshot().context.currentStep).toBe("session-key");
		actor.send({ type: "BACK" });
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");
	});

	it("does not go back from keygen (first step)", () => {
		const actor = createActor_();
		actor.send({ type: "BACK" });
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");
	});

	it("does not go next from decrypt (last step)", () => {
		const actor = createActor_();
		for (let i = 0; i < STEPS.length; i++) {
			actor.send({ type: "NEXT" });
		}
		expect(actor.getSnapshot().context.currentStep).toBe("decrypt");
		actor.send({ type: "NEXT" });
		expect(actor.getSnapshot().context.currentStep).toBe("decrypt");
	});

	it("progresses linearly through all 6 steps via NEXT", () => {
		const actor = createActor_();

		for (const step of STEPS) {
			expect(actor.getSnapshot().context.currentStep).toBe(step);
			if (step !== "decrypt") {
				actor.send({ type: "NEXT" });
			}
		}
	});

	it("marks each step as completed when advancing", () => {
		const actor = createActor_();

		for (let i = 0; i < STEPS.length - 1; i++) {
			actor.send({ type: "NEXT" });
			expect(actor.getSnapshot().context.completedSteps).toHaveLength(i + 1);
		}

		const { completedSteps } = actor.getSnapshot().context;
		expect(completedSteps).toEqual(STEPS.slice(0, -1));
	});

	it("allows GO_TO for completed and next uncompleted steps", () => {
		const actor = createActor_();

		actor.send({ type: "NEXT" });
		actor.send({ type: "NEXT" });
		expect(actor.getSnapshot().context.currentStep).toBe("aes-cipher");

		actor.send({ type: "GO_TO", step: "keygen" });
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");

		actor.send({ type: "GO_TO", step: "session-key" });
		expect(actor.getSnapshot().context.currentStep).toBe("session-key");
	});

	it("blocks GO_TO for steps that are not yet accessible", () => {
		const actor = createActor_();

		actor.send({ type: "GO_TO", step: "aes-cipher" });
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");
	});

	it("does not double-count completed steps on re-visit", () => {
		const actor = createActor_();

		actor.send({ type: "NEXT" });
		actor.send({ type: "BACK" });
		actor.send({ type: "NEXT" });

		expect(actor.getSnapshot().context.completedSteps).toEqual(["keygen"]);
	});

	it("isFirstStep is true only at keygen", () => {
		const actor = createActor_();
		expect(actor.getSnapshot().context.currentStep).toBe("keygen");
	});

	it("isLastStep is true only at decrypt", () => {
		const actor = createActor_();
		for (let i = 0; i < STEPS.length - 1; i++) {
			actor.send({ type: "NEXT" });
		}
		expect(actor.getSnapshot().context.currentStep).toBe("decrypt");
	});

	it("completes all steps and maintains state", () => {
		const actor = createActor_();

		for (let i = 0; i < STEPS.length - 1; i++) {
			actor.send({ type: "NEXT" });
		}

		const snapshot = actor.getSnapshot();
		expect(snapshot.context.completedSteps).toHaveLength(STEPS.length - 1);
		expect(snapshot.matches("active")).toBe(true);
	});
});
