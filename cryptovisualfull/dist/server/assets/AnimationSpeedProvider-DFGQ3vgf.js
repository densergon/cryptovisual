import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/shared/providers/AnimationSpeedProvider.tsx
var STORAGE_KEY = "cv_animation_speed";
var AnimationSpeedContext = createContext(null);
function AnimationSpeedProvider({ children }) {
	const [speed, setSpeedState] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = parseFloat(stored);
				if (parsed >= .5 && parsed <= 3) return parsed;
			}
		} catch {}
		return 1;
	});
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, String(speed));
		} catch {}
	}, [speed]);
	const setSpeed = useCallback((newSpeed) => {
		setSpeedState(Math.max(.5, Math.min(3, newSpeed)));
	}, []);
	return /* @__PURE__ */ jsx(AnimationSpeedContext.Provider, {
		value: {
			speed,
			setSpeed
		},
		children
	});
}
function useAnimationSpeed() {
	const ctx = useContext(AnimationSpeedContext);
	if (!ctx) throw new Error("useAnimationSpeed must be used within an AnimationSpeedProvider");
	return ctx;
}
//#endregion
export { useAnimationSpeed as n, AnimationSpeedProvider as t };
