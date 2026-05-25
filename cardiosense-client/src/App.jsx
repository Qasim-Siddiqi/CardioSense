import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import HealthForm from "./pages/HealthForm";
import ResultPage from "./pages/ResultPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from './pages/DoctorDashboard';

// Placeholder pages (will be replaced in upcoming commits)

function PlaceholderPage({ title, color = "cyan" }) {
  const { logout, fullName, role } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className={`px-6 py-1.5 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}>
        {role}
      </div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-slate-400 text-sm">Welcome, {fullName} — this page is coming in the next commit.</p>
      <button
        onClick={logout}
        className="mt-4 px-5 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

// Protected Route 

/**
 * Wraps a group of routes that require authentication.
 * Optionally restricts to a specific role ("Patient" | "Doctor").
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>          ← any authenticated user
 *   <Route element={<ProtectedRoute role="Doctor" />}>  ← Doctors only
 */
function ProtectedRoute({ role: requiredRole }) {
  const { isAuthenticated, role } = useAuth();

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → send to their actual dashboard
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "Doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace />;
  }

  // All good — render child routes via <Outlet />
  return <Outlet />;
}

// App 

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient-only routes */}
        <Route element={<ProtectedRoute role="Patient" />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />      

          {/* Real components mounted cleanly instead of the placeholders */}
          <Route path="/form" element={<HealthForm />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          
          {/* Keeping this if you still have links pointing to them elsewhere */}
          <Route path="/patient/submit" element={<PlaceholderPage title="Health Form" />} />
          <Route path="/patient/result" element={<PlaceholderPage title="Result" />} />
        </Route>

        {/* Doctor-only routes */}
        <Route element={<ProtectedRoute role="Doctor" />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>

        {/* Root redirect — send to the right dashboard if logged in */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={role === "Doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}