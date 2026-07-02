import { Code2, Cpu, Database, Layers, Radio, Server, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const frontendItems: TechItem[] = [
	{
		name: "TanStack Start",
		desc: "Framework & Routing",
		icon: <Code2 size={20} />,
	},
	{ name: "React 19", desc: "UI Library", icon: <Code2 size={20} /> },
	{ name: "XState v5", desc: "State Machine", icon: <Layers size={20} /> },
	{ name: "Tailwind CSS v4", desc: "Styling", icon: <Layers size={20} /> },
	{ name: "Motion (FM)", desc: "DOM Animations", icon: <Zap size={20} /> },
	{ name: "PixiJS v8", desc: "Canvas Rendering", icon: <Zap size={20} /> },
	{ name: "GSAP 3.12+", desc: "Timeline Animations", icon: <Zap size={20} /> },
];

const cryptoItems: TechItem[] = [
	{
		name: "Web Crypto API",
		desc: "Native Browser Crypto (RSA, AES)",
		icon: <Cpu size={20} />,
	},
	{
		name: "Web Workers",
		desc: "Off-Main Thread Processing",
		icon: <Cpu size={20} />,
	},
];

const backendItems: TechItem[] = [
	{ name: "NestJS 11", desc: "API & WS Gateway", icon: <Server size={20} /> },
	{
		name: "PostgreSQL 17",
		desc: "Relational Database",
		icon: <Database size={20} />,
	},
	{
		name: "WebSockets",
		desc: "Real-time Communication",
		icon: <Radio size={20} />,
	},
];

interface TechItem {
	name: string;
	desc: string;
	icon: ReactNode;
}

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: { opacity: 1, scale: 1 },
};

export function StackSection() {
	return (
		<section id="explore" className="relative z-10 py-24 px-4">
			<div className="mx-auto max-w-6xl">
				<div className="mb-16 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-4 text-3xl font-bold text-white md:text-5xl"
					>
						Built For Performance & Education
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-surface-400"
					>
						A modern, type-safe stack chosen for high-performance visualization
						and rigorous cryptographic correctness.
					</motion.p>
				</div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="space-y-8"
				>
					<div>
						<h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-surface-500">
							Frontend
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{frontendItems.map((tech) => (
								<TechCard key={tech.name} tech={tech} />
							))}
						</div>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-surface-500">
							Cryptography
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{cryptoItems.map((tech) => (
								<TechCard key={tech.name} tech={tech} />
							))}
						</div>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-surface-500">
							Backend & Data
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{backendItems.map((tech) => (
								<TechCard key={tech.name} tech={tech} />
							))}
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

function TechCard({ tech }: { tech: TechItem }) {
	return (
		<motion.div
			variants={itemVariants}
			className="flex items-center gap-4 rounded-xl border border-surface-700/50 bg-surface-950/60 p-4 transition-colors hover:border-surface-600/50 hover:bg-surface-900/50"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800 text-surface-300">
				{tech.icon}
			</div>
			<div>
				<div className="font-bold text-white">{tech.name}</div>
				<div className="text-sm text-surface-400">{tech.desc}</div>
			</div>
		</motion.div>
	);
}
