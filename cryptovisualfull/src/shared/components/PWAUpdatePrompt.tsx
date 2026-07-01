import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PWAInstallState {
	offlineReady: boolean;
	needRefresh: boolean;
	updateServiceWorker: () => void;
	cancel: () => void;
}

export function usePWAInstallPrompt(): PWAInstallState {
	const [offlineReady, setOfflineReady] = useState(false);
	const [needRefresh, setNeedRefresh] = useState(false);
	const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(
		null,
	);

	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;

		const registerSW = async () => {
			try {
				const mod = await import("virtual:pwa-register");
				const register = mod.registerSW;

				const result = register({
					onRegisteredSW(swUrl: string, _registration: ServiceWorkerRegistration | undefined) {
						console.log("[PWA] Service worker registered:", swUrl);
					},
					onRegisterError(error: Error) {
						console.error("[PWA] Service worker registration error:", error);
					},
					onOfflineReady() {
						console.log("[PWA] App ready to work offline");
						setOfflineReady(true);
					},
					onNeedRefresh() {
						console.log("[PWA] New content available");
						setNeedRefresh(true);
					},
				});

				setUpdateSW(() => result);
			} catch (err) {
				console.error("[PWA] Failed to register service worker:", err);
			}
		};

		registerSW();
	}, []);

	const handleUpdate = async () => {
		if (updateSW) {
			await updateSW();
		}
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
		cancel,
	};
}

export function PWAUpdatePrompt() {
	const { needRefresh, offlineReady, updateServiceWorker, cancel } =
		usePWAInstallPrompt();

	return (
		<AnimatePresence>
			{(needRefresh || offlineReady) && (
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 50 }}
					className="fixed bottom-4 right-4 z-[200] rounded-xl border border-surface-700 bg-surface-900 p-4 shadow-2xl max-w-sm"
				>
					<div className="flex items-start gap-3">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-symmetric-500/20">
							<RefreshCw size={20} className="text-symmetric-400" />
						</div>
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-white">
								{offlineReady
									? "App ready to work offline"
									: "New content available"}
							</h3>
							<p className="mt-1 text-xs text-surface-400">
								{offlineReady
									? "CryptoVisual will work without an internet connection."
									: "Click reload to get the latest version."}
							</p>
							<div className="mt-3 flex gap-2">
								{needRefresh && (
									<button
										type="button"
										onClick={updateServiceWorker}
										className="rounded-lg bg-symmetric-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-symmetric-500 transition-colors"
									>
										Reload
									</button>
								)}
								<button
									type="button"
									onClick={cancel}
									className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-surface-300 hover:bg-surface-600 transition-colors"
								>
									{offlineReady ? "Got it" : "Dismiss"}
								</button>
							</div>
						</div>
						<button
							type="button"
							onClick={cancel}
							className="text-surface-500 hover:text-surface-300 transition-colors"
							aria-label="Dismiss"
						>
							<X size={16} />
						</button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}