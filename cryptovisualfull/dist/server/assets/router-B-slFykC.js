import { t as CryptoWorkerProvider } from "./CryptoWorkerProvider-Dhi0_CKF.js";
import { Component, createContext, useContext, useEffect, useRef, useState } from "react";
import { HeadContent, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Activity, ChevronLeft, ChevronRight, Moon, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
//#region src/app/providers.tsx
function Providers({ children }) {
	return /* @__PURE__ */ jsx(CryptoWorkerProvider, { children });
}
//#endregion
//#region src/shared/components/ErrorBoundary.tsx
var ErrorBoundary = class extends Component {
	state = {
		hasError: false,
		error: null
	};
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error(`ErrorBoundary${this.props.name ? ` [${this.props.name}]` : ""} caught:`, error, errorInfo);
		const announcer = document.getElementById("accessibility-announcer");
		if (announcer) announcer.textContent = `Error in ${this.props.name ?? "section"}: ${error.message}. Please try again.`;
	}
	handleRetry = () => {
		this.setState({
			hasError: false,
			error: null
		});
		this.props.onRetry?.();
	};
	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			return /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center justify-center p-6 text-center",
				role: "alert",
				"aria-live": "assertive",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-bold text-white mb-2",
						children: "Something went wrong"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-surface-400 mb-1",
						children: this.props.name ? `Error in ${this.props.name}` : "A technical error occurred in this section."
					}),
					this.state.error && /* @__PURE__ */ jsx("p", {
						className: "text-xs text-surface-500 mb-4 font-mono max-w-md truncate",
						children: this.state.error.message
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: this.handleRetry,
							className: "px-4 py-2 rounded-lg bg-surface-600 text-white hover:bg-surface-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
							children: "Try Again"
						}), /* @__PURE__ */ jsx("a", {
							href: "/",
							className: "px-4 py-2 rounded-lg bg-surface-700 text-surface-300 hover:text-white hover:bg-surface-600 transition-colors text-sm",
							children: "Go Home"
						})]
					})
				]
			});
		}
		return this.props.children;
	}
};
//#endregion
//#region src/shared/components/PWAUpdatePrompt.tsx
function usePWAInstallPrompt() {
	const [offlineReady, setOfflineReady] = useState(false);
	const [needRefresh, setNeedRefresh] = useState(false);
	const [updateSW, setUpdateSW] = useState(null);
	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;
		const registerSW = async () => {
			try {
				const register = (await import("./virtual_pwa-register-B7qI2Txg.js")).registerSW;
				const result = register({
					onRegisteredSW(swUrl, _registration) {
						console.log("[PWA] Service worker registered:", swUrl);
					},
					onRegisterError(error) {
						console.error("[PWA] Service worker registration error:", error);
					},
					onOfflineReady() {
						console.log("[PWA] App ready to work offline");
						setOfflineReady(true);
					},
					onNeedRefresh() {
						console.log("[PWA] New content available");
						setNeedRefresh(true);
					}
				});
				setUpdateSW(() => result);
			} catch (err) {
				console.error("[PWA] Failed to register service worker:", err);
			}
		};
		registerSW();
	}, []);
	const handleUpdate = async () => {
		if (updateSW) await updateSW();
		setNeedRefresh(false);
	};
	const cancel = () => {
		setOfflineReady(false);
		setNeedRefresh(false);
	};
	return {
		offlineReady,
		needRefresh,
		updateServiceWorker: handleUpdate,
		cancel
	};
}
function PWAUpdatePrompt() {
	const { needRefresh, offlineReady, updateServiceWorker, cancel } = usePWAInstallPrompt();
	return /* @__PURE__ */ jsx(AnimatePresence, { children: (needRefresh || offlineReady) && /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			y: 50
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			y: 50
		},
		className: "fixed bottom-4 right-4 z-[200] rounded-xl border border-surface-700 bg-surface-900 p-4 shadow-2xl max-w-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-symmetric-500/20",
					children: /* @__PURE__ */ jsx(RefreshCw, {
						size: 20,
						className: "text-symmetric-400"
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-semibold text-white",
							children: offlineReady ? "App ready to work offline" : "New content available"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-surface-400",
							children: offlineReady ? "CryptoVisual will work without an internet connection." : "Click reload to get the latest version."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex gap-2",
							children: [needRefresh && /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: updateServiceWorker,
								className: "rounded-lg bg-symmetric-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-symmetric-500 transition-colors",
								children: "Reload"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: cancel,
								className: "rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-surface-300 hover:bg-surface-600 transition-colors",
								children: offlineReady ? "Got it" : "Dismiss"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: cancel,
					className: "text-surface-500 hover:text-surface-300 transition-colors",
					"aria-label": "Dismiss",
					children: /* @__PURE__ */ jsx(X, { size: 16 })
				})
			]
		})
	}) });
}
//#endregion
//#region src/shared/providers/ThemeProvider.tsx
var ThemeContext = createContext(void 0);
function getInitialTheme() {
	return "deep-space";
}
function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(getInitialTheme);
	useEffect(() => {
		const stored = localStorage.getItem("cv_theme");
		if (stored && stored !== theme) setTheme(stored);
		document.documentElement.classList.remove("theme-deep-space", "theme-entropy");
		document.documentElement.classList.add(`theme-${stored || theme}`);
	}, []);
	const toggleTheme = () => {
		const next = theme === "deep-space" ? "entropy" : "deep-space";
		localStorage.setItem("cv_theme", next);
		document.documentElement.classList.remove("theme-deep-space", "theme-entropy");
		document.documentElement.classList.add(`theme-${next}`);
		setTheme(next);
	};
	return /* @__PURE__ */ jsx(ThemeContext.Provider, {
		value: {
			theme,
			toggleTheme
		},
		children
	});
}
function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used within a ThemeProvider");
	return context;
}
//#endregion
//#region src/shared/components/ThemeToggle.tsx
function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: toggleTheme,
		className: "flex items-center gap-2 rounded-full bg-surface-800 border border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-white transition-all active:scale-95",
		children: [theme === "deep-space" ? /* @__PURE__ */ jsx(Moon, { size: 14 }) : /* @__PURE__ */ jsx(Activity, { size: 14 }), /* @__PURE__ */ jsx("span", { children: theme === "deep-space" ? "Deep Space" : "Entropy" })]
	});
}
//#endregion
//#region src/shared/providers/TutorialProvider.tsx
var TutorialContext = createContext(void 0);
function TutorialProvider({ children }) {
	const [currentStep, setCurrentStep] = useState(null);
	const steps = [
		{
			id: "welcome",
			targetId: "wizard-title",
			content: "Welcome to CryptoVisual! Let's learn how a secure hybrid handshake works.",
			position: "bottom"
		},
		{
			id: "step1-start",
			targetId: "keygen-button",
			content: "First, we generate an RSA key pair. This is the foundation of asymmetric encryption.",
			position: "right"
		},
		{
			id: "step2-aes",
			targetId: "aes-button",
			content: "Now we create a fast, symmetric AES session key to encrypt the actual message.",
			position: "right"
		},
		{
			id: "step3-viz",
			targetId: "matrix-canvas",
			content: "Watch the AES state matrix in action! This is where the data gets scrambled.",
			position: "top"
		},
		{
			id: "step4-wrap",
			targetId: "wrap-button",
			content: "We use the RSA public key to \"wrap\" the AES key so it can be sent safely.",
			position: "right"
		},
		{
			id: "step5-wire",
			targetId: "wire-canvas",
			content: "The encrypted bundle travels across the network. Only the receiver can open it.",
			position: "top"
		},
		{
			id: "step6-decrypt",
			targetId: "decrypt-button",
			content: "Finally, the receiver uses their private RSA key to recover the AES key and decrypt the message!",
			position: "right"
		}
	];
	useEffect(() => {
		if (!localStorage.getItem("cv_tutorial_completed")) setCurrentStep(0);
	}, []);
	const nextStep = () => {
		setCurrentStep((prev) => prev !== null && prev < steps.length - 1 ? prev + 1 : null);
	};
	const prevStep = () => {
		setCurrentStep((prev) => prev !== null && prev > 0 ? prev - 1 : null);
	};
	const closeTutorial = () => {
		setCurrentStep(null);
		localStorage.setItem("cv_tutorial_completed", "true");
	};
	return /* @__PURE__ */ jsx(TutorialContext.Provider, {
		value: {
			currentStep,
			nextStep,
			prevStep,
			closeTutorial,
			steps
		},
		children
	});
}
function useTutorial() {
	const context = useContext(TutorialContext);
	if (!context) throw new Error("useTutorial must be used within a TutorialProvider");
	return context;
}
//#endregion
//#region src/shared/components/TutorialTooltip.tsx
function TutorialTooltip() {
	const { currentStep, nextStep, prevStep, closeTutorial, steps } = useTutorial();
	const [coords, setCoords] = useState({
		top: 0,
		left: 0,
		width: 0,
		height: 0
	});
	useRef(null);
	useEffect(() => {
		if (currentStep === null) return;
		const target = document.getElementById(steps[currentStep].targetId);
		if (target) {
			const rect = target.getBoundingClientRect();
			setCoords({
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX,
				width: rect.width,
				height: rect.height
			});
		}
	}, [currentStep, steps]);
	if (currentStep === null) return null;
	const step = steps[currentStep];
	const { top, left, width, height } = coords;
	const getPositionStyles = () => {
		switch (step.position) {
			case "top": return {
				top: top - 10,
				left: left + width / 2,
				x: "-50%",
				y: "0"
			};
			case "bottom": return {
				top: top + height + 10,
				left: left + width / 2,
				x: "-50%",
				y: "0"
			};
			case "left": return {
				top: top + height / 2,
				left: left - 10,
				x: "0",
				y: "-50%"
			};
			case "right": return {
				top: top + height / 2,
				left: left + width + 10,
				x: "0",
				y: "-50%"
			};
		}
	};
	const style = getPositionStyles();
	return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			scale: .9
		},
		animate: {
			opacity: 1,
			scale: 1
		},
		exit: {
			opacity: 0,
			scale: .9
		},
		className: "fixed z-[100] pointer-events-auto",
		style: {
			top: style.top,
			left: style.left,
			transform: `translate(${style.x}, ${style.y})`
		},
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative rounded-xl bg-surface-800 border border-surface-600 p-4 shadow-2xl max-w-xs",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: closeTutorial,
					className: "absolute -top-2 -right-2 p-1 rounded-full bg-surface-700 text-surface-400 hover:text-white transition-colors",
					children: /* @__PURE__ */ jsx(X, { size: 14 })
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-surface-200 mb-4 leading-relaxed",
					children: step.content
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: prevStep,
							disabled: currentStep === 0,
							className: "p-1 rounded text-surface-500 hover:text-white disabled:opacity-30",
							children: /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-[10px] font-mono text-surface-500",
							children: [
								"Step ",
								currentStep + 1,
								" of ",
								steps.length
							]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: currentStep === steps.length - 1 ? closeTutorial : nextStep,
							className: "p-1 rounded text-symmetric-400 hover:text-symmetric-300",
							children: currentStep === steps.length - 1 ? "Finish" : /* @__PURE__ */ jsx(ChevronRight, { size: 18 })
						})
					]
				})
			]
		})
	}) });
}
//#endregion
//#region src/styles.css?url
var styles_default = "/assets/styles-hSo14mR9.css";
//#endregion
//#region src/routes/__root.tsx
function NotFound() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-surface-950",
		children: /* @__PURE__ */ jsxs("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "mb-2 text-6xl font-bold text-surface-300",
					children: "404"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mb-6 text-surface-500",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("a", {
					href: "/",
					className: "rounded-lg bg-symmetric-600 px-6 py-3 font-medium text-white transition-colors hover:bg-symmetric-500",
					children: "Return Home"
				})
			]
		})
	});
}
var Route$10 = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "CryptoVisual — The Hybrid Handshake" },
			{
				name: "description",
				content: "Interactive hybrid encryption visualization. Learn RSA, AES, and TLS handshakes through animated 3D graphics."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: "CryptoVisual — The Hybrid Handshake"
			},
			{
				property: "og:description",
				content: "Interactive hybrid encryption visualization. Learn RSA, AES, and TLS handshakes through animated 3D graphics."
			},
			{
				property: "og:url",
				content: "https://cryptovisual.dev"
			},
			{
				property: "og:image",
				content: "https://cryptovisual.dev/og-image.png"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "CryptoVisual — The Hybrid Handshake"
			},
			{
				name: "twitter:description",
				content: "Interactive hybrid encryption visualization. Learn RSA, AES, and TLS handshakes through animated 3D graphics."
			},
			{
				name: "twitter:image",
				content: "https://cryptovisual.dev/og-image.png"
			},
			{
				name: "theme-color",
				content: "#0a0a0f"
			},
			{
				name: "csp-report-only",
				content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws://localhost:4001;"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootDocument
});
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsx("body", {
			className: "min-h-screen bg-surface-950 text-white antialiased",
			children: /* @__PURE__ */ jsxs(ThemeProvider, { children: [
				/* @__PURE__ */ jsx("div", {
					className: "fixed top-4 right-4 z-[110]",
					children: /* @__PURE__ */ jsx(ThemeToggle, {})
				}),
				/* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxs(TutorialProvider, { children: [/* @__PURE__ */ jsx(Providers, { children }), /* @__PURE__ */ jsx(TutorialTooltip, {})] }) }),
				/* @__PURE__ */ jsx(PWAUpdatePrompt, {}),
				/* @__PURE__ */ jsx(Scripts, {})
			] })
		})]
	});
}
//#endregion
//#region src/routes/sandbox.tsx
var $$splitComponentImporter$9 = () => import("./sandbox-UHu3TiZp.js");
var Route$9 = createFileRoute("/sandbox")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
//#endregion
//#region src/routes/handshake.tsx
var $$splitComponentImporter$8 = () => import("./handshake-C1mqTFsC.js");
var Route$8 = createFileRoute("/handshake")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$7 = () => import("./routes-CIdeqdgu.js");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
//#endregion
//#region src/routes/sandbox/bit-flipper.tsx
var $$splitComponentImporter$6 = () => import("./bit-flipper-Bx3p1Asu.js");
var Route$6 = createFileRoute("/sandbox/bit-flipper")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
//#endregion
//#region src/routes/handshake.step-6.tsx
var $$splitComponentImporter$5 = () => import("./handshake.step-6-b52eGalf.js");
var Route$5 = createFileRoute("/handshake/step-6")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
//#endregion
//#region src/routes/handshake.step-5.tsx
var $$splitComponentImporter$4 = () => import("./handshake.step-5-BEQKWCgC.js");
var Route$4 = createFileRoute("/handshake/step-5")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
//#endregion
//#region src/routes/handshake.step-4.tsx
var $$splitComponentImporter$3 = () => import("./handshake.step-4-DVti7cgd.js");
var Route$3 = createFileRoute("/handshake/step-4")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
//#endregion
//#region src/routes/handshake.step-3.tsx
var $$splitComponentImporter$2 = () => import("./handshake.step-3-BP4df3zD.js");
var Route$2 = createFileRoute("/handshake/step-3")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
//#endregion
//#region src/routes/handshake.step-2.tsx
var $$splitComponentImporter$1 = () => import("./handshake.step-2-DUHVlW-O.js");
var Route$1 = createFileRoute("/handshake/step-2")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
//#endregion
//#region src/routes/handshake.step-1.tsx
var $$splitComponentImporter = () => import("./handshake.step-1-CtOsdw1n.js");
var Route = createFileRoute("/handshake/step-1")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
//#region src/routeTree.gen.ts
var SandboxRoute = Route$9.update({
	id: "/sandbox",
	path: "/sandbox",
	getParentRoute: () => Route$10
});
var HandshakeRoute = Route$8.update({
	id: "/handshake",
	path: "/handshake",
	getParentRoute: () => Route$10
});
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$10
});
var SandboxBitFlipperRoute = Route$6.update({
	id: "/bit-flipper",
	path: "/bit-flipper",
	getParentRoute: () => SandboxRoute
});
var HandshakeStep6Route = Route$5.update({
	id: "/step-6",
	path: "/step-6",
	getParentRoute: () => HandshakeRoute
});
var HandshakeStep5Route = Route$4.update({
	id: "/step-5",
	path: "/step-5",
	getParentRoute: () => HandshakeRoute
});
var HandshakeStep4Route = Route$3.update({
	id: "/step-4",
	path: "/step-4",
	getParentRoute: () => HandshakeRoute
});
var HandshakeStep3Route = Route$2.update({
	id: "/step-3",
	path: "/step-3",
	getParentRoute: () => HandshakeRoute
});
var HandshakeStep2Route = Route$1.update({
	id: "/step-2",
	path: "/step-2",
	getParentRoute: () => HandshakeRoute
});
var HandshakeRouteChildren = {
	HandshakeStep1Route: Route.update({
		id: "/step-1",
		path: "/step-1",
		getParentRoute: () => HandshakeRoute
	}),
	HandshakeStep2Route,
	HandshakeStep3Route,
	HandshakeStep4Route,
	HandshakeStep5Route,
	HandshakeStep6Route
};
var HandshakeRouteWithChildren = HandshakeRoute._addFileChildren(HandshakeRouteChildren);
var SandboxRouteChildren = { SandboxBitFlipperRoute };
var rootRouteChildren = {
	IndexRoute,
	HandshakeRoute: HandshakeRouteWithChildren,
	SandboxRoute: SandboxRoute._addFileChildren(SandboxRouteChildren)
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { getRouter };
