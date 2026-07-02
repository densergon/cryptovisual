import { useEffect, useState } from "react";

interface LiveRegionProps {
	message: string;
	prefix?: string;
}

export function LiveRegion({ message, prefix }: LiveRegionProps) {
	const [currentMessage, setCurrentMessage] = useState("");

	useEffect(() => {
		if (!message) return;
		const formatted = prefix ? `${prefix}: ${message}` : message;
		setCurrentMessage(formatted);
	}, [message, prefix]);

	if (!currentMessage) return null;

	return (
		<div aria-live="polite" aria-atomic="true" className="sr-only">
			{currentMessage}
		</div>
	);
}
