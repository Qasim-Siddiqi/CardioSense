import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitHealth } from "../api/healthApi";

// ─── tiny reusable sub-components (props, JSX) 

function Label({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#94a3b8",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function FieldWrap({ children, col = 1 }) {
  return (
    <div style={{ gridColumn: `span ${col}` }}>
      {children}
    </div>
  );
}

// Styled number input
function NumInput({ value, onChange, min, max, step = 1, placeholder }) {
  return (
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 10,
        padding: "10px 14px",
        color: "#e2e8f0",
        fontSize: "0.95rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
      onFocus={e => (e.target.style.borderColor = "#22d3ee")}
      onBlur={e  => (e.target.style.borderColor = "rgba(148,163,184,0.2)")}
    />
  );
}

// Select dropdown
function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        background: "#0f1f35",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 10,
        padding: "10px 14px",
        color: "#e2e8f0",
        fontSize: "0.95rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        boxSizing: "border-box",
        cursor: "pointer",
      }}
      onFocus={e => (e.target.style.borderColor = "#22d3ee")}
      onBlur={e  => (e.target.style.borderColor = "rgba(148,163,184,0.2)")}
    >
      {/* Rendering a list of option elements from an array — list rendering */}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Toggle button group (Yes / No)
function ToggleGroup({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"          // prevent form submission on click
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: active
                ? "1px solid #22d3ee"
                : "1px solid rgba(148,163,184,0.2)",
              background: active ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
              color: active ? "#22d3ee" : "#94a3b8",
              fontWeight: 600,
              fontSize: "0.85rem",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Small inline section title helper
function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#22d3ee",
        marginBottom: 16,
        marginTop: 0,
        paddingBottom: 8,
        borderBottom: "1px solid rgba(34,211,238,0.15)",
      }}
    >
      {children}
    </h2>
  );
}

// Initial form state

const INITIAL = {
  age: "",
  gender: 1,          // 1=male, 0=female (matches DTO comment — note: your DTO says 0=female,1=male)
  apHi: "",
  apLo: "",
  cholesterol: 1,
  glucose: 1,
  smoke: 0,
  alco: 0,
  active: 1,
  bmi: "",
  patientNotes: "",
};

// Main component

