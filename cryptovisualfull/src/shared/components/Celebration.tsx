import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ConfettiParticle {
	id: number;
	x: number;
	y: number;
	color: string;
	size: number;
	vx: number;
	vy: number;
	angle: number;
}

export function Celebration() {
	const [particles, setParticles] = useState<ConfettiParticle[]>([]);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		const colors = ["#4ade80", "#facc15", "#a855f7", "#3b82f6", "#ef4444"];
		const newParticles = Array.from({ length: 100 }).map((_, i) => ({
			id: i,
			x: window.innerWidth / 2,
			y: window.innerHeight * 0.7,
			color: colors[Math.floor(Math.random() * colors.length)],
			size: Math.random() * 8 + 4,
			vx: (Math.random() - 0.5) * 15,
			vy: Math.random() * -15 - 10,
			angle: Math.random() * Math.PI * 2,
		}));
		setParticles(newParticles);

		const timer = setTimeout(() => setIsActive(false), 5000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<AnimatePresence>
			{isActive && (
				<div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
					{particles.map((p) => (
						<motion.div
							key={p.id}
							initial={{ x: p.x, y: p.y, opacity: 1, rotate: 0 }}
							animate={{
								x: p.x + p.vx * 50,
								y: p.y + p.vy * 50 + 200,
								opacity: 0,
								rotate: p.angle * 360,
							}}
							transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
							style={{
								position: "absolute",
								width: p.size,
								height: p.size,
								backgroundColor: p.color,
								borderRadius: "2px",
							}}
						/>
					))}
				</div>
			)}
		</AnimatePresence>
	);
}
