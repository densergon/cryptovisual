import { createContext, type ReactNode, useContext, useState } from "react";

interface PedagogyModeContextValue {
	isPedagogyMode: boolean;
	togglePedagogyMode: () => void;
}

const PedagogyModeContext = createContext<PedagogyModeContextValue | undefined>(
	undefined,
);

const STORAGE_KEY = "cv_pedagogy_mode";

export function PedagogyModeProvider({ children }: { children: ReactNode }) {
	const [isPedagogyMode, setIsPedagogyMode] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) === "true";
		} catch {
			return false;
		}
	});

	const togglePedagogyMode = () => {
		setIsPedagogyMode((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(STORAGE_KEY, String(next));
			} catch {
				/* noop */
			}
			return next;
		});
	};

	return (
		<PedagogyModeContext.Provider
			value={{ isPedagogyMode, togglePedagogyMode }}
		>
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
	return ctx;
}
