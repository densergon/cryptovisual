import { motion } from "motion/react";

interface PerformanceComparisonProps {
  rsaDurationMs?: number;
  aesDurationMs?: number;
}

export function PerformanceComparison({
  rsaDurationMs,
  aesDurationMs,
}: PerformanceComparisonProps) {
  if (rsaDurationMs == null && aesDurationMs == null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 rounded-lg border border-symmetric-500/30 bg-surface-900 p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-symmetric-400 uppercase tracking-wide">
        Performance: AES vs RSA
      </h3>
      <div className="space-y-3">
        {rsaDurationMs != null && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-asymmetric-400 font-mono">RSA-2048 Keygen</span>
              <span className="text-surface-400 font-mono">
                {rsaDurationMs.toFixed(1)}ms
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-800">
              <motion.div
                className="h-full rounded-full bg-asymmetric-500"
                initial={{ width: "0%" }}
                animate={{
                  width: `${Math.min((rsaDurationMs / 500) * 100, 100)}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        {aesDurationMs != null && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-symmetric-400 font-mono">
                AES-256 Keygen
              </span>
              <span className="text-surface-400 font-mono">
                {aesDurationMs.toFixed(1)}ms
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-800">
              <motion.div
                className="h-full rounded-full bg-symmetric-500"
                initial={{ width: "0%" }}
                animate={{
                  width: `${Math.min((aesDurationMs / 500) * 100, 100)}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-[10px] text-surface-600 italic">
        AES key generation is orders of magnitude faster than RSA. This is why
        hybrid encryption uses RSA only for key exchange.
      </p>
    </motion.div>
  );
}
