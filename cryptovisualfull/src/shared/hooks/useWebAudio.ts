import { useCallback, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

type ToneType = "packet_arrival" | "click" | "complete";

export function useWebAudio() {
	const reduced = useReducedMotion();
	const ctxRef = useRef<AudioContext | null>(null);

	const getContext = useCallback((): AudioContext | null => {
		if (reduced) return null;
		if (!ctxRef.current) {
			try {
				ctxRef.current = new AudioContext();
			} catch {
				return null;
			}
		}
		if (ctxRef.current.state === "suspended") {
			ctxRef.current.resume();
		}
		return ctxRef.current;
	}, [reduced]);

	const playTone = useCallback(
		(type: ToneType) => {
			const ctx = getContext();
			if (!ctx) return;

			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);

			switch (type) {
				case "packet_arrival":
					osc.frequency.setValueAtTime(880, ctx.currentTime);
					osc.frequency.exponentialRampToValueAtTime(
						660,
						ctx.currentTime + 0.15,
					);
					gain.gain.setValueAtTime(0.15, ctx.currentTime);
					gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.2);
					break;
				case "click":
					osc.frequency.setValueAtTime(600, ctx.currentTime);
					gain.gain.setValueAtTime(0.08, ctx.currentTime);
					gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.05);
					break;
				case "complete":
					osc.frequency.setValueAtTime(523, ctx.currentTime);
					osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
					osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
					gain.gain.setValueAtTime(0.12, ctx.currentTime);
					gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.5);
					break;
			}
		},
		[getContext],
	);

	return { playTone };
}
