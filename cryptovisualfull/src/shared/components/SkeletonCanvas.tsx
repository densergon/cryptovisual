import type { FC } from "react";

interface SkeletonCanvasProps {
	aspectRatio?: string;
}

export const SkeletonCanvas: FC<SkeletonCanvasProps> = ({
	aspectRatio = "16/9",
}) => (
	<div
		className="w-full animate-pulse rounded-lg bg-surface-900 overflow-hidden"
		style={{ aspectRatio }}
		role="status"
		aria-label="Loading canvas"
	>
		<div className="flex h-full items-center justify-center">
			<div className="flex flex-col items-center gap-3">
				<div className="h-8 w-8 rounded-full border-2 border-surface-700 border-t-symmetric-500 animate-spin" />
				<span className="text-xs text-surface-600">
					Loading visualization...
				</span>
			</div>
		</div>
	</div>
);
