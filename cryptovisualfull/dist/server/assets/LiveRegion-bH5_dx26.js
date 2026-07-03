import { useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/shared/components/LiveRegion.tsx
function LiveRegion({ message, prefix }) {
	const [currentMessage, setCurrentMessage] = useState("");
	useEffect(() => {
		if (!message) return;
		setCurrentMessage(prefix ? `${prefix}: ${message}` : message);
	}, [message, prefix]);
	if (!currentMessage) return null;
	return /* @__PURE__ */ jsx("div", {
		"aria-live": "polite",
		"aria-atomic": "true",
		className: "sr-only",
		children: currentMessage
	});
}
//#endregion
export { LiveRegion as t };
