import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function FinalCTASection() {
	return (
		<section className="relative z-10 py-24 px-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				className="mx-auto max-w-4xl rounded-3xl border border-symmetric-500/20 bg-surface-950/60 backdrop-blur-sm p-8 text-center md:p-12"
			>
				<h2 className="mb-6 text-3xl font-bold">Ready to Visualize?</h2>
				<p className="mx-auto mb-10 max-w-xl text-surface-400">
					Experience the full 6-step wizard. Generate keys, encrypt data, and
					simulate the network wire in real-time.
				</p>
				<Link
					to="/handshake/step-1"
					suppressHydrationWarning
					className="inline-flex items-center gap-2 rounded-xl bg-symmetric-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-symmetric-500 hover:scale-105 active:scale-95"
				>
					Start the Journey <ArrowRight size={20} />
				</Link>
			</motion.div>
		</section>
	);
}
