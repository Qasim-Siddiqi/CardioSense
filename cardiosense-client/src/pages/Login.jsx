import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

// Field definitions — rendered as a list so adding fields later is easy
const FIELDS = [
  { name: "email",    label: "Email address", type: "email",    placeholder: "you@example.com" },
  { name: "password", label: "Password",       type: "password", placeholder: "••••••••" },
];

export default function Login() {
  // State
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    if (!formData.email.trim())    newErrors.email    = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
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
      const authData = await login(formData);
      loginUser(authData);

      if (authData.role === "Doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Login failed. Please check your credentials.";
      setApiError(typeof msg === "string" ? msg : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Render
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      {/* Card */}
      <div className="w-full max-w-md">

        {/* Logo / heading */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <HeartIcon />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">CardioSense</h1>
          <p className="mt-1 text-slate-400 text-sm">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xl">

          {/* API-level error banner */}
          {apiError && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <span className="text-red-400 text-sm">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {FIELDS.map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}

            {/* Forgot password link */}
            <div className="text-right -mt-3 mb-5">
              <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2.5 rounded-xl transition-colors duration-200"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Redirect to register */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Doctor hint */}
        <p className="mt-4 text-center text-xs text-slate-600">
          Doctor account: doctor@cardiosense.com / Doctor@123
        </p>
      </div>
    </div>
  );
}

// Sub-components

function FormField({ name, label, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-5">
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

function HeartIcon() {
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
