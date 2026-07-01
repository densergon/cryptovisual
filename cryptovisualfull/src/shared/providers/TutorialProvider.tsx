import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface TutorialStep {
	id: string;
	targetId: string;
	content: string;
	position: "top" | "bottom" | "left" | "right";
}

interface TutorialContextType {
	currentStep: number | null;
	nextStep: () => void;
	prevStep: () => void;
	closeTutorial: () => void;
	steps: TutorialStep[];
}

const TutorialContext = createContext<TutorialContextType | undefined>(
	undefined,
);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
	const [currentStep, setCurrentStep] = useState<number | null>(null);

	const steps: TutorialStep[] = [
		{
			id: "welcome",
			targetId: "wizard-title",
			content:
				"Welcome to CryptoVisual! Let's learn how a secure hybrid handshake works.",
			position: "bottom",
		},
		{
			id: "step1-start",
			targetId: "keygen-button",
			content:
				"First, we generate an RSA key pair. This is the foundation of asymmetric encryption.",
			position: "right",
		},
		{
			id: "step2-aes",
			targetId: "aes-button",
			content:
				"Now we create a fast, symmetric AES session key to encrypt the actual message.",
			position: "right",
		},
		{
			id: "step3-viz",
			targetId: "matrix-canvas",
			content:
				"Watch the AES state matrix in action! This is where the data gets scrambled.",
			position: "top",
		},
		{
			id: "step4-wrap",
			targetId: "wrap-button",
			content:
				'We use the RSA public key to "wrap" the AES key so it can be sent safely.',
			position: "right",
		},
		{
			id: "step5-wire",
			targetId: "wire-canvas",
			content:
				"The encrypted bundle travels across the network. Only the receiver can open it.",
			position: "top",
		},
		{
			id: "step6-decrypt",
			targetId: "decrypt-button",
			content:
				"Finally, the receiver uses their private RSA key to recover the AES key and decrypt the message!",
			position: "right",
		},
	];

	useEffect(() => {
		const hasVisited = localStorage.getItem("cv_tutorial_completed");
		if (!hasVisited) {
			setCurrentStep(0);
		}
	}, []);

	const nextStep = () => {
		setCurrentStep((prev) =>
			prev !== null && prev < steps.length - 1 ? prev + 1 : null,
		);
	};

	const prevStep = () => {
		setCurrentStep((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
	};

	const closeTutorial = () => {
		setCurrentStep(null);
		localStorage.setItem("cv_tutorial_completed", "true");
	};

	return (
		<TutorialContext.Provider
			value={{ currentStep, nextStep, prevStep, closeTutorial, steps }}
		>
			{children}
		</TutorialContext.Provider>
	);
}

export function useTutorial() {
	const context = useContext(TutorialContext);
	if (!context)
		throw new Error("useTutorial must be used within a TutorialProvider");
	return context;
}
