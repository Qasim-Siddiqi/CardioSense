const RISK_CONFIG = {
  Low: {
    label: "Low Risk",
    dot: "#22d3ee",       // cyan-400
    text: "#22d3ee",
    bg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.30)",
    glow: "0 0 12px rgba(34,211,238,0.25)",
  },
  Medium: {
    label: "Medium Risk",
    dot: "#facc15",       // yellow-400
    text: "#facc15",
    bg: "rgba(250,204,21,0.10)",
    border: "rgba(250,204,21,0.30)",
    glow: "0 0 12px rgba(250,204,21,0.25)",
  },
  High: {
    label: "High Risk",
    dot: "#f87171",       // red-400
    text: "#f87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.30)",
    glow: "0 0 12px rgba(248,113,113,0.25)",
  },
};

const SIZE = {
  sm: { fontSize: "0.7rem",  padding: "2px 8px",  dotSize: 6 },
  md: { fontSize: "0.8rem",  padding: "4px 12px", dotSize: 8 },
  lg: { fontSize: "0.95rem", padding: "6px 16px", dotSize: 10 },
};

export default function RiskBadge({ level, size = "md" }) {
  // If level is unrecognised, show a neutral badge instead of crashing
  const config = RISK_CONFIG[level] ?? {
    label: level ?? "Unknown",
    dot: "#94a3b8",
    text: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.30)",
    glow: "none",
  };

  const sz = SIZE[size] ?? SIZE.md;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: config.text,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 999,
        padding: sz.padding,
        boxShadow: config.glow,
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Pulsing dot */}
      <span
        style={{
          width: sz.dotSize,
          height: sz.dotSize,
          borderRadius: "50%",
          background: config.dot,
          display: "inline-block",
          flexShrink: 0,
          animation: "riskPulse 2s ease-in-out infinite",
        }}
      />
      {config.label}

      {/* Inline keyframes — safe to repeat in DOM, browsers deduplicate */}
      <style>{`
        @keyframes riskPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </span>
  );
}
