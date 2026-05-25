import { useState, useEffect } from "react";
import {
  getAllSubmissions,
  getSubmissionById,
  addNotes,
} from "../api/healthApi";
import RiskBadge from "../components/RiskBadge";
import Pagination from "../components/Pagination";

// helpers

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function riskScore(raw) {
  return (raw * 100).toFixed(1) + "%";
}

function genderLabel(g) {
  return g === 1 ? "Female" : "Male";
}

// SubmissionRow

function SubmissionRow({ submission, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onClick={() => onSelect(submission)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        background: hovered ? "#1e293b" : "transparent",
        transition: "background 0.15s",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <td style={td}>Patient #{submission.userId}</td>
      <td style={td}>{formatDate(submission.createdAt)}</td>
      <td style={td}>
        <RiskBadge level={submission.riskLevel} />
      </td>
      <td style={td}>{riskScore(submission.riskScore)}</td>
      <td style={td}>
        {submission.apHi}/{submission.apLo}
      </td>
      <td style={td}>{submission.bmi.toFixed(1)}</td>
      <td style={td}>
        {submission.doctorNotes ? (
          <span style={{ color: "#06b6d4", fontSize: "12px" }}>✓ Added</span>
        ) : (
          <span style={{ color: "#475569", fontSize: "12px" }}>—</span>
        )}
      </td>
    </tr>
  );
}

const td = {
  padding: "12px 16px",
  color: "#cbd5e1",
  fontSize: "14px",
  fontFamily: "DM Sans, sans-serif",
  verticalAlign: "middle",
};

// Modal

function SubmissionModal({ submission, onClose, onNotesSaved }) {
  const [notes, setNotes] = useState(submission.doctorNotes || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSaveNotes() {
    if (!notes.trim()) return;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      await addNotes(submission.id, notes.trim());
      setSaved(true);
      onNotesSaved(submission.id, notes.trim()); // update parent list
    } catch {
      setSaveError("Failed to save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const statItem = (label, value) => (
    <div
      key={label}
      style={{
        background: "#0b1120",
        borderRadius: "8px",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "600" }}>
        {value}
      </span>
    </div>
  );

  const llmBullets = (submission.llmAdvice || "")
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          fontFamily: "DM Sans, sans-serif",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                color: "#f1f5f9",
                fontSize: "20px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              Patient #{submission.userId}
            </h2>
            <p
              style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}
            >
              Submission #{submission.id} · {formatDate(submission.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "22px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Risk + Score */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <RiskBadge level={submission.riskLevel} />
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>
            Risk score:{" "}
            <strong style={{ color: "#f1f5f9" }}>
              {riskScore(submission.riskScore)}
            </strong>
          </span>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {statItem("Age", submission.age)}
          {statItem("Gender", genderLabel(submission.gender))}
          {statItem("BMI", submission.bmi.toFixed(1))}
          {statItem("Blood Pressure", `${submission.apHi}/${submission.apLo}`)}
          {statItem(
            "Cholesterol",
            ["", "Normal", "Above Normal", "Well Above"][
              submission.cholesterol
            ] || submission.cholesterol,
          )}
          {statItem(
            "Glucose",
            ["", "Normal", "Above Normal", "Well Above"][submission.glucose] ||
              submission.glucose,
          )}
          {statItem("Smoking", submission.smoke ? "Yes" : "No")}
          {statItem("Alcohol", submission.alco ? "Yes" : "No")}
          {statItem("Active", submission.active ? "Yes" : "No")}
        </div>

        {/* LLM Advice */}
        {llmBullets.length > 0 && (
          <div
            style={{
              background: "#0b1120",
              border: "1px solid #1e293b",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#06b6d4",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 10px",
              }}
            >
              LLM Advisory
            </p>
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              {llmBullets.map((bullet, i) => (
                <li
                  key={i}
                  style={{
                    color: "#cbd5e1",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    marginBottom: "4px",
                  }}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Patient notes (read-only) */}
        {submission.patientNotes && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                color: "#64748b",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 6px",
              }}
            >
              Patient Notes
            </p>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              {submission.patientNotes}
            </p>
          </div>
        )}

        {/* Doctor notes */}
        <div>
          <p
            style={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 8px",
            }}
          >
            Doctor Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your clinical observations or recommendations..."
            rows={4}
            style={{
              width: "100%",
              background: "#0b1120",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              padding: "12px",
              color: "#f1f5f9",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {saveError && (
            <p
              style={{ color: "#f87171", fontSize: "13px", margin: "6px 0 0" }}
            >
              {saveError}
            </p>
          )}
          {saved && (
            <p
              style={{ color: "#4ade80", fontSize: "13px", margin: "6px 0 0" }}
            >
              Notes saved successfully.
            </p>
          )}
          <button
            onClick={handleSaveNotes}
            disabled={saving || !notes.trim()}
            style={{
              marginTop: "12px",
              padding: "10px 20px",
              background: saving || !notes.trim() ? "#1e293b" : "#06b6d4",
              color: saving || !notes.trim() ? "#475569" : "#0b1120",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              cursor: saving || !notes.trim() ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// DoctorDashboard

const RISK_FILTERS = ["All", "Low", "Medium", "High"];
const PAGE_SIZE = 10;

export default function DoctorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    fetchSubmissions();
  }, [page, riskFilter]);

  //   async function fetchSubmissions() {
  //     setLoading(true);
  //     setError('');
  //     try {
  //       const levelParam = riskFilter === 'All' ? '' : riskFilter;
  //       const data = await getAllSubmissions(levelParam, page, PAGE_SIZE);
  //       setSubmissions(data.items);
  //       setTotalCount(data.totalCount);
  //     } catch {
  //       setError('Failed to load submissions. Please try again.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  async function fetchSubmissions() {
  setLoading(true);
  setError('');
  try {
    const params = { page, pageSize: PAGE_SIZE };
    if (riskFilter !== 'All') params.riskLevel = riskFilter;

    const response = await getAllSubmissions(params);  
    const data = response.data;                        
    setSubmissions(data.items);
    setTotalCount(data.totalCount);
  } catch (err) {
    console.error('Fetch error:', err);
    setError('Failed to load submissions. Please try again.');
  } finally {
    setLoading(false);
  }
}

  function handleFilterChange(level) {
    setRiskFilter(level);
    setPage(1); // reset to first page on filter change
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // When notes are saved in modal, update the submission in the local list too
  function handleNotesSaved(id, notes) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, doctorNotes: notes } : s)),
    );
    // Also update selectedSubmission so modal reflects the save instantly
    setSelectedSubmission((prev) =>
      prev?.id === id ? { ...prev, doctorNotes: notes } : prev,
    );
  }

  // render

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        padding: "40px 24px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              color: "#f1f5f9",
              fontSize: "26px",
              fontWeight: "700",
              margin: "0 0 6px",
            }}
          >
            Patient Submissions
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            {totalCount > 0
              ? `${totalCount} total record${totalCount !== 1 ? "s" : ""}`
              : "All patient records"}
          </p>
        </div>

        {/* Risk filter buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {RISK_FILTERS.map((level) => {
            const isActive = riskFilter === level;
            const colors = {
              All: "#06b6d4",
              Low: "#06b6d4",
              Medium: "#eab308",
              High: "#ef4444",
            };
            return (
              <button
                key={level}
                onClick={() => handleFilterChange(level)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  border: `1px solid ${isActive ? colors[level] : "#1e293b"}`,
                  background: isActive ? colors[level] + "20" : "#111827",
                  color: isActive ? colors[level] : "#64748b",
                  fontWeight: isActive ? "600" : "400",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading && (
          <p
            style={{ color: "#64748b", textAlign: "center", marginTop: "60px" }}
          >
            Loading submissions…
          </p>
        )}

        {!loading && error && (
          <div
            style={{
              background: "#1f1515",
              border: "1px solid #7f1d1d",
              borderRadius: "10px",
              padding: "16px 20px",
              color: "#f87171",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#475569",
              marginTop: "80px",
              fontSize: "15px",
            }}
          >
            No submissions found
            {riskFilter !== "All" ? ` for ${riskFilter} risk` : ""}.
          </div>
        )}

        {/* Table */}
        {!loading && !error && submissions.length > 0 && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#0f172a",
                    borderBottom: "1px solid #1e293b",
                  }}
                >
                  {[
                    "Patient",
                    "Date",
                    "Risk",
                    "Score",
                    "BP",
                    "BMI",
                    "Notes",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        color: "#475569",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <SubmissionRow
                    key={s.id}
                    submission={s}
                    onSelect={setSelectedSubmission}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal */}
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onNotesSaved={handleNotesSaved}
        />
      )}
    </div>
  );
}
