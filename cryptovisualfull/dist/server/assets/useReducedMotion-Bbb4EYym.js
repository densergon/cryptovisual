import { useEffect, useState } from "react";
//#region src/shared/hooks/useReducedMotion.ts
var QUERY = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
	const [reduced, setReduced] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(QUERY).matches;
	});
	useEffect(() => {
		const mq = window.matchMedia(QUERY);
		const handler = (event) => setReduced(event.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);
	return reduced;
}
//#endregion
export { useReducedMotion as t };
