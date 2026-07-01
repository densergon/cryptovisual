import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { Providers } from "../app/providers";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";
import { PWAUpdatePrompt } from "../shared/components/PWAUpdatePrompt";
import { ThemeToggle } from "../shared/components/ThemeToggle";
import { TutorialTooltip } from "../shared/components/TutorialTooltip";
import { ThemeProvider } from "../shared/providers/ThemeProvider";
import { TutorialProvider } from "../shared/providers/TutorialProvider";
import appCss from "../styles.css?url";

function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-surface-950">
			<div className="text-center">
				<h1 className="mb-2 text-6xl font-bold text-surface-300">404</h1>
				<p className="mb-6 text-surface-500">Page not found</p>
				<a
					href="/"
					className="rounded-lg bg-symmetric-600 px-6 py-3 font-medium text-white transition-colors hover:bg-symmetric-500"
				>
					Return Home
				</a>
			</div>
		</div>
	);
}

export const Route = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "CryptoVisual — The Hybrid Handshake",
			},
			{
				name: "description",
				content:
					"Interactive hybrid encryption visualization. Learn RSA, AES, and TLS handshakes through animated 3D graphics.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "CryptoVisual — The Hybrid Handshake",
			},
			{
				property: "og:description",
				content:
					"Interactive hybrid encryption visualization. Learn RSA, AES, and TLS handshakes through animated 3D graphics.",
			},
			{
				property: "og:url",
				content: "https://cryptovisual.dev",
			},
			{
				property: "og:image",
				content: "https://cryptovisual.dev/og-image.png",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "CryptoVisual — The Hybrid Handshake",
			},
			{
				name: "twitter:description",
				content:
					"Interactive hybrid encryption visualization. Learn RSA, AES, and TLS handshakes through animated 3D graphics.",
			},
			{
				name: "twitter:image",
				content: "https://cryptovisual.dev/og-image.png",
			},
			{
				name: "theme-color",
				content: "#0a0a0f",
			},
			{
				name: "csp-report-only",
				content:
					"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws://localhost:4001;",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-surface-950 text-white antialiased">
				<ThemeProvider>
					<div className="fixed top-4 right-4 z-[110]">
						<ThemeToggle />
					</div>
					<ErrorBoundary>
						<TutorialProvider>
							<Providers>{children}</Providers>
							<TutorialTooltip />
						</TutorialProvider>
					</ErrorBoundary>
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
					<PWAUpdatePrompt />
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
