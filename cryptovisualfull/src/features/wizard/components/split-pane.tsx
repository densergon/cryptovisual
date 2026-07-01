import type { ReactNode } from "react";

interface SplitPaneProps {
	sidebar: ReactNode;
	children: ReactNode;
}

export function SplitPane({ sidebar, children }: SplitPaneProps) {
	return (
		<div className="flex min-h-screen flex-col md:flex-row">
			{sidebar}
			<main className="flex flex-1 flex-col">{children}</main>
		</div>
	);
}
