import { Cpu, Shield, Timer } from "lucide-react";
import { motion } from "motion/react";

const stats = [
	{
		icon: <Cpu className="text-asymmetric-400" />,
		label: "RSA-2048 Keygen",
		value: "~250ms",
		desc: "Two large primes found and verified in a Web Worker",
	},
	{
		icon: <Timer className="text-symmetric-400" />,
		label: "AES-256-GCM Encrypt",
		value: "~0.5ms",
		desc: "14 rounds of substitution-permutation on a 128-bit block",
	},
	{
		icon: <Shield className="text-hybrid-400" />,
		label: "Hybrid Handshake",
		value: "6 Steps",
		desc: "Full TLS 1.3-inspired key exchange visualized step by step",
	},
];

export function StatsSection() {
	return (
		<section className="relative z-10 py-24 px-4">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-4 text-3xl font-bold text-white md:text-5xl"
					>
						By the Numbers
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-surface-400"
					>
						Real cryptographic operations, measured in your browser
					</motion.p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					{stats.map((stat, i) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.15 }}
							viewport={{ once: true }}
							className="rounded-2xl border border-surface-700/50 bg-surface-950/60 backdrop-blur-sm p-6 text-center"
						>
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-800">
								{stat.icon}
							</div>
							<div className="text-3xl font-bold text-white mb-1">
								{stat.value}
							</div>
							<div className="text-sm font-medium text-surface-300 mb-2">
								{stat.label}
							</div>
							<div className="text-xs text-surface-500">{stat.desc}</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
