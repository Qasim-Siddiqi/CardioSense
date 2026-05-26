// ResultPage.jsx
// Concepts covered:
//   useLocation  — reading router state passed from HealthForm
//   useEffect    — fetch from API on mount (fallback if state is missing)
//   useState     — loading / error / data states
//   conditional rendering — loading skeleton, error state, success state
//   rendering arrays — LLM advice bullet points
//   useParams    — reading :id from URL (for direct link fallback)
//   useNavigate  — back navigation

import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMySubmissionById } from "../api/healthApi";
import RiskBadge from "../components/RiskBadge";

// helpers

// Format ISO date string into readable form
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PK", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// Parse LLM advice into bullet array.
// The API returns a single string with "- " delimited bullets.
function parseBullets(text) {
  if (!text) return [];
  return text
    .split(/\n/)
    .map(line => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

// Score ring component — shows risk probability as a circle
function ScoreRing({ score }) {
  const pct   = Math.round(score * 100);
  const r     = 54;
  const circ  = 2 * Math.PI * r;
  const dash  = circ * score;

  // colour by probability
  const colour =
    score < 0.35 ? "#22d3ee" :
    score < 0.65 ? "#facc15" :
                   "#f87171";

  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={70} cy={70} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={10}
        />
        {/* Progress */}
        <circle
          cx={70} cy={70} r={r}
          fill="none"
          stroke={colour}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      {/* Centre text */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "1.8rem", fontWeight: 700, color: colour, lineHeight: 1 }}>
          {pct}%
        </span>
        <span style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Risk Score
        </span>
      </div>
    </div>
  );
}

// Individual stat pill
function StatPill({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(148,163,184,0.12)",
        borderRadius: 12,
        padding: "12px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.7rem", color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#e2e8f0" }}>{value}</div>
    </div>
  );
}

