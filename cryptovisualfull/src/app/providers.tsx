import type { ReactNode } from "react";
import { CryptoWorkerProvider } from "../shared/providers/CryptoWorkerProvider";
import { WizardProvider } from "../state/wizard-provider";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	return (
		<CryptoWorkerProvider>
			<WizardProvider>{children}</WizardProvider>
		</CryptoWorkerProvider>
	);
}
