import { Key, Lock, Zap } from "lucide-react";
import { motion } from "motion/react";

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

export function ConceptPrimerSection() {
	return (
		<section className="relative z-10 py-24 px-4">
			<div className="mx-auto max-w-6xl">
				<div className="mb-16 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-4 text-3xl font-bold text-white md:text-5xl"
					>
						Why Hybrid Encryption?
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-surface-400"
					>
						The best of two worlds, combined for real-world security. This is
						how every HTTPS connection you use actually works.
					</motion.p>
				</div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid gap-8 md:grid-cols-3"
				>
					<motion.div
						variants={itemVariants}
						className="group relative rounded-2xl border border-asymmetric-500/30 bg-surface-950/60 p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-asymmetric-500/30 bg-asymmetric-500/10">
							<Key className="text-asymmetric-400" size={32} />
						</div>
						<div className="mb-2 flex items-center justify-between">
							<h3 className="text-xl font-bold text-white">RSA (Asymmetric)</h3>
							<span className="rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-asymmetric-400 border border-asymmetric-500/30">
								KEY EXCHANGE
							</span>
						</div>
						<p className="mb-4 text-surface-400 leading-relaxed">
							Uses a mathematically linked pair of keys: a{" "}
							<strong className="text-asymmetric-300">Public Key</strong> to
							encrypt and a{" "}
							<strong className="text-asymmetric-300">Private Key</strong> to
							decrypt. It solves the key distribution problem — but at a cost.
						</p>
						<div className="rounded-lg bg-surface-900/50 p-3 text-sm text-surface-500 font-mono">
							~250ms per keygen &middot; 1000x slower than AES
						</div>
					</motion.div>

					<motion.div
						variants={itemVariants}
						className="group relative rounded-2xl border border-symmetric-500/30 bg-surface-950/60 p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-symmetric-500/30 bg-symmetric-500/10">
							<Lock className="text-symmetric-400" size={32} />
						</div>
						<div className="mb-2 flex items-center justify-between">
							<h3 className="text-xl font-bold text-white">AES (Symmetric)</h3>
							<span className="rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-symmetric-400 border border-symmetric-500/30">
								BULK ENCRYPT
							</span>
						</div>
						<p className="mb-4 text-surface-400 leading-relaxed">
							A single{" "}
							<strong className="text-symmetric-300">shared secret key</strong>{" "}
							for both encryption and decryption. Blazingly fast for large data
							— but how do you share the key safely?
						</p>
						<div className="rounded-lg bg-surface-900/50 p-3 text-sm text-surface-500 font-mono">
							~0.5ms per encrypt &middot; 256-bit session key
						</div>
					</motion.div>

					<motion.div
						variants={itemVariants}
						className="group relative rounded-2xl border border-hybrid-500/30 bg-surface-950/60 p-8 transition-all hover:-translate-y-2 hover:bg-surface-950/80"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-hybrid-500/30 bg-hybrid-500/10">
							<Zap className="text-hybrid-400" size={32} />
						</div>
						<div className="mb-2 flex items-center justify-between">
							<h3 className="text-xl font-bold text-white">Hybrid Model</h3>
							<span className="rounded bg-surface-800 px-2 py-0.5 font-mono text-[10px] text-hybrid-400 border border-hybrid-500/30">
								TLS 1.3
							</span>
						</div>
						<p className="mb-4 text-surface-400 leading-relaxed">
							Use slow but secure{" "}
							<strong className="text-hybrid-300">
								RSA to wrap the AES key
							</strong>
							, then use fast{" "}
							<strong className="text-hybrid-300">
								AES to encrypt the message
							</strong>
							. This is exactly how TLS/HTTPS works every time you visit a
							secure site.
						</p>
						<div className="rounded-lg bg-surface-900/50 p-3 text-sm text-surface-500 font-mono">
							6 steps &middot; best of both worlds
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
