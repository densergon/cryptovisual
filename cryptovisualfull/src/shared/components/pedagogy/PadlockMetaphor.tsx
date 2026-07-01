import { Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";

export function PadlockMetaphor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 rounded-lg border border-asymmetric-500/30 bg-asymmetric-500/5 p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-asymmetric-400 uppercase tracking-wide">
        The Padlock Metaphor
      </h3>
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <Unlock size={32} className="text-asymmetric-400" />
          <span className="text-[10px] text-asymmetric-500 font-mono">
            Public Key
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Lock size={32} className="text-asymmetric-300" />
          <span className="text-[10px] text-asymmetric-500 font-mono">
            Private Key
          </span>
        </div>
        <div className="flex-1 text-xs text-surface-400 leading-relaxed">
          <p>
            Think of your <strong className="text-asymmetric-400">Public Key</strong> as an
            open padlock — you can hand it out to anyone. They snap it shut to
            encrypt a message, but only you have the <strong className="text-asymmetric-300">Private Key</strong> to
            open it.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
