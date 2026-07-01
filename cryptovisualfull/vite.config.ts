import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "robots.txt"],
			manifest: {
				name: "CryptoVisual",
				short_name: "CryptoVisual",
				description:
					"Interactive hybrid encryption educational tool - RSA, AES, and TLS handshake visualization",
				theme_color: "#0a0a0f",
				background_color: "#0a0a0f",
				display: "standalone",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				navigateFallback: "/index.html",
				navigateFallbackAllowlist: [/^\/$/],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "gstatic-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /\/api\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60,
							},
							networkTimeoutSeconds: 10,
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /\/v1\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "rest-api-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60,
							},
							networkTimeoutSeconds: 10,
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
			devOptions: {
				enabled: true,
				type: "module",
			},
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id: string) => {
					if (id.includes("node_modules/pixi.js")) return "pixi-vendor";
					if (id.includes("node_modules/gsap")) return "gsap-vendor";
					if (id.includes("node_modules/motion")) return "motion-vendor";
					if (id.includes("src/crypto-engine/")) return "crypto-engine";
					if (id.includes("src/workers/")) return "crypto-engine";
				},
			},
		},
		chunkSizeWarningLimit: 250,
	},
});

export default config;