export default function HealthForm() {
  // useState: all form fields in one object
  const [form, setForm] = useState(INITIAL);
  // useState: submission state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const navigate = useNavigate();

  // Generic field updater — merges new value into form state
  // This pattern keeps every input controlled with a single handler
  const setField = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // onChange handler for text/number inputs
  const handleChange = (field) => (e) => setField(field, e.target.value);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();   // prevent browser page reload
    setError("");
    setLoading(true);

    // Build the payload — convert numeric strings to numbers
    // SubmitHealthDto expects: Age(int), Gender(int), ApHi(int), ApLo(int),
    //   Cholesterol(int), Glucose(int), Smoke(int), Alco(int), Active(int),
    //   BMI(float), PatientNotes(string?)
    const payload = {
      age:          parseInt(form.age, 10),
      gender:       Number(form.gender),
      apHi:         parseInt(form.apHi, 10),
      apLo:         parseInt(form.apLo, 10),
      cholesterol:  Number(form.cholesterol),
      glucose:      Number(form.glucose),
      smoke:        Number(form.smoke),
      alco:         Number(form.alco),
      active:       Number(form.active),
      bmi:          parseFloat(form.bmi),
      patientNotes: form.patientNotes.trim() || null,
    };

    // Basic client-side validation
    if (
      isNaN(payload.age)  || payload.age  < 1 || payload.age  > 120 ||
      isNaN(payload.apHi) || payload.apHi < 50 || payload.apHi > 250 ||
      isNaN(payload.apLo) || payload.apLo < 30 || payload.apLo > 200 ||
      isNaN(payload.bmi)  || payload.bmi  < 5  || payload.bmi  > 80
    ) {
      setError("Please fill in all fields with valid values.");
      setLoading(false);
      return;
    }

    try {
      const response = await submitHealth(payload);
      // Navigate to ResultPage, passing the full submission as router state
      // ResultPage reads this via useLocation().state
      navigate("/result", { state: { submission: response.data } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Submission failed. Please try again.";
      setError(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  // Render

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020b18 0%, #051525 50%, #020d1f 100%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 16px 80px",
      }}
    >
      {/* Subtle background grid */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.25)",
              marginBottom: 16,
              fontSize: 24,
            }}
          >
            🫀
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: "#f1f5f9",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Health Assessment
          </h1>
          <p style={{ color: "#64748b", marginTop: 8, fontSize: "0.95rem" }}>
            Fill in your health profile to get your cardiovascular risk analysis
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(148,163,184,0.1)",
            borderRadius: 20,
            padding: "36px 32px",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* ── Section: Basic Info ── */}
          <SectionTitle>Basic Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

            <FieldWrap>
              <Label>Age (years)</Label>
              <NumInput
                value={form.age}
                onChange={handleChange("age")}
                min={1} max={120}
                placeholder="e.g. 45"
              />
            </FieldWrap>

            <FieldWrap>
              <Label>Gender</Label>
              <ToggleGroup
                value={form.gender}
                onChange={(val) => setField("gender", val)}
                options={[
                  { label: "Male",   value: 1 },
                  { label: "Female", value: 0 },
                ]}
              />
            </FieldWrap>

            <FieldWrap>
              <Label>BMI</Label>
              <NumInput
                value={form.bmi}
                onChange={handleChange("bmi")}
                min={5} max={80} step={0.1}
                placeholder="e.g. 23.5"
              />
            </FieldWrap>
          </div>

          {/* ── Section: Blood Pressure ── */}
          <SectionTitle>Blood Pressure</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

            <FieldWrap>
              <Label>Systolic (AP Hi)</Label>
              <NumInput
                value={form.apHi}
                onChange={handleChange("apHi")}
                min={50} max={250}
                placeholder="e.g. 120"
              />
            </FieldWrap>

            <FieldWrap>
              <Label>Diastolic (AP Lo)</Label>
              <NumInput
                value={form.apLo}
                onChange={handleChange("apLo")}
                min={30} max={200}
                placeholder="e.g. 80"
              />
            </FieldWrap>
          </div>

          {/* ── Section: Lab Results ── */}
          <SectionTitle>Lab Results</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

            <FieldWrap>
              <Label>Cholesterol Level</Label>
              <SelectInput
                value={form.cholesterol}
                onChange={(e) => setField("cholesterol", Number(e.target.value))}
                options={[
                  { value: 1, label: "Normal (1)" },
                  { value: 2, label: "Above Normal (2)" },
                  { value: 3, label: "Well Above Normal (3)" },
                ]}
              />
            </FieldWrap>

            <FieldWrap>
              <Label>Glucose Level</Label>
              <SelectInput
                value={form.glucose}
                onChange={(e) => setField("glucose", Number(e.target.value))}
                options={[
                  { value: 1, label: "Normal (1)" },
                  { value: 2, label: "Above Normal (2)" },
                  { value: 3, label: "Well Above Normal (3)" },
                ]}
              />
            </FieldWrap>
          </div>

          {/* ── Section: Lifestyle ── */}
          <SectionTitle>Lifestyle</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }}>

            <FieldWrap>
              <Label>Smoking</Label>
              <ToggleGroup
                value={form.smoke}
                onChange={(val) => setField("smoke", val)}
                options={[{ label: "No", value: 0 }, { label: "Yes", value: 1 }]}
              />
            </FieldWrap>

            <FieldWrap>
              <Label>Alcohol</Label>
              <ToggleGroup
                value={form.alco}
                onChange={(val) => setField("alco", val)}
                options={[{ label: "No", value: 0 }, { label: "Yes", value: 1 }]}
              />
            </FieldWrap>

            <FieldWrap>
              <Label>Physically Active</Label>
              <ToggleGroup
                value={form.active}
                onChange={(val) => setField("active", val)}
                options={[{ label: "No", value: 0 }, { label: "Yes", value: 1 }]}
              />
            </FieldWrap>
          </div>

          {/* ── Section: Notes ── */}
          <SectionTitle>Additional Notes</SectionTitle>
          <div style={{ marginBottom: 32 }}>
            <Label>Patient Notes (optional)</Label>
            <textarea
              value={form.patientNotes}
              onChange={handleChange("patientNotes")}
              rows={3}
              placeholder="Any symptoms, concerns, or context for your doctor..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#e2e8f0",
                fontSize: "0.95rem",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#22d3ee")}
              onBlur={e  => (e.target.style.borderColor = "rgba(148,163,184,0.2)")}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#f87171",
                fontSize: "0.875rem",
                marginBottom: 20,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "rgba(34,211,238,0.3)"
                : "linear-gradient(135deg, #22d3ee, #0891b2)",
              color: loading ? "rgba(255,255,255,0.5)" : "#020b18",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 0 24px rgba(34,211,238,0.3)",
            }}
          >
            {loading ? "Analysing…" : "Analyse My Risk →"}
          </button>
        </form>
      </div>
    </div>
  );
}


