import { createFileRoute } from "@tanstack/react-router";
import { BitFlipper } from "../features/sandbox/components/BitFlipper";

export const Route = createFileRoute("/sandbox")({
	component: SandboxPage,
});

function SandboxPage() {
	return (
		<div className="max-w-5xl mx-auto p-6">
			<BitFlipper />
		</div>
	);
}
