import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsx } from "react/jsx-runtime";
import { useActor } from "@xstate/react";
import { assign, setup } from "xstate";
//#region src/shared/providers/PedagogyModeProvider.tsx
var PedagogyModeContext = createContext(void 0);
function PedagogyModeProvider({ children }) {
	return /* @__PURE__ */ jsx(PedagogyModeContext.Provider, {
		value: { isPedagogyMode: true },
		children
	});
}
function usePedagogyMode() {
	if (!useContext(PedagogyModeContext)) throw new Error("usePedagogyMode must be used within a PedagogyModeProvider");
	return { isPedagogyMode: true };
}
//#endregion
//#region src/state/machines/handshake.machine.ts
var STEPS = [
	"keygen",
	"session-key",
	"aes-cipher",
	"hybrid-envelope",
	"wire-simulation",
	"decrypt"
];
var STEP_LABELS = {
	keygen: "Key Generation",
	"session-key": "Session Key",
	"aes-cipher": "AES Cipher",
	"hybrid-envelope": "Hybrid Envelope",
	"wire-simulation": "Wire Simulation",
	decrypt: "Decrypt"
};
var handshakeMachine = setup({
	types: {
		context: {},
		events: {}
	},
	guards: {
		canGoNext: ({ context }) => {
			return STEPS.indexOf(context.currentStep) < STEPS.length - 1;
		},
		canGoBack: ({ context }) => {
			return STEPS.indexOf(context.currentStep) > 0;
		},
		canGoTo: ({ context, event }) => {
			if (event.type !== "GO_TO") return false;
			return STEPS.indexOf(event.step) <= context.completedSteps.length;
		}
	},
	actions: {
		markStepComplete: assign({ completedSteps: ({ context }) => {
			const step = context.currentStep;
			if (context.completedSteps.includes(step)) return context.completedSteps;
			return [...context.completedSteps, step];
		} }),
		advanceStep: assign({ currentStep: ({ context }) => {
			const idx = STEPS.indexOf(context.currentStep);
			return STEPS[Math.min(idx + 1, STEPS.length - 1)];
		} }),
		retreatStep: assign({ currentStep: ({ context }) => {
			const idx = STEPS.indexOf(context.currentStep);
			return STEPS[Math.max(idx - 1, 0)];
		} }),
		goToStep: assign({ currentStep: ({ event }) => {
			if (event.type !== "GO_TO") return "keygen";
			return event.step;
		} }),
		setRsaKeyPair: assign({ rsaKeyPair: ({ event }) => {
			if (event.type !== "SET_RSA_KEYPAIR") return null;
			return event.keyPair;
		} }),
		setAesKey: assign({ aesKey: ({ event }) => {
			if (event.type !== "SET_AES_KEY") return null;
			return event.key;
		} }),
		setCiphertext: assign({ ciphertext: ({ event }) => {
			if (event.type !== "SET_CIPHERTEXT") return null;
			return event.ciphertext;
		} }),
		setWrappedKey: assign({ wrappedSessionKey: ({ event }) => {
			if (event.type !== "SET_WRAPPED_KEY") return null;
			return event.wrappedKey;
		} }),
		setPlaintext: assign({ plaintext: ({ event }) => {
			if (event.type !== "SET_PLAINTEXT") return "";
			return event.plaintext;
		} }),
		restoreState: assign(({ event }) => {
			if (event.type !== "RESTORE") return {};
			const r = event.state;
			return {
				currentStep: r.currentStep ?? "keygen",
				completedSteps: r.completedSteps ?? [],
				rsaKeyPair: r.rsaKeyPair ?? null,
				aesKey: r.aesKey ?? null,
				ciphertext: r.ciphertext ?? null,
				wrappedSessionKey: r.wrappedSessionKey ?? null
			};
		})
	}
}).createMachine({
	id: "handshake",
	initial: "active",
	context: {
		currentStep: "keygen",
		completedSteps: [],
		plaintext: "Hello, CryptoVisual!",
		rsaKeyPair: null,
		aesKey: null,
		ciphertext: null,
		wrappedSessionKey: null
	},
	states: { active: { on: {
		NEXT: {
			guard: "canGoNext",
			actions: ["markStepComplete", "advanceStep"]
		},
		BACK: {
			guard: "canGoBack",
			actions: ["retreatStep"]
		},
		GO_TO: {
			guard: "canGoTo",
			actions: ["goToStep"]
		},
		RESTORE: { actions: ["restoreState"] },
		SET_RSA_KEYPAIR: { actions: ["setRsaKeyPair"] },
		SET_AES_KEY: { actions: ["setAesKey"] },
		SET_CIPHERTEXT: { actions: ["setCiphertext"] },
		SET_WRAPPED_KEY: { actions: ["setWrappedKey"] },
		SET_PLAINTEXT: { actions: ["setPlaintext"] }
	} } }
});
//#endregion
//#region src/state/wizard-provider.tsx
var STEP_ROUTES = {
	keygen: "/handshake/step-1",
	"session-key": "/handshake/step-2",
	"aes-cipher": "/handshake/step-3",
	"hybrid-envelope": "/handshake/step-4",
	"wire-simulation": "/handshake/step-5",
	decrypt: "/handshake/step-6"
};
var WizardContext = createContext(null);
function WizardProvider({ children }) {
	const navigate = useNavigate();
	const [snapshot, send] = useActor(handshakeMachine);
	const { currentStep, completedSteps, plaintext, rsaKeyPair, aesKey, ciphertext, wrappedSessionKey } = snapshot.context;
	const [visualizationEngine, _setVisualizationEngine] = useState(null);
	const [isCanvasReady, _setIsCanvasReady] = useState(false);
	const canvasRef = useRef(null);
	const restoredRef = useRef(false);
	const [restorationComplete, setRestorationComplete] = useState(false);
	const doRestore = useCallback(() => {
		if (restoredRef.current) return;
		restoredRef.current = true;
		const saved = sessionStorage.getItem("cv_wizard_state");
		if (saved) try {
			send({
				type: "RESTORE",
				state: JSON.parse(saved, (_key, value) => {
					if (value && value.__type === "Uint8Array") return new Uint8Array(value.data);
					return value;
				})
			});
		} catch (e) {
			console.error("Error restoring cv_wizard_state", e);
		}
		setRestorationComplete(true);
	}, [send]);
	useEffect(() => {
		doRestore();
	}, [doRestore]);
	useEffect(() => {
		const handler = () => {
			sessionStorage.removeItem("cv_wizard_state");
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, []);
	useEffect(() => {
		if (!restorationComplete) return;
		navigate({ to: STEP_ROUTES[currentStep] });
	}, [
		currentStep,
		navigate,
		restorationComplete
	]);
	useEffect(() => {
		const serialized = JSON.stringify(snapshot.context, (_key, value) => {
			if (value instanceof Uint8Array) return {
				__type: "Uint8Array",
				data: Array.from(value)
			};
			return value;
		});
		sessionStorage.setItem("cv_wizard_state", serialized);
	}, [snapshot.context]);
	const value = {
		currentStep,
		currentStepIndex: STEPS.indexOf(currentStep),
		completedSteps,
		totalSteps: STEPS.length,
		isFirstStep: STEPS.indexOf(currentStep) === 0,
		isLastStep: STEPS.indexOf(currentStep) === STEPS.length - 1,
		goNext: () => send({ type: "NEXT" }),
		goBack: () => send({ type: "BACK" }),
		goToStep: (step) => send({
			type: "GO_TO",
			step
		}),
		isStepComplete: (step) => completedSteps.includes(step),
		isStepAccessible: (step) => STEPS.indexOf(step) <= completedSteps.length,
		visualizationEngine,
		isCanvasReady,
		canvasRef,
		plaintext,
		rsaKeyPair,
		aesKey,
		ciphertext,
		wrappedSessionKey,
		send
	};
	return /* @__PURE__ */ jsx(WizardContext.Provider, {
		value,
		children
	});
}
function useWizard() {
	const ctx = useContext(WizardContext);
	if (!ctx) throw new Error("useWizard must be used within a WizardProvider");
	return ctx;
}
//#endregion
export { PedagogyModeProvider as a, STEP_LABELS as i, useWizard as n, usePedagogyMode as o, STEPS as r, WizardProvider as t };
