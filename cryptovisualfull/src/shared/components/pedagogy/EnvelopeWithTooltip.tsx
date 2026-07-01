import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface EnvelopeWithTooltipProps {
  wrappedKeyHex?: string;
}

export function EnvelopeWithTooltip({
  wrappedKeyHex,
}: EnvelopeWithTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className="relative w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 rounded bg-surface-800 p-3 transition-colors hover:bg-surface-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hybrid-500/20">
          <Mail size={16} className="text-hybrid-400" />
        </div>
        <div className="flex-1">
          <span className="text-xs text-surface-500">Wrapped Key</span>
          <p className="text-xs text-hybrid-300 font-mono truncate max-w-[300px]">
            {wrappedKeyHex ?? "0xB8 0x2A 0xF4 0x1C 0x9D 0xE3 ..."}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isHovered ? 10 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-hybrid-400"
        >
          <Mail size={20} />
        </motion.div>
      </div>

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-2 left-1/2 z-20 w-64 -translate-x-1/2 -translate-y-full"
        >
          <div className="rounded-lg border border-surface-600 bg-surface-800 p-3 shadow-xl">
            <p className="text-xs text-surface-300 leading-relaxed">
              The AES session key is encrypted with the RSA public key and
              placed inside this <strong className="text-hybrid-400">digital envelope</strong>.
              Only the holder of the corresponding RSA private key can open it.
            </p>
          </div>
        </motion.div>
      )}
    </button>
  );
}
