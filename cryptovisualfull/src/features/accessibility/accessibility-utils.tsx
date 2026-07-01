import { useTranslation } from "react-i18next";

export function useAccessibilityAnnouncement() {
	const { t } = useTranslation();

	const announce = (
		message: string,
		priority: "polite" | "assertive" = "polite",
	) => {
		const announcer = document.getElementById("accessibility-announcer");
		if (announcer) {
			announcer.setAttribute("aria-live", priority);
			announcer.textContent = message;
		}
	};

	return { announce, t };
}

export function AccessibilityAnnouncer() {
	return (
		<div
			id="accessibility-announcer"
			role="status"
			aria-live="polite"
			aria-atomic="true"
			className="sr-only"
		/>
	);
}

export function SkipLink() {
	const { t } = useTranslation();

	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface-900 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			{t("accessibility.skipToContent")}
		</a>
	);
}
