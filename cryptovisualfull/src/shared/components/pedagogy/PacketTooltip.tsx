import { motion } from "motion/react";
import { useState } from "react";

interface PacketPart {
	label: string;
	color: string;
	description: string;
	size: string;
}

const PACKET_PARTS: PacketPart[] = [
	{
		label: "HEADER",
		color: "bg-blue-500",
		description:
			"Contains routing metadata: source/destination addresses, protocol version, sequence number, and checksum. 32 bytes total.",
		size: "32 B",
	},
	{
		label: "RSA_WRAPPED_KEY",
		color: "bg-amber-500",
		description:
			"The AES session key, encrypted with the recipient's RSA public key. Only the private key holder can unwrap this. 256 bytes for RSA-2048.",
		size: "256 B",
	},
	{
		label: "AES_ENCRYPTED_PAYLOAD",
		color: "bg-emerald-500",
		description:
			"The actual message data encrypted with AES-256-GCM. Includes the ciphertext plus a 12-byte IV and 16-byte authentication tag.",
		size: "Variable",
	},
];

export function PacketTooltip() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<div className="space-y-2">
			{PACKET_PARTS.map((part, i) => (
				<button
					type="button"
					key={part.label}
					className="relative w-full text-left"
					onMouseEnter={() => setHoveredIndex(i)}
					onMouseLeave={() => setHoveredIndex(null)}
					onFocus={() => setHoveredIndex(i)}
					onBlur={() => setHoveredIndex(null)}
				>
					<div className="flex cursor-help items-center gap-3 rounded-lg border border-surface-700 bg-surface-800/50 p-3 transition-colors hover:border-surface-600">
						<div className={`h-2.5 w-2.5 rounded-full ${part.color}`} />
						<div className="flex-1">
							<span
								className={`text-xs font-mono font-semibold ${part.color.replace("bg-", "text-")}`}
							>
								{part.label}
							</span>
							<span className="ml-2 text-[10px] text-surface-600">
								{part.size}
							</span>
						</div>
					</div>

					{hoveredIndex === i && (
						<motion.div
							initial={{ opacity: 0, y: 2 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.12 }}
							className="absolute left-0 z-20 mt-1 w-72 rounded-lg border border-surface-600 bg-surface-800 p-3 shadow-xl"
						>
							<p className="text-xs text-surface-300 leading-relaxed">
								{part.description}
							</p>
						</motion.div>
					)}
				</button>
			))}
		</div>
	);
}
