import { i as CryptoWorkerClient } from "./crypto-engine-CSsLj5MI.js";
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/shared/providers/CryptoWorkerProvider.tsx
var CryptoWorkerContext = createContext(null);
function CryptoWorkerProvider({ children }) {
	const [worker, setWorker] = useState(null);
	useEffect(() => {
		const client = new CryptoWorkerClient();
		setWorker(client);
		const initWorker = async () => {
			try {
				if (!await client.ping()) console.warn("CryptoWorker health check failed");
			} catch (error) {
				console.error("CryptoWorker initialization error:", error);
			}
		};
		initWorker();
		return () => {
			client.terminate();
		};
	}, []);
	useEffect(() => {
		if (!worker) return;
		const handleBeforeUnload = () => worker.terminate();
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [worker]);
	return /* @__PURE__ */ jsx(CryptoWorkerContext.Provider, {
		value: worker,
		children
	});
}
function useCryptoWorker() {
	return useContext(CryptoWorkerContext);
}
//#endregion
export { useCryptoWorker as n, CryptoWorkerProvider as t };
