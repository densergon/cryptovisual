import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { VisualizationEngine } from "../../visualization/engine/visualization-engine";

const CanvasContext = createContext<{
	engine: VisualizationEngine | null;
	canvasRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

interface CanvasProviderProps {
	children: ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps) {
	const canvasRef = useRef<HTMLDivElement>(null);
	const [engine, setEngine] = useState<VisualizationEngine | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		const containerElement = document.createElement("div");
		containerElement.id = "viz-container";
		containerElement.style.width = "100%";
		containerElement.style.height = "100%";
		containerElement.style.position = "relative";
		canvasRef.current.appendChild(containerElement);

		const vizEngine = new VisualizationEngine(containerElement);
		let cancelled = false;

		const init = async () => {
			try {
				await vizEngine.init();
				if (cancelled) {
					vizEngine.destroy();
					return;
				}
				setEngine(vizEngine);
			} catch (error) {
				console.error("Failed to initialize VisualizationEngine:", error);
			}
		};

		init();

		return () => {
			cancelled = true;
			vizEngine.destroy();
			if (canvasRef.current) {
				canvasRef.current.innerHTML = "";
			}
		};
	}, []);

	return (
		<CanvasContext.Provider value={{ engine, canvasRef }}>
			{children}
		</CanvasContext.Provider>
	);
}

export function useCanvas(): {
	engine: VisualizationEngine | null;
	canvasRef: React.RefObject<HTMLDivElement | null>;
} {
	const context = useContext(CanvasContext);
	if (!context) {
		throw new Error("useCanvas must be used within a CanvasProvider");
	}
	return context;
}
