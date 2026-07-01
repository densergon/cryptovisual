import { useEffect, useState } from "react";

interface LiveRegionProps {
	message: string;
}

export function LiveRegion({ message }: LiveRegionProps) {
	const [currentMessage, setCurrentMessage] = useState("");

	useEffect(() => {
		setCurrentMessage(message);
	}, [message]);

	return (
		<div aria-live="polite" aria-atomic="true" className="sr-only">
			{currentMessage}
		</div>
	);
}