// Main component

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id }   = useParams();   // present when navigating to /result/:id directly

  // Try to get submission from router state first (fastest — no extra fetch)
  const [submission, setSubmission] = useState(location.state?.submission ?? null);
  const [loading, setLoading]       = useState(!submission);   // skip load if we already have data
  const [error, setError]           = useState("");

  // useEffect: runs after mount. Fetches from API only if router state was empty.
  useEffect(() => {
    if (submission) return;   // already have data — skip fetch

    const fetchId = id ?? null;
    if (!fetchId) {
      setError("No submission data found.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await getMySubmissionById(fetchId);
        setSubmission(res.data);
      } catch {
        setError("Could not load submission details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]); // dependency array — re-run if id changes

  // Loading state 
  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div className="spinner" />
          <p style={{ color: "#64748b", marginTop: 20 }}>Loading your results…</p>
          <style>{`
            .spinner {
              width: 40px; height: 40px; margin: 0 auto;
              border: 3px solid rgba(34,211,238,0.15);
              border-top-color: #22d3ee;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </PageShell>
    );
  }

  // Error state 

  if (error) {
    return (
      <PageShell>
        <div
          style={{
            textAlign: "center", padding: "80px 0",
            color: "#f87171",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: "1.1rem", marginBottom: 24 }}>{error}</p>
          <BackButton navigate={navigate} />
        </div>
      </PageShell>
    );
  }

  // Success state

  const bullets = parseBullets(submission.llmAdvice);

  // Derived display values — mapping raw ints to human-readable strings
  const genderLabel      = submission.gender === 1 ? "Male" : "Female";
  const cholesterolLabel = ["", "Normal", "Above Normal", "Well Above Normal"][submission.cholesterol] ?? submission.cholesterol;
  const glucoseLabel     = ["", "Normal", "Above Normal", "Well Above Normal"][submission.glucose]     ?? submission.glucose;
  const smokeLabel       = submission.smoke  === 1 ? "Yes" : "No";
  const alcoLabel        = submission.alco   === 1 ? "Yes" : "No";
  const activeLabel      = submission.active === 1 ? "Yes" : "No";

  return (
    <PageShell>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <BackButton navigate={navigate} />
        <span style={{ color: "#475569", fontSize: "0.8rem" }}>
          Submitted {formatDate(submission.createdAt)}
        </span>
      </div>

      {/* ── Hero: Score + Badge ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(148,163,184,0.1)",
          borderRadius: 20,
          padding: "36px 32px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <ScoreRing score={submission.riskScore} />
        <div style={{ marginTop: 20 }}>
          <RiskBadge level={submission.riskLevel} size="lg" />
        </div>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 12 }}>
          Cardiovascular risk probability based on your health profile
        </p>
      </div>

      {/* ── Health Stats Grid ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(148,163,184,0.08)",
          borderRadius: 20,
          padding: "28px 24px",
          marginBottom: 24,
        }}
      >
        <SectionHeading>Your Health Profile</SectionHeading>
        {/* Rendering an array of objects as a grid of pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Age",          value: `${submission.age} yrs`   },
            { label: "Gender",       value: genderLabel                },
            { label: "BMI",          value: submission.bmi?.toFixed(1) },
            { label: "Systolic BP",  value: `${submission.apHi} mmHg` },
            { label: "Diastolic BP", value: `${submission.apLo} mmHg` },
            { label: "Cholesterol",  value: cholesterolLabel           },
            { label: "Glucose",      value: glucoseLabel               },
            { label: "Smoking",      value: smokeLabel                 },
            { label: "Alcohol",      value: alcoLabel                  },
            { label: "Active",       value: activeLabel                },
          ].map(stat => (
            // key prop is required when rendering lists
            <StatPill key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </div>

      {/* ── LLM Advisory ── */}
      <div
        style={{
          background: "rgba(34,211,238,0.04)",
          border: "1px solid rgba(34,211,238,0.15)",
          borderRadius: 20,
          padding: "28px 24px",
          marginBottom: 24,
        }}
      >
        <SectionHeading accent>AI Health Advisory</SectionHeading>
        <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: 20, marginTop: -4 }}>
          Generated by AI based on your profile. Not a substitute for professional medical advice.
        </p>

        {/* Rendering array of bullet strings */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {bullets.map((bullet, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                gap: 12,
                color: "#cbd5e1",
                fontSize: "0.92rem",
                lineHeight: 1.6,
              }}
            >
              {/* Bullet icon */}
              <span
                style={{
                  flexShrink: 0,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: "rgba(34,211,238,0.15)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  color: "#22d3ee",
                  marginTop: 2,
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Patient Notes (if any) ── */}
      {submission.patientNotes && (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(148,163,184,0.08)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <SectionHeading>Your Notes</SectionHeading>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
            {submission.patientNotes}
          </p>
        </div>
      )}

      {/* ── Doctor Notes (if present) ── */}
      {submission.doctorNotes && (
        <div
          style={{
            background: "rgba(250,204,21,0.04)",
            border: "1px solid rgba(250,204,21,0.2)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <SectionHeading>Doctor's Notes</SectionHeading>
          <p style={{ color: "#fde68a", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
            {submission.doctorNotes}
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate("/form")}
          style={btnStyle("outline")}
        >
          New Assessment
        </button>
        <button
          onClick={() => navigate("/patient/dashboard")}
          style={btnStyle("primary")}
        >
          View My History →
        </button>
      </div>

    </PageShell>
  );
}

// layout helpers 

function PageShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020b18 0%, #051525 50%, #020d1f 100%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 16px 80px",
      }}
    >
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function SectionHeading({ children, accent = false }) {
  return (
    <h2
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: accent ? "#22d3ee" : "#94a3b8",
        marginTop: 0,
        marginBottom: 20,
        paddingBottom: 8,
        borderBottom: `1px solid ${accent ? "rgba(34,211,238,0.15)" : "rgba(148,163,184,0.1)"}`,
      }}
    >
      {children}
    </h2>
  );
}

function BackButton({ navigate }) {
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: "transparent",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 10,
        padding: "8px 16px",
        color: "#94a3b8",
        fontSize: "0.85rem",
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      ← Back
    </button>
  );
}

function btnStyle(variant) {
  const base = {
    flex: 1,
    padding: "13px 0",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: "0.95rem",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "none",
  };
  if (variant === "primary") {
    return {
      ...base,
      background: "linear-gradient(135deg, #22d3ee, #0891b2)",
      color: "#020b18",
      boxShadow: "0 0 24px rgba(34,211,238,0.3)",
    };
  }
  return {
    ...base,
    background: "transparent",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#94a3b8",
  };
}
