import { motion } from "motion/react";

export function ConfusionDiffusionLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 rounded-lg border border-symmetric-500/30 bg-symmetric-500/5 p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-symmetric-400 uppercase tracking-wide">
        The Digital Blender — Confusion &amp; Diffusion
      </h3>
      <div className="space-y-3">
        <div className="rounded bg-surface-800 p-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-600/20 text-xs font-bold text-amber-400">
              C
            </span>
            <div>
              <span className="text-xs font-semibold text-amber-400">
                Confusion
              </span>
              <p className="mt-0.5 text-[11px] text-surface-400 leading-relaxed">
                Each ciphertext bit depends on multiple parts of the key, making
                it impossible to reverse-engineer the key from the output. In
                AES, <strong className="text-amber-400">SubBytes</strong> creates
                confusion by replacing bytes via the S-box lookup table.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded bg-surface-800 p-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-cyan-600/20 text-xs font-bold text-cyan-400">
              D
            </span>
            <div>
              <span className="text-xs font-semibold text-cyan-400">
                Diffusion
              </span>
              <p className="mt-0.5 text-[11px] text-surface-400 leading-relaxed">
                Changing one plaintext bit flips many ciphertext bits (the
                avalanche effect). In AES, <strong className="text-cyan-400">ShiftRows</strong> and{" "}
                <strong className="text-cyan-400">MixColumns</strong> spread a single
                byte&apos;s influence across the entire 4x4 state matrix.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
