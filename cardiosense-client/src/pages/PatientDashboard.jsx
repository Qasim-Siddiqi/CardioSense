import { useState, useEffect } from "react";
import { getMySubmissions } from "../api/healthApi";
import SubmissionCard from "../components/SubmissionCard";

function PatientDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the patient's own submissions when the page loads
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await getMySubmissions();
        const data = response.data;
        // Most recent first
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setSubmissions(sorted);
      } catch (err) {
        setError("Failed to load your submissions. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  // Loading state 
  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "80px" }}>
          Loading your history...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#ef4444", textAlign: "center", marginTop: "80px" }}>
          {error}
        </p>
      </div>
    );
  }

  // Empty state 
  if (submissions.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <h1 style={headingStyle}>My Health History</h1>
          <p style={subheadingStyle}>Your past cardio risk assessments</p>
        </div>
        <div style={emptyBoxStyle}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>🩺</p>
          <p style={{ color: "#e2e8f0", fontSize: "16px", marginBottom: "6px" }}>
            No submissions yet
          </p>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Complete a health form to see your risk history here.
          </p>
        </div>
      </div>
    );
  }

  // Main render: list of cards
  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={headingStyle}>My Health History</h1>
        <p style={subheadingStyle}>
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""} on
          record
        </p>
      </div>

      {/* Summary strip: counts per risk level */}
      <RiskSummary submissions={submissions} />

      {/* Card list */}
      <div>
        {submissions.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}

// Small helper component: risk level counts at the top
function RiskSummary({ submissions }) {
  // Count how many of each risk level exist
  const counts = submissions.reduce(
    (acc, s) => {
      acc[s.riskLevel] = (acc[s.riskLevel] || 0) + 1;
      return acc;
    },
    { Low: 0, Medium: 0, High: 0 }
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginBottom: "28px",
      }}
    >
      <SummaryTile label="Low Risk" count={counts.Low} color="#22c55e" bg="#1e3a2f" />
      <SummaryTile label="Medium Risk" count={counts.Medium} color="#eab308" bg="#2d2a1a" />
      <SummaryTile label="High Risk" count={counts.High} color="#ef4444" bg="#2d1f1f" />
    </div>
  );
}

function SummaryTile({ label, count, color, bg }) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: "10px",
        padding: "14px 16px",
        textAlign: "center",
      }}
    >
      <p style={{ color: color, fontSize: "26px", fontWeight: "600" }}>{count}</p>
      <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>{label}</p>
    </div>
  );
}

// Shared page-level styles
const pageStyle = {
  maxWidth: "620px",
  margin: "0 auto",
  padding: "40px 20px",
  fontFamily: "'DM Sans', sans-serif",
};

const headerStyle = {
  marginBottom: "28px",
};

const headingStyle = {
  color: "#e2e8f0",
  fontSize: "26px",
  fontWeight: "600",
  marginBottom: "4px",
};

const subheadingStyle = {
  color: "#64748b",
  fontSize: "14px",
};

const emptyBoxStyle = {
  background: "#112240",
  border: "1px solid #1e3a5f",
  borderRadius: "12px",
  padding: "48px 20px",
  textAlign: "center",
};

export default PatientDashboard;