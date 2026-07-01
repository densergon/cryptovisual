import { motion } from "motion/react";
import { useEffect, useState } from "react";

const MOCK_PRIMES = [
  "2",
  "3",
  "5",
  "7",
  "11",
  "13",
  "17",
  "19",
  "23",
  "29",
  "31",
  "37",
  "41",
  "43",
  "47",
  "53",
  "59",
  "61",
  "67",
  "71",
  "73",
  "79",
  "83",
  "89",
  "97",
  "101",
  "103",
  "107",
  "109",
  "113",
  "127",
  "131",
  "137",
  "139",
  "149",
  "151",
  "157",
  "163",
  "167",
  "173",
  "179",
  "181",
  "191",
  "193",
  "197",
  "199",
  "211",
  "223",
  "227",
  "229",
  "233",
  "239",
  "241",
  "251",
  "257",
  "263",
  "269",
  "271",
  "277",
  "281",
  "283",
  "293",
  "307",
  "311",
  "313",
  "317",
  "331",
  "337",
  "347",
  "349",
  "353",
  "359",
  "367",
  "373",
  "379",
  "383",
  "389",
  "397",
  "401",
  "409",
  "419",
  "421",
  "431",
  "433",
  "439",
  "443",
  "449",
  "457",
  "461",
  "463",
  "467",
  "479",
  "487",
  "491",
  "499",
  "503",
  "509",
  "521",
  "523",
  "541",
  "547",
  "557",
  "563",
  "569",
  "571",
  "577",
  "587",
  "593",
  "599",
  "601",
  "607",
  "613",
  "617",
  "619",
  "631",
  "641",
  "643",
  "647",
  "653",
  "659",
  "661",
  "673",
  "677",
  "683",
  "691",
];

interface PrimeSearchTickerProps {
  isGenerating: boolean;
}

export function PrimeSearchTicker({ isGenerating }: PrimeSearchTickerProps) {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setDisplayIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % MOCK_PRIMES.length);
    }, 120);
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  const current = MOCK_PRIMES[displayIndex];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 overflow-hidden"
    >
      <div className="rounded-lg border border-asymmetric-500/20 bg-surface-900 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 font-mono shrink-0">
            Testing prime:
          </span>
          <motion.span
            key={current}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono text-asymmetric-400"
          >
            {current}
          </motion.span>
          <span className="text-[10px] text-surface-600 font-mono ml-auto">
            Miller–Rabin primality test
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
          <motion.div
            className="h-full rounded-full bg-asymmetric-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((displayIndex + 1) / MOCK_PRIMES.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-1 text-[10px] text-surface-600">
          RSA-2048 picks two large primes (~308 digits each). The product of
          these primes forms the modulus of your public key.
        </p>
      </div>
    </motion.div>
  );
}
