import { motion } from "motion/react";
import { usePedagogyMode } from "../../providers/PedagogyModeProvider";

const OPERATION_DETAILS: Record<
  string,
  { label: string; description: string; color: string }
> = {
  "SubBytes: Swapping values to break linear patterns": {
    label: "SubBytes",
    description:
      "Each byte is replaced via the S-box lookup table. This non-linear step creates confusion — hiding the relationship between key and ciphertext.",
    color: "bg-amber-600",
  },
  "ShiftRows: Diffusing bytes across the matrix": {
    label: "ShiftRows",
    description:
      "Rows of the state matrix are shifted by different offsets. Bytes diffuse across columns, starting the avalanche effect.",
    color: "bg-cyan-600",
  },
  "MixColumns: Blending columns for total diffusion": {
    label: "MixColumns",
    description:
      "Each column is transformed via Galois Field multiplication. Every output byte now depends on all input bytes of that column.",
    color: "bg-violet-600",
  },
  "AddRoundKey: Binding the state to the secret key": {
    label: "AddRoundKey",
    description:
      "The state is XORed with the round key. This binds the key material into the ciphertext.",
    color: "bg-emerald-600",
  },
  "Avalanche Effect: See how 1 bit flip changes everything": {
    label: "Avalanche Effect",
    description:
      "A single bit difference in the plaintext causes roughly 50% of ciphertext bits to flip. This is the hallmark of a strong cipher.",
    color: "bg-rose-600",
  },
};

interface OperationLegendProps {
  currentOperation: string;
}

export function OperationLegend({ currentOperation }: OperationLegendProps) {
  const { isPedagogyMode } = usePedagogyMode();

  if (!isPedagogyMode || !currentOperation) return null;

  const detail = OPERATION_DETAILS[currentOperation];

  return (
    <motion.div
      key={currentOperation}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2 rounded-lg border border-surface-700 bg-surface-800/80 p-3"
    >
      {detail ? (
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${detail.color} text-[10px] font-bold text-white`}
          >
            {detail.label.charAt(0)}
          </span>
          <div>
            <span className="text-xs font-semibold text-white">
              {detail.label}
            </span>
            <p className="mt-0.5 text-[11px] text-surface-400 leading-relaxed">
              {detail.description}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-surface-400">{currentOperation}</p>
      )}
    </motion.div>
  );
}
