import { motion } from "motion/react";
import { usePedagogyMode } from "../../providers/PedagogyModeProvider";

const TICKER_EVENTS: Record<string, string> = {
  "Negotiating Cipher Suites...": "ClientHello → ServerHello: negotiating TLS version, cipher suites, and compression methods",
  "Verifying Server Certificate...": "ServerCertificate → CertificateVerify: server presents its X.509 certificate chain for validation",
  "Establishing Secure Channel...": "KeyExchange → ChangeCipherSpec: ephemeral Diffie-Hellman parameters exchanged, encryption enabled",
  "Sending wrapped session key...": "ClientKeyExchange: the RSA-wrapped AES session key is transmitted under the server's public key",
  "Sending encrypted payload...": "ApplicationData: all subsequent traffic is encrypted with AES-256-GCM using the negotiated session key",
  "Inspecting packet structure...": "Record Layer: each TLS record is framed with content type, version, length, and payload",
};

interface HandshakeTickerProps {
  currentPacket: string;
}

export function HandshakeTicker({ currentPacket }: HandshakeTickerProps) {
  const { isPedagogyMode } = usePedagogyMode();

  if (!isPedagogyMode || !currentPacket) return null;

  const detail = TICKER_EVENTS[currentPacket];

  return (
    <motion.div
      key={currentPacket}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-4 overflow-hidden rounded-lg border border-surface-700 bg-surface-900"
    >
      <div className="border-b border-surface-800 bg-surface-950/50 px-3 py-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-surface-500">
          TLS Handshake Trace
        </span>
      </div>
      <div className="space-y-1 p-3">
        {detail ? (
          <p className="text-[11px] text-surface-400 leading-relaxed">
            <span className="font-semibold text-symmetric-400">
              {currentPacket}
            </span>
            <br />
            {detail}
          </p>
        ) : (
          <p className="text-xs text-surface-400">{currentPacket}</p>
        )}
      </div>
    </motion.div>
  );
}
