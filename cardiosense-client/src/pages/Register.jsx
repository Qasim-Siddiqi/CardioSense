import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

// Field definitions as an array of objects — easy to extend
const FIELDS = [
  { name: "fullName", label: "Full name",          type: "text",     placeholder: "Ali Hassan" },
  { name: "email",    label: "Email address",       type: "email",    placeholder: "you@example.com" },
  { name: "password", label: "Password",            type: "password", placeholder: "Min. 8 characters" },
  { name: "confirm",  label: "Confirm password",    type: "password", placeholder: "Repeat your password" },
];

export default function Register() {
  // State
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirm: "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  // Handlers

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  }

  function validate() {
    const newErrors = {};

    if (!formData.fullName.trim())
      newErrors.fullName = "Full name is required.";

    if (!formData.email.trim())
      newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address.";

    if (!formData.password)
      newErrors.password = "Password is required.";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";

    if (!formData.confirm)
      newErrors.confirm = "Please confirm your password.";
    else if (formData.confirm !== formData.password)
      newErrors.confirm = "Passwords do not match.";

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      // Send only the fields the API expects — exclude `confirm`
      const { confirm, ...payload } = formData;
      const authData = await register(payload);   // { token, role, fullName }
      loginUser(authData);
      navigate("/patient/dashboard");             // new users are always Patients
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please try again.";
      setApiError(typeof msg === "string" ? msg : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Render
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <HeartIcon />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create account</h1>
          <p className="mt-1 text-slate-400 text-sm">Monitor your heart health with CardioSense</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xl">

          {apiError && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <span className="text-red-400 text-sm">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Render all fields from the FIELDS array */}
            {FIELDS.map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}

            {/* Password strength hint */}
            <PasswordStrengthBar password={formData.password} />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2.5 rounded-xl transition-colors duration-200"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function FormField({ name, label, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm outline-none transition-colors duration-200
          focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
          ${error ? "border-red-500" : "border-slate-700 hover:border-slate-600"}`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/**
 * Visual password strength bar.
 * Demonstrates: computed value from props, conditional rendering, array.map.
 */
function PasswordStrengthBar({ password }) {
  if (!password) return null;

  // Criteria as an array of objects
  const criteria = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase",     met: /[A-Z]/.test(password) },
    { label: "Number",        met: /\d/.test(password) },
    { label: "Symbol",        met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = criteria.filter((c) => c.met).length; // 0–4

  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mb-4 -mt-1">
      {/* Strength bars */}
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300
              ${i < strength ? colors[strength - 1] : "bg-slate-700"}`}
          />
        ))}
      </div>
      {/* Criteria pills — flex-wrap already handles small screens */}
      <div className="flex flex-wrap gap-1.5">
        {criteria.map((c) => (
          <span
            key={c.label}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors
              ${c.met ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-500"}`}
          >
            {c.met ? "✓ " : ""}{c.label}
          </span>
        ))}
      </div>
      {strength > 0 && (
        <p className={`mt-1 text-xs font-medium ${["text-red-400","text-orange-400","text-yellow-400","text-green-400"][strength-1]}`}>
          {labels[strength - 1]}
        </p>
      )}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
