import { createContext, useContext, useState, type ReactNode } from "react";

interface PedagogyModeContextValue {
  isPedagogyMode: boolean;
  togglePedagogyMode: () => void;
}

const PedagogyModeContext = createContext<PedagogyModeContextValue | undefined>(
  undefined,
);

export function PedagogyModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isPedagogyMode, setIsPedagogyMode] = useState(false);

  const togglePedagogyMode = () => setIsPedagogyMode((prev) => !prev);

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
