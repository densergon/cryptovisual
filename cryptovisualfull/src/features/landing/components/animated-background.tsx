import { useEffect, useRef } from "react";

export function AnimatedBackground() {
	const styleInjected = useRef(false);

	useEffect(() => {
		if (styleInjected.current) return;
		styleInjected.current = true;

		const styleId = "bg-animation-style";
		if (!document.getElementById(styleId)) {
			const style = document.createElement("style");
			style.id = styleId;
			style.textContent = `
				@keyframes gradient-move {
					0% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
					33% { transform: translate(5%, 5%) rotate(120deg) scale(1.1); }
					66% { transform: translate(-5%, 3%) rotate(240deg) scale(0.95); }
					100% { transform: translate(0%, 0%) rotate(360deg) scale(1); }
				}
				.bg-blob-1 { animation: gradient-move 20s ease-in-out infinite; }
				.bg-blob-2 { animation: gradient-move 25s ease-in-out infinite reverse; }
				.bg-blob-3 { animation: gradient-move 30s ease-in-out infinite; animation-delay: -5s; }
			`;
			document.head.appendChild(style);
		}
	}, []);

	return (
		<div className="absolute inset-0 overflow-hidden bg-surface-950">
			<div className="bg-blob-1 absolute -left-[20%] -top-[20%] h-[80%] w-[80%] rounded-full bg-asymmetric-600/20 blur-[120px]" />
			<div className="bg-blob-2 absolute -right-[20%] top-[20%] h-[70%] w-[70%] rounded-full bg-symmetric-600/20 blur-[120px]" />
			<div className="bg-blob-3 absolute -bottom-[10%] left-[30%] h-[60%] w-[60%] rounded-full bg-hybrid-600/20 blur-[120px]" />
			<div className="absolute inset-0 bg-surface-950/60" />
		</div>
	);
}
