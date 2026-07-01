import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { CryptoWorkerClient } from "../../workers/worker-client";

const CryptoWorkerContext = createContext<CryptoWorkerClient | null>(null);

interface CryptoWorkerProviderProps {
	children: ReactNode;
}

export function CryptoWorkerProvider({ children }: CryptoWorkerProviderProps) {
	const [worker, setWorker] = useState<CryptoWorkerClient | null>(null);

	useEffect(() => {
		const client = new CryptoWorkerClient();
		setWorker(client);

		const initWorker = async () => {
			try {
				const isHealthy = await client.ping();
				if (!isHealthy) {
					console.warn("CryptoWorker health check failed");
				}
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

	return (
		<CryptoWorkerContext.Provider value={worker}>
			{children}
		</CryptoWorkerContext.Provider>
	);
}

export function useCryptoWorker(): CryptoWorkerClient | null {
	return useContext(CryptoWorkerContext);
}
