import { createContext, type ReactNode, useContext } from "react";

interface PedagogyModeContextValue {
	isPedagogyMode: boolean;
}

const PedagogyModeContext = createContext<PedagogyModeContextValue | undefined>(
	undefined,
);

export function PedagogyModeProvider({ children }: { children: ReactNode }) {
	return (
		<PedagogyModeContext.Provider value={{ isPedagogyMode: true }}>
			{children}
		</PedagogyModeContext.Provider>
	);
}

export function usePedagogyMode(): PedagogyModeContextValue {
	const ctx = useContext(PedagogyModeContext);
	if (!ctx)
		throw new Error(
			"usePedagogyMode must be used within a PedagogyModeProvider",
		);
	return { isPedagogyMode: true };
}
