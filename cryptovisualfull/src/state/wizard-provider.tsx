import { useNavigate } from "@tanstack/react-router";
import { useActor } from "@xstate/react";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import {
	type HandshakeContext,
	type HandshakeEvent,
	type HandshakeStep,
	handshakeMachine,
	STEPS,
} from "@/state/machines/handshake.machine";
import type { VisualizationEngine } from "@/visualization/engine/visualization-engine";

export interface WizardContextValue {
	currentStep: HandshakeStep;
	currentStepIndex: number;
	completedSteps: HandshakeStep[];
	totalSteps: number;
	isFirstStep: boolean;
	isLastStep: boolean;
	goNext: () => void;
	goBack: () => void;
	goToStep: (step: HandshakeStep) => void;
	isStepComplete: (step: HandshakeStep) => boolean;
	isStepAccessible: (step: HandshakeStep) => boolean;
	visualizationEngine: VisualizationEngine | null;
	isCanvasReady: boolean;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	// Crypto states
	plaintext: HandshakeContext["plaintext"];
	rsaKeyPair: HandshakeContext["rsaKeyPair"];
	aesKey: HandshakeContext["aesKey"];
	ciphertext: HandshakeContext["ciphertext"];
	wrappedSessionKey: HandshakeContext["wrappedSessionKey"];
	// Dispatcher
	send: (event: HandshakeEvent) => void;
}

const STEP_ROUTES: Record<HandshakeStep, string> = {
	keygen: "/handshake/step-1",
	"session-key": "/handshake/step-2",
	"aes-cipher": "/handshake/step-3",
	"hybrid-envelope": "/handshake/step-4",
	"wire-simulation": "/handshake/step-5",
	decrypt: "/handshake/step-6",
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const [snapshot, send] = useActor(handshakeMachine);
	const {
		currentStep,
		completedSteps,
		plaintext,
		rsaKeyPair,
		aesKey,
		ciphertext,
		wrappedSessionKey,
	} = snapshot.context;
	const [visualizationEngine, _setVisualizationEngine] =
		useState<VisualizationEngine | null>(null);
	const [isCanvasReady, _setIsCanvasReady] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const restoredRef = useRef(false);
	const [restorationComplete, setRestorationComplete] = useState(false);

	const doRestore = useCallback(() => {
		if (restoredRef.current) return;
		restoredRef.current = true;
		const saved = sessionStorage.getItem("cv_wizard_state");
		if (saved) {
			try {
				const parsed = JSON.parse(saved, (_key, value) => {
					if (value && value.__type === "Uint8Array") {
						return new Uint8Array(value.data);
					}
					return value;
				});
				send({ type: "RESTORE", state: parsed });
			} catch (e) {
				console.error("Error restoring cv_wizard_state", e);
			}
		}
		setRestorationComplete(true);
	}, [send]);

	useEffect(() => {
		doRestore();
	}, [doRestore]);

	useEffect(() => {
		if (!restorationComplete) return;
		navigate({ to: STEP_ROUTES[currentStep] });
	}, [currentStep, navigate, restorationComplete]);

	useEffect(() => {
		const serialized = JSON.stringify(snapshot.context, (_key, value) => {
			if (value instanceof Uint8Array) {
				return {
					__type: "Uint8Array",
					data: Array.from(value),
				};
			}
			return value;
		});
		sessionStorage.setItem("cv_wizard_state", serialized);
		if (process.env.NODE_ENV === "development") {
			console.warn(
				"⚠️ Wizard state (including key material) persisted to sessionStorage. For educational purposes only.",
			);
		}
	}, [snapshot.context]);

	const value: WizardContextValue = {
		currentStep,
		currentStepIndex: STEPS.indexOf(currentStep),
		completedSteps,
		totalSteps: STEPS.length,
		isFirstStep: STEPS.indexOf(currentStep) === 0,
		isLastStep: STEPS.indexOf(currentStep) === STEPS.length - 1,
		goNext: () => send({ type: "NEXT" }),
		goBack: () => send({ type: "BACK" }),
		goToStep: (step: HandshakeStep) => send({ type: "GO_TO", step }),
		isStepComplete: (step: HandshakeStep) => completedSteps.includes(step),
		isStepAccessible: (step: HandshakeStep) =>
			STEPS.indexOf(step) <= completedSteps.length,
		visualizationEngine,
		isCanvasReady,
		canvasRef,
		plaintext,
		rsaKeyPair,
		aesKey,
		ciphertext,
		wrappedSessionKey,
		send,
	};

	return (
		<WizardContext.Provider value={value}>{children}</WizardContext.Provider>
	);
}

export function useWizard(): WizardContextValue {
	const ctx = useContext(WizardContext);
	if (!ctx) {
		throw new Error("useWizard must be used within a WizardProvider");
	}
	return ctx;
}
