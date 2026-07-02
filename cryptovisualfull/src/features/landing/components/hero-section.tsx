import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Key, Lock, Zap } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedBackground } from "./animated-background";

export function HeroSection() {
	return (
		<section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
			<AnimatedBackground />
			<div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="mb-8 flex items-center gap-6 md:gap-8"
				>
					<div className="flex flex-col items-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-asymmetric-500/30 bg-asymmetric-500/10 shadow-lg shadow-asymmetric-500/10 md:h-16 md:w-16">
							<Key className="text-asymmetric-400" size={28} />
						</div>
						<span className="mt-2 text-xs font-medium text-asymmetric-400">
							RSA
						</span>
					</div>
					<div className="text-2xl text-surface-600">+</div>
					<div className="flex flex-col items-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-symmetric-500/30 bg-symmetric-500/10 shadow-lg shadow-symmetric-500/10 md:h-16 md:w-16">
							<Lock className="text-symmetric-400" size={28} />
						</div>
						<span className="mt-2 text-xs font-medium text-symmetric-400">
							AES
						</span>
					</div>
					<div className="text-2xl text-surface-600">=</div>
					<div className="flex flex-col items-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-hybrid-500/30 bg-hybrid-500/10 shadow-lg shadow-hybrid-500/10 md:h-16 md:w-16">
							<Zap className="text-hybrid-400" size={28} />
						</div>
						<span className="mt-2 text-xs font-medium text-hybrid-400">
							Hybrid
						</span>
					</div>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="mb-4 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
				>
					<span className="bg-gradient-to-r from-symmetric-400 via-hybrid-400 to-asymmetric-400 bg-clip-text text-transparent">
						CryptoVisual
					</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
					className="mx-auto mb-10 max-w-2xl text-lg text-surface-400 md:text-xl"
				>
					Master the art of hybrid encryption. Visualize RSA, AES, and the TLS
					handshake through high-performance animations.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
					className="flex flex-wrap justify-center gap-4"
				>
					<Link
						to="/handshake/step-1"
						suppressHydrationWarning
						className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-symmetric-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-symmetric-500 hover:scale-105 active:scale-95"
					>
						<span>Start the Experience</span>
						<ArrowRight
							size={20}
							className="transition-transform group-hover:translate-x-1"
						/>
					</Link>
					<a
						href="#explore"
						className="flex items-center justify-center rounded-xl border border-surface-700/50 bg-surface-950/40 backdrop-blur-sm px-8 py-4 text-lg font-medium text-surface-300 transition-all hover:bg-surface-950/70"
					>
						Explore Project
					</a>
				</motion.div>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 1.2 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
			>
				<a
					href="#explore"
					aria-label="Scroll down to explore"
					className="flex flex-col items-center gap-2 text-surface-500 transition-colors hover:text-surface-300"
				>
					<span className="text-xs tracking-widest uppercase">Scroll</span>
					<ChevronDown size={20} className="animate-bounce" />
				</a>
			</motion.div>
		</section>
	);
}
