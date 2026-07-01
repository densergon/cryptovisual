import { Grid3x3 } from "lucide-react";

interface CanvasFallbackProps {
	type: "aes-matrix" | "wire" | "keygen";
	onRetry?: () => void;
}

const MATRIX_ROWS = 4;
const MATRIX_COLS = 4;

function MatrixFallback() {
	return (
		<div
			className="flex items-center justify-center w-full h-full"
			role="img"
			aria-label="AES state matrix visualization (CSS fallback)"
		>
			<div className="grid grid-cols-4 gap-1">
				{Array.from({ length: MATRIX_ROWS * MATRIX_COLS }).map((_, i) => (
					<div
						key={i}
						className="w-10 h-10 rounded border border-surface-600 bg-surface-800 flex items-center justify-center"
					>
						<span className="text-[10px] font-mono text-surface-500">00</span>
					</div>
				))}
			</div>
		</div>
	);
}

function WireFallback() {
	return (
		<div
			className="flex items-center justify-center w-full h-full"
			role="img"
			aria-label="Network wire visualization (CSS fallback)"
		>
			<div className="relative w-4/5 h-1 bg-surface-700 rounded-full">
				<div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-emerald-500/50" />
				<div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-red-500/50" />
				<div className="absolute left-1/2 -top-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
			</div>
		</div>
	);
}

function KeygenFallback() {
	return (
		<div
			className="flex items-center justify-center w-full h-full"
			role="img"
			aria-label="Key generation visualization (CSS fallback)"
		>
			<div className="flex gap-8">
				<div className="w-12 h-12 rounded-full bg-purple-500/30 border-2 border-purple-500 animate-pulse" />
				<div className="w-12 h-12 rounded-full bg-pink-500/30 border-2 border-pink-500 animate-pulse" />
			</div>
		</div>
	);
}

const FALLBACK_MAP = {
	"aes-matrix": MatrixFallback,
	wire: WireFallback,
	keygen: KeygenFallback,
};

export function CanvasFallback({ type, onRetry }: CanvasFallbackProps) {
	const FallbackComponent = FALLBACK_MAP[type];

	return (
		<div className="relative w-full h-full min-h-[200px] rounded-lg border border-surface-700 bg-surface-900 overflow-hidden">
			<div className="absolute top-2 left-2 z-10">
				<div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium uppercase tracking-wider">
					<Grid3x3 size={12} />
					Fallback Mode
				</div>
			</div>
			<FallbackComponent />
			{onRetry && (
				<div className="absolute bottom-2 right-2 z-10">
					<button
						type="button"
						onClick={onRetry}
						className="px-3 py-1.5 text-xs rounded bg-surface-700 text-surface-300 hover:bg-surface-600 transition-colors"
					>
						Retry WebGL
					</button>
				</div>
			)}
		</div>
	);
}
