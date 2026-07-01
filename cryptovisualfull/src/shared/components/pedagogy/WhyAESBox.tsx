import { motion } from "motion/react";

export function WhyAESBox() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="mb-6 rounded-lg border border-symmetric-500/30 bg-symmetric-500/5 p-4"
		>
			<h3 className="mb-2 text-sm font-semibold text-symmetric-400 uppercase tracking-wide">
				Why AES?
			</h3>
			<p className="mb-2 text-xs text-surface-400 leading-relaxed">
				RSA is like a bank vault — incredibly secure, but slow and bulky for
				everyday use. AES is like a house key — fast, lightweight, but both
				parties need a copy.
			</p>
			<div className="grid grid-cols-2 gap-3 text-xs">
				<div className="rounded bg-surface-800 p-2">
					<span className="font-semibold text-asymmetric-400">RSA</span>
					<ul className="mt-1 list-inside list-disc text-surface-500 space-y-0.5">
						<li>Slow (100-1000x slower than AES)</li>
						<li>Encrypts small data only (key size limit)</li>
						<li>Asymmetric — different keys for enc/dec</li>
					</ul>
				</div>
				<div className="rounded bg-surface-800 p-2">
					<span className="font-semibold text-symmetric-400">AES</span>
					<ul className="mt-1 list-inside list-disc text-surface-500 space-y-0.5">
						<li>Fast (hardware-accelerated on most CPUs)</li>
						<li>Encrypts arbitrarily large data</li>
						<li>Symmetric — same key for enc/dec</li>
					</ul>
				</div>
			</div>
			<p className="mt-2 text-[10px] text-surface-600 italic">
				Hybrid encryption uses RSA to safely deliver the AES key, then AES for
				the actual data — the best of both worlds.
			</p>
		</motion.div>
	);
}
