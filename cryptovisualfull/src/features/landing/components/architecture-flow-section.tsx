import { ArrowDown, Cpu, Globe, Lock, Server, Shield } from "lucide-react";
import { motion } from "motion/react";

export function ArchitectureFlowSection() {
	return (
		<section className="relative z-10 py-24 px-4">
			<div className="mx-auto max-w-4xl">
				<div className="mb-16 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-4 text-3xl font-bold text-white md:text-5xl"
					>
						The Data Flow
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-surface-400"
					>
						A zero-knowledge architecture where privacy is the default —
						mirroring how real TLS servers operate.
					</motion.p>
				</div>

				<div className="relative">
					<div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-symmetric-500 via-hybrid-500 to-asymmetric-500 hidden md:block" />

					<div className="space-y-8">
						<FlowStep
							step="1"
							title="User Action"
							desc="The user enters the wizard, types a message, and clicks Generate Keys."
							icon={<Globe size={20} />}
							label="Browser"
							details={[
								"No data leaves the browser yet",
								"All cryptographic operations stay client-side",
								"Plaintext never touches the server",
							]}
						/>

						<FlowArrow />

						<FlowStep
							step="2"
							title="Web Worker"
							desc="All cryptographic operations are offloaded to a dedicated Web Worker — keeping the main thread responsive."
							icon={<Cpu size={20} />}
							label="Off-Main-Thread"
							details={[
								"RSA Key Generation (2048 or 4096 bits)",
								"AES-256-GCM Session Key creation",
								"Encryption, decryption, and key wrapping",
								"Zero-copy ArrayBuffer transfers for performance",
							]}
						/>

						<FlowArrow />

						<FlowStep
							step="3"
							title="Zero-Knowledge Backend"
							desc="The backend only coordinates the session. It NEVER sees keys, plaintext, or encrypted data — architecturally honest to how real TLS works."
							icon={<Server size={20} />}
							label="NestJS"
							details={[
								"Manages WebSocket connections for wire simulation",
								"Stores metadata: timestamps, session IDs, public keys",
								"Relays signaling — never touches the payload",
							]}
						/>

						<FlowArrow />

						<FlowStep
							step="4"
							title="Hybrid Security"
							desc="The result: the speed of AES with the key-sharing power of RSA. The AES key is wrapped by RSA for transport, then unwrapped by the recipient."
							icon={<Lock size={20} />}
							label="TLS 1.3 Inspired"
							details={[
								"RSA wraps the AES session key (digital envelope)",
								"AES-GCM encrypts the actual message data",
								"GCM authentication tag ensures integrity",
							]}
						/>

						<FlowArrow />

						<FlowStep
							step="5"
							title="Integrity Verified"
							desc="On decryption, the GCM auth tag is checked first. If a single bit was tampered in transit, the entire decryption fails — no silent corruption."
							icon={<Shield size={20} />}
							label="Authenticated Encryption"
							details={[
								"AEAD: Authenticated Encryption with Associated Data",
								"Any tampering → immediate integrity check failure",
								"Bit Flipper sandbox lets you test this live",
							]}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

function FlowStep({
	step,
	title,
	desc,
	icon,
	label,
	details,
}: {
	step: string;
	title: string;
	desc: string;
	icon: React.ReactNode;
	label: string;
	details: string[];
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className="relative pl-12 md:pl-16"
		>
			<div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface-800 border border-surface-700 md:left-0">
				<span className="text-xs font-bold text-surface-400">{step}</span>
			</div>

			<div className="rounded-xl border border-surface-700/50 bg-surface-950/60 p-6">
				<div className="mb-3 flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-800 text-surface-300">
						{icon}
					</div>
					<h3 className="text-lg font-bold text-white">{title}</h3>
					<span className="rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-surface-500 border border-surface-700">
						{label}
					</span>
				</div>
				<p className="mb-4 text-surface-300">{desc}</p>
				<ul className="space-y-2">
					{details.map((detail, i) => (
						<li
							key={i}
							className="flex items-start gap-2 text-sm text-surface-400"
						>
							<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-surface-600" />
							{detail}
						</li>
					))}
				</ul>
			</div>
		</motion.div>
	);
}

function FlowArrow() {
	return (
		<div className="flex justify-center pl-12 md:pl-16">
			<ArrowDown size={16} className="text-surface-600" />
		</div>
	);
}
