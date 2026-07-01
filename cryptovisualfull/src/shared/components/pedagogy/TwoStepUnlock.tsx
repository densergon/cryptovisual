import { Lock, Unlock, KeyRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function TwoStepUnlock() {
  const [phase, setPhase] = useState<"envelope" | "decrypt" | "done">(
    "envelope",
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("decrypt"), 1500);
    const t2 = setTimeout(() => setPhase("done"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wide">
        Two-Step Unlock
      </h3>
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {phase === "envelope" && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-asymmetric-500/30 bg-asymmetric-500/5 p-3"
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-asymmetric-400" />
                <div>
                  <span className="text-xs font-semibold text-asymmetric-400">
                    1. Unwrap Envelope
                  </span>
                  <p className="text-[11px] text-surface-400">
                    RSA private key decrypts the wrapped session key
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {phase === "decrypt" && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-symmetric-500/30 bg-symmetric-500/5 p-3"
            >
              <div className="flex items-center gap-3">
                <KeyRound size={20} className="text-symmetric-400" />
                <div>
                  <span className="text-xs font-semibold text-symmetric-400">
                    2. Decrypt Message
                  </span>
                  <p className="text-[11px] text-surface-400">
                    Recovered AES session key decrypts the payload
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-success/30 bg-success/5 p-3"
            >
              <div className="flex items-center gap-3">
                <Unlock size={20} className="text-success" />
                <div>
                  <span className="text-xs font-semibold text-success">
                    3. Integrity Verified
                  </span>
                  <p className="text-[11px] text-surface-400">
                    Message authentic and untampered — hybrid handshake complete
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
