import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Key, Lock, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const Route = createFileRoute("/")({ component: Home });

interface ConvergingParticle {
	x: number;
	y: number;
	targetX: number;
	targetY: number;
	size: number;
	color: string;
	speed: number;
	phase: "dispersed" | "converging" | "merged";
}

function HybridAnimation() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const subtitleRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);

	const [animationPhase, setAnimationPhase] = useState<
		"intro" | "particles" | "convergence" | "complete"
	>("intro");

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const particles: ConvergingParticle[] = [];
		const particleCount = 80;
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;

		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 2 * i) / particleCount;
			const distance = 150 + Math.random() * 200;
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				targetX: centerX + Math.cos(angle) * distance * 0.3,
				targetY: centerY + Math.sin(angle) * distance * 0.3,
				size: Math.random() * 3 + 1,
				color:
					i % 3 === 0
						? "#a855f7"
						: i % 3 === 1
							? "#4ade80"
							: "#facc15",
				speed: 0.02 + Math.random() * 0.02,
				phase: "dispersed",
			});
		}

		const rsaParticles = particles.filter((p) => p.color === "#a855f7");
		const aesParticles = particles.filter((p) => p.color === "#4ade80");

		let animationFrameId: number;
		let phase = 0;
		let phaseTimer = 0;

		const animate = () => {
			ctx.fillStyle = "rgba(10, 10, 15, 0.15)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			phaseTimer++;

			if (phaseTimer > 180 && phase === 0) {
				phase = 1;
				setAnimationPhase("particles");
			}
			if (phaseTimer > 280 && phase === 1) {
				phase = 2;
				setAnimationPhase("convergence");
			}
			if (phaseTimer > 400 && phase === 2) {
				phase = 3;
				setAnimationPhase("complete");
			}

			particles.forEach((p, i) => {
				if (phase >= 1) {
					const dx = p.targetX - p.x;
					const dy = p.targetY - p.y;
					p.x += dx * p.speed;
					p.y += dy * p.speed;
				}

				if (phase >= 2) {
					const dx = centerX - p.x;
					const dy = centerY - p.y;
					p.x += dx * 0.02;
					p.y += dy * 0.02;
				}

				p.x += (Math.random() - 0.5) * 2;
				p.y += (Math.random() - 0.5) * 2;

				p.x = Math.max(0, Math.min(canvas.width, p.x));
				p.y = Math.max(0, Math.min(canvas.height, p.y));

				const alpha = phase >= 2 ? 0.4 + 0.6 * Math.sin(phaseTimer * 0.05 + i * 0.1) : 0.8;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle =
					p.color +
					(Math.floor(alpha * 255).toString(16).padStart(2, "0"));
				ctx.fill();

				if (phase >= 2 && i < rsaParticles.length) {
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(centerX - 50, centerY);
					ctx.strokeStyle = "rgba(168, 85, 247, 0.2)";
					ctx.lineWidth = 0.5;
					ctx.stroke();
				}
				if (phase >= 2 && i >= rsaParticles.length && i < rsaParticles.length + aesParticles.length) {
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(centerX + 50, centerY);
					ctx.strokeStyle = "rgba(74, 222, 128, 0.2)";
					ctx.lineWidth = 0.5;
					ctx.stroke();
				}
			});

			ctx.fillStyle = "rgba(168, 85, 247, 0.1)";
			ctx.beginPath();
			ctx.arc(centerX - 80, centerY, 60, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = "rgba(74, 222, 128, 0.1)";
			ctx.beginPath();
			ctx.arc(centerX + 80, centerY, 60, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = "rgba(250, 204, 21, 0.15)";
			ctx.beginPath();
			ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
			ctx.fill();

			animationFrameId = requestAnimationFrame(animate);
		};

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		animate();

		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		if (animationPhase === "complete" && titleRef.current) {
			const tl = gsap.timeline();
			tl.fromTo(
				titleRef.current,
				{ opacity: 0, y: 30, scale: 0.95 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
			).fromTo(
				subtitleRef.current,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
				"-=0.4",
			).fromTo(
				ctaRef.current,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
				"-=0.3",
			);
		}
	}, [animationPhase]);

	return (
		<div ref={containerRef} className="relative h-full w-full">
			<canvas
				ref={canvasRef}
				className="absolute inset-0 opacity-60"
			/>
			<div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
				<div className="mb-8 flex items-center gap-8">
					<div className="flex flex-col items-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-asymmetric-500/30 bg-asymmetric-500/10">
							<Key className="text-asymmetric-400" size={32} />
						</div>
						<span className="mt-2 text-xs font-medium text-asymmetric-400">
							RSA
						</span>
					</div>
					<div className="text-2xl text-surface-600">+</div>
					<div className="flex flex-col items-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-symmetric-500/30 bg-symmetric-500/10">
							<Lock className="text-symmetric-400" size={32} />
						</div>
						<span className="mt-2 text-xs font-medium text-symmetric-400">
							AES
						</span>
					</div>
					<div className="text-2xl text-surface-600">=</div>
					<div className="flex flex-col items-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-hybrid-500/30 bg-hybrid-500/10">
							<Zap className="text-hybrid-400" size={32} />
						</div>
						<span className="mt-2 text-xs font-medium text-hybrid-400">
							Hybrid
						</span>
					</div>
				</div>

				<h1
					ref={titleRef}
					className="mb-4 text-center text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
				>
					<span className="bg-gradient-to-r from-symmetric-400 via-hybrid-400 to-asymmetric-400 bg-clip-text text-transparent">
						CryptoVisual
					</span>
				</h1>

				<p
					ref={subtitleRef}
					className="mx-auto mb-10 max-w-2xl text-center text-lg text-surface-400 md:text-xl"
				>
					Master the art of hybrid encryption. Visualize RSA, AES, and the
					TLS handshake through high-performance animations.
				</p>

				<div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
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
						href="#features"
						className="flex items-center justify-center rounded-xl border border-surface-700/50 bg-surface-950/40 backdrop-blur-sm px-8 py-4 text-lg font-medium text-surface-300 transition-all hover:bg-surface-950/70"
					>
						Explore Features
					</a>
				</div>
			</div>
		</div>
	);
}

