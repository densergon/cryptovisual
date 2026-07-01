import type { ReactNode } from "react";
import { CryptoWorkerProvider } from "../shared/providers/CryptoWorkerProvider";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	return <CryptoWorkerProvider>{children}</CryptoWorkerProvider>;
}
