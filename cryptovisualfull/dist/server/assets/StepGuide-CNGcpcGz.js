import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
//#region src/shared/components/StepGuide.tsx
var GUIDE_DISMISSED_KEY = "cv_guide_dismissed";
function StepGuide({ sections, autoOpen }) {
	const [isOpen, setIsOpen] = useState(() => {
		if (autoOpen) try {
			return localStorage.getItem(GUIDE_DISMISSED_KEY) !== "true";
		} catch {
			return false;
		}
		return false;
	});
	useEffect(() => {
		if (!autoOpen) return;
		if (isOpen) return;
		try {
			localStorage.setItem(GUIDE_DISMISSED_KEY, "true");
		} catch {}
	}, [autoOpen, isOpen]);
	const handleClose = () => {
		setIsOpen(false);
		try {
			localStorage.setItem(GUIDE_DISMISSED_KEY, "true");
		} catch {}
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: () => setIsOpen(true),
		className: "ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-700 text-surface-400 hover:bg-surface-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-asymmetric-500 transition-colors",
		"aria-label": "Learn about this step",
		children: /* @__PURE__ */ jsx(Info, { size: 14 })
	}), /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
		onClick: handleClose,
		children: /* @__PURE__ */ jsxs(motion.div, {
			initial: {
				opacity: 0,
				scale: .95,
				y: 10
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				scale: .95,
				y: 10
			},
			transition: { duration: .15 },
			onClick: (e) => e.stopPropagation(),
			className: "relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-surface-700 bg-surface-900 p-6 shadow-2xl",
			role: "dialog",
			"aria-label": "Step guide",
			children: [/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: handleClose,
				className: "absolute right-4 top-4 rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-asymmetric-500",
				"aria-label": "Close guide",
				children: /* @__PURE__ */ jsx(X, { size: 18 })
			}), /* @__PURE__ */ jsx("div", {
				className: "space-y-4",
				children: sections.map((section, i) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "mb-1 text-sm font-semibold text-asymmetric-400 uppercase tracking-wide",
					children: section.title
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-surface-300 leading-relaxed",
					children: section.body
				})] }, i))
			})]
		})
	}) })] });
}
//#endregion
export { StepGuide as t };