function Home() {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-surface-950 text-surface-100">
			<section className="relative z-10 flex min-h-screen flex-col">
				<HybridAnimation />
			</section>

			<section
				id="features"
				className="relative z-10 py-24 px-4 backdrop-blur-sm"
			>
				<div className="mx-auto max-w-6xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
							The Encryption Journey
						</h2>
						<p className="text-lg text-surface-400">
							A step-by-step visual guide to modern security
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{[
							{
								title: "Asymmetric Magic",
								icon: <Key className="text-asymmetric-400" />,
								color: "border-asymmetric-500/30",
								desc: "Explore RSA key generation. Watch public and private keys emerge from mathematical primes in a stunning sphere-splitting animation.",
								tag: "RSA-OAEP",
							},
							{
								title: "Symmetric Strength",
								icon: <Lock className="text-symmetric-400" />,
								color: "border-symmetric-500/30",
								desc: "Dive into the AES-256 state matrix. Visualize SubBytes, ShiftRows, and MixColumns as they scramble data into oblivion.",
								tag: "AES-GCM",
							},
							{
								title: "Hybrid Harmony",
								icon: <Zap className="text-hybrid-400" />,
								color: "border-hybrid-500/30",
								desc: "See it all come together. Simulate a real network wire transfer where RSA protects the AES key, and AES protects the data.",
								tag: "TLS Handshake",
							},
						].map((feature, i) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.2 }}
								viewport={{ once: true }}
								className={`group relative rounded-2xl border ${feature.color} bg-surface-950/60 backdrop-blur-sm p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80`}
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-surface-700 bg-surface-800">
									{feature.icon}
								</div>
								<div className="mb-2 flex items-center justify-between">
									<h3 className="text-xl font-bold text-white">
										{feature.title}
									</h3>
									<span className="rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-surface-500 border border-surface-700">
										{feature.tag}
									</span>
								</div>
								<p className="text-surface-400 leading-relaxed">
									{feature.desc}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="relative z-10 py-24 px-4">
				<div 				className="mx-auto max-w-4xl rounded-3xl border border-symmetric-500/20 bg-surface-950/60 backdrop-blur-sm p-8 text-center md:p-12">
					<h2 className="mb-6 text-3xl font-bold">
						Experience the Speed
					</h2>
					<p className="mx-auto mb-10 max-w-xl text-surface-400">
						Curious about how fast these operations are? Jump straight into
						the simulation and control the flow of time.
					</p>
					<Link
						to="/sandbox"
						suppressHydrationWarning
						className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-surface-950 transition-all hover:bg-surface-200 hover:scale-105 active:scale-95"
					>
						Enter the Sandbox <ArrowRight size={20} />
					</Link>
				</div>
			</section>

			<footer className="relative z-10 border-t border-surface-800 py-12 px-4 text-center">
				<div className="mx-auto max-w-6xl">
					<div className="mb-6 text-2xl font-bold text-surface-300">
						CryptoVisual
					</div>
					<p className="text-sm text-surface-500">
						Built for engineers, students, and the curious.
						<br />
						Exploring the intersection of Mathematics, Security, and Art.
					</p>
					<div className="mt-8 flex justify-center gap-6 text-surface-600">
						<a href="#" className="transition-colors hover:text-surface-400">
							GitHub
						</a>
						<a href="#" className="transition-colors hover:text-surface-400">
							Docs
						</a>
						<a href="#" className="transition-colors hover:text-surface-400">
							Contact
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}