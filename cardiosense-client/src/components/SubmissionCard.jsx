import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RiskBadge from "./RiskBadge";

// Responsive hook
function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}

function SubmissionCard({ submission }) {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  // Format the date into something readable
  const formattedDate = new Date(submission.createdAt).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Convert 0–1 score to percentage string
  const scorePercent = (submission.riskScore * 100).toFixed(1) + "%";

  function handleClick() {
    navigate(`/result/${submission.id}`);
  }

  return (
    <div
      onClick={handleClick}
      style={{
        background: "#112240",
        border: "1px solid #1e3a5f",
        borderRadius: "12px",
        padding: isMobile ? "14px" : "20px",
        cursor: "pointer",
        marginBottom: "14px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#06b6d4")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e3a5f")}
    >
      {/* Top row: date + badge on left, score on right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>
            {formattedDate}
          </p>
          <RiskBadge level={submission.riskLevel} />
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "2px" }}>
            Risk Score
          </p>
          <p style={{ color: "#06b6d4", fontSize: "22px", fontWeight: "600" }}>
            {scorePercent}
          </p>
        </div>
      </div>

      {/* Stats row: BP, BMI, Age — 3 cols on desktop, 2 cols on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div style={statBoxStyle}>
          <p style={statLabelStyle}>Blood Pressure</p>
          <p style={statValueStyle}>
            {submission.apHi} / {submission.apLo}
          </p>
        </div>

        <div style={statBoxStyle}>
          <p style={statLabelStyle}>BMI</p>
          <p style={statValueStyle}>{submission.bmi}</p>
        </div>

        <div style={statBoxStyle}>
          <p style={statLabelStyle}>Age</p>
          <p style={statValueStyle}>{submission.age} yrs</p>
        </div>
      </div>

      {/* Bottom row: patient notes preview + link hint */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",           // ensures spacing if content gets close
        }}
      >
        <p
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontStyle: "italic",
            flex: 1,             // takes available space instead of hardcoded 300px
            minWidth: 0,         // allows text-overflow to work inside flex item
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {submission.patientNotes
            ? `📝 "${submission.patientNotes}"`
            : "📝 No personal notes added"}
        </p>
        <span
          style={{
            color: "#06b6d4",
            fontSize: "12px",
            fontWeight: "500",
            flexShrink: 0,       // never lets "View Details →" wrap or disappear
          }}
        >
          View Details →
        </span>
      </div>
    </div>
  );
}

// Shared styles for the three stat boxes
const statBoxStyle = {
  background: "#0d1b2a",
  borderRadius: "8px",
  padding: "10px 12px",
};

const statLabelStyle = {
  color: "#64748b",
  fontSize: "11px",
  marginBottom: "3px",
};

const statValueStyle = {
  color: "#e2e8f0",
  fontSize: "14px",
  fontWeight: "500",
};

export default SubmissionCard;
