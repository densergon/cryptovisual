import { ArrowRightLeft, KeyRound } from "lucide-react";
import { motion } from "motion/react";

export function CipherOverviewSection() {
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
						The Ciphers at a Glance
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mx-auto max-w-2xl text-lg text-surface-400"
					>
						A quick primer on the two pillars of modern encryption.
					</motion.p>
				</div>

				<div className="grid gap-8 md:grid-cols-2">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="rounded-2xl border border-asymmetric-500/20 bg-surface-950/60 p-8"
					>
						<div className="mb-6 flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-asymmetric-500/10 text-asymmetric-400">
								<KeyRound size={24} />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white">
									RSA (Asymmetric)
								</h3>
								<span className="text-sm text-asymmetric-400 font-mono">
									RSA-OAEP
								</span>
							</div>
						</div>

						<p className="mb-6 text-surface-400 leading-relaxed">
							RSA uses a pair of keys generated from large prime numbers. The
							public key is shared freely, while the private key is kept secret.
							Anyone can encrypt data with your public key, but only you can
							decrypt it with your private key.
						</p>

						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-asymmetric-500" />
								<p className="text-sm text-surface-300">
									Key size: 2048 or 4096 bits
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-asymmetric-500" />
								<p className="text-sm text-surface-300">
									Used for: Key wrapping, digital signatures
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-asymmetric-500" />
								<p className="text-sm text-surface-300">
									Trade-off: Secure, but ~1000x slower than symmetric ciphers
								</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="rounded-2xl border border-symmetric-500/20 bg-surface-950/60 p-8"
					>
						<div className="mb-6 flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-symmetric-500/10 text-symmetric-400">
								<ArrowRightLeft size={24} />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white">
									AES (Symmetric)
								</h3>
								<span className="text-sm text-symmetric-400 font-mono">
									AES-256-GCM
								</span>
							</div>
						</div>

						<p className="mb-6 text-surface-400 leading-relaxed">
							AES uses a single secret key for both encryption and decryption.
							It processes data in 128-bit blocks through multiple rounds of
							substitution, permutation, and mixing, making the output appear
							completely random.
						</p>

						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-symmetric-500" />
								<p className="text-sm text-surface-300">Key size: 256 bits</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-symmetric-500" />
								<p className="text-sm text-surface-300">
									Used for: Bulk data encryption
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-symmetric-500" />
								<p className="text-sm text-surface-300">
									Trade-off: Blazingly fast, but requires secure key exchange
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
