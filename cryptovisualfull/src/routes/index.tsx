import { createFileRoute } from "@tanstack/react-router";
import { ArchitectureFlowSection } from "../features/landing/components/architecture-flow-section";
import { CipherOverviewSection } from "../features/landing/components/cipher-overview-section";
import { ConceptPrimerSection } from "../features/landing/components/concept-primer-section";
import { FinalCTASection } from "../features/landing/components/final-cta-section";
import { HeroSection } from "../features/landing/components/hero-section";
import { StackSection } from "../features/landing/components/stack-section";
import { StatsSection } from "../features/landing/components/stats-section";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="relative w-full bg-surface-950 text-surface-100">
			<HeroSection />

			<div className="h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" />

			<ConceptPrimerSection />

			<div className="h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" />

			<CipherOverviewSection />

			<div className="h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" />

			<ArchitectureFlowSection />

			<div className="h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" />

			<StackSection />

			<div className="h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" />

			<StatsSection />

			<div className="h-px bg-gradient-to-r from-transparent via-surface-700/50 to-transparent" />

			<FinalCTASection />

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
						<a
							href="https://github.com/anomalyco/cryptovisual"
							target="_blank"
							rel="noreferrer"
							className="transition-colors hover:text-surface-400"
						>
							GitHub
						</a>
						<a
							href="/handshake/step-1"
							className="transition-colors hover:text-surface-400"
						>
							Start Tutorial
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
