import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

const STORAGE_KEY = "cv_animation_speed";

interface AnimationSpeedContextValue {
	speed: number;
	setSpeed: (speed: number) => void;
}

const AnimationSpeedContext = createContext<AnimationSpeedContextValue | null>(
	null,
);

export function AnimationSpeedProvider({ children }: { children: ReactNode }) {
	const [speed, setSpeedState] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = parseFloat(stored);
				if (parsed >= 0.5 && parsed <= 3) return parsed;
			}
		} catch {}
		return 1;
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, String(speed));
		} catch {}
	}, [speed]);

	const setSpeed = useCallback((newSpeed: number) => {
		setSpeedState(Math.max(0.5, Math.min(3, newSpeed)));
	}, []);

	return (
		<AnimationSpeedContext.Provider value={{ speed, setSpeed }}>
			{children}
		</AnimationSpeedContext.Provider>
	);
}

export function useAnimationSpeed(): AnimationSpeedContextValue {
	const ctx = useContext(AnimationSpeedContext);
	if (!ctx) {
		throw new Error(
			"useAnimationSpeed must be used within an AnimationSpeedProvider",
		);
	}
	return ctx;
}
