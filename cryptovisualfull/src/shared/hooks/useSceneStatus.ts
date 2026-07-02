import { useEffect, useState } from "react";
import type { VisualizationEngine } from "../../visualization/engine/visualization-engine";

interface SceneStatus {
	message: string;
	timestamp: number;
}

export function useSceneStatus(
	engine: VisualizationEngine | null,
): SceneStatus {
	const [status, setStatus] = useState<SceneStatus>({
		message: "",
		timestamp: Date.now(),
	});

	useEffect(() => {
		if (!engine) return;

		const unsubscribe = engine.onSceneStatus((message) => {
			setStatus({ message, timestamp: Date.now() });
		});

		return unsubscribe;
	}, [engine]);

	return status;
}
